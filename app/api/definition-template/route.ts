import ExcelJS from "exceljs";
import { importTemplateSheets } from "@/lib/scan/definition/import-template";

export const runtime = "nodejs";

function formatRequired(required: boolean): string {
  return required ? "Ja" : "Nee";
}

export async function GET() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "KWEEKERS Groeimodel";
  workbook.created = new Date();
  workbook.modified = new Date();

  importTemplateSheets.forEach((sheetDefinition) => {
    const worksheet = workbook.addWorksheet(sheetDefinition.title);

    worksheet.columns = [
      { header: "Kolom", key: "label", width: 28 },
      { header: "Key", key: "key", width: 32 },
      { header: "Verplicht", key: "required", width: 14 },
      { header: "Omschrijving", key: "description", width: 70 },
      { header: "Voorbeeld", key: "example", width: 45 },
    ];

    worksheet.addRow({
      label: sheetDefinition.title,
      key: sheetDefinition.key,
      required: "",
      description: sheetDefinition.description,
      example: "",
    });

    worksheet.addRow({});

    sheetDefinition.columns.forEach((column) => {
      worksheet.addRow({
        label: column.label,
        key: column.key,
        required: formatRequired(column.required),
        description: column.description,
        example: column.example,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEDEDED" },
    };

    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF7F7F7" },
    };

    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "top",
          wrapText: true,
        };

        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E5E5" } },
          left: { style: "thin", color: { argb: "FFE5E5E5" } },
          bottom: { style: "thin", color: { argb: "FFE5E5E5" } },
          right: { style: "thin", color: { argb: "FFE5E5E5" } },
        };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="kweekers-groeimodel-importtemplate.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}

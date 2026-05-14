import ExcelJS from "exceljs";
import { categories } from "@/lib/scan/definition/categories";
import { dimensions } from "@/lib/scan/definition/dimensions";
import { optionSets } from "@/lib/scan/definition/option-sets";
import { questions } from "@/lib/scan/definition/questions";

export const runtime = "nodejs";

type OptionWithScore = {
  value: string;
  label: string;
  description?: string;
  order: number;
  score?: number;
};

function formatBoolean(value: boolean | undefined): string {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("|");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function styleWorksheet(worksheet: ExcelJS.Worksheet) {
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEDEDED" },
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
}

export async function GET() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "KWEEKERS Groeimodel";
  workbook.created = new Date();
  workbook.modified = new Date();

  const categoriesSheet = workbook.addWorksheet("categories");
  categoriesSheet.columns = [
    { header: "code", key: "code", width: 28 },
    { header: "title", key: "title", width: 28 },
    { header: "description", key: "description", width: 70 },
    { header: "order", key: "order", width: 12 },
  ];

  categories.forEach((category) => {
    categoriesSheet.addRow({
      code: category.code,
      title: category.title,
      description: category.description,
      order: category.order,
    });
  });

  styleWorksheet(categoriesSheet);

  const dimensionsSheet = workbook.addWorksheet("dimensions");
  dimensionsSheet.columns = [
    { header: "code", key: "code", width: 28 },
    { header: "title", key: "title", width: 34 },
    { header: "category", key: "category", width: 28 },
    { header: "order", key: "order", width: 12 },
    { header: "isActive", key: "isActive", width: 14 },
  ];

  dimensions.forEach((dimension) => {
    dimensionsSheet.addRow({
      code: dimension.code,
      title: dimension.title,
      category: dimension.category ?? "",
      order: dimension.order,
      isActive: formatBoolean(dimension.isActive),
    });
  });

  styleWorksheet(dimensionsSheet);

  const questionsSheet = workbook.addWorksheet("questions");
  questionsSheet.columns = [
    { header: "key", key: "key", width: 34 },
    { header: "sectionCode", key: "sectionCode", width: 22 },
    { header: "order", key: "order", width: 12 },
    { header: "label", key: "label", width: 45 },
    { header: "helpText", key: "helpText", width: 60 },
    { header: "inputType", key: "inputType", width: 18 },
    { header: "required", key: "required", width: 14 },
    { header: "optionSetKey", key: "optionSetKey", width: 38 },
    { header: "dimensionCode", key: "dimensionCode", width: 24 },
    { header: "category", key: "category", width: 28 },
    { header: "outputRole", key: "outputRole", width: 18 },
    { header: "scoreEnabled", key: "scoreEnabled", width: 16 },
    { header: "scoreWeight", key: "scoreWeight", width: 16 },
    { header: "maxSelections", key: "maxSelections", width: 16 },
    { header: "allowsComment", key: "allowsComment", width: 18 },
    { header: "placeholder", key: "placeholder", width: 35 },
    { header: "visibleWhen", key: "visibleWhen", width: 70 },
    { header: "examples", key: "examples", width: 70 },
  ];

  questions.forEach((question) => {
    questionsSheet.addRow({
      key: question.key,
      sectionCode: question.sectionCode,
      order: question.order,
      label: question.label,
      helpText: question.helpText ?? "",
      inputType: question.inputType,
      required: formatBoolean(question.required),
      optionSetKey: question.optionSetKey ?? "",
      dimensionCode: question.dimensionCode ?? "",
      category: question.category ?? "",
      outputRole: question.outputRole ?? "",
      scoreEnabled: formatBoolean(question.scoreEnabled),
      scoreWeight: question.scoreWeight ?? "",
      maxSelections: question.maxSelections ?? "",
      allowsComment: formatBoolean(question.allowsComment),
      placeholder: question.placeholder ?? "",
      visibleWhen: formatValue(question.visibleWhen),
      examples: formatValue(question.examples),
    });
  });

  styleWorksheet(questionsSheet);

  const optionSetsSheet = workbook.addWorksheet("optionSets");
  optionSetsSheet.columns = [
    { header: "key", key: "key", width: 42 },
    { header: "description", key: "description", width: 70 },
  ];

  optionSets.forEach((optionSet) => {
    optionSetsSheet.addRow({
      key: optionSet.key,
      description: "",
    });
  });

  styleWorksheet(optionSetsSheet);

  const optionsSheet = workbook.addWorksheet("options");
  optionsSheet.columns = [
    { header: "optionSetKey", key: "optionSetKey", width: 42 },
    { header: "value", key: "value", width: 34 },
    { header: "label", key: "label", width: 34 },
    { header: "description", key: "description", width: 70 },
    { header: "order", key: "order", width: 12 },
    { header: "score", key: "score", width: 12 },
  ];

  optionSets.forEach((optionSet) => {
    optionSet.options.forEach((option) => {
      const optionWithScore = option as OptionWithScore;

      optionsSheet.addRow({
        optionSetKey: optionSet.key,
        value: optionWithScore.value,
        label: optionWithScore.label,
        description: optionWithScore.description ?? "",
        order: optionWithScore.order,
        score: optionWithScore.score ?? "",
      });
    });
  });

  styleWorksheet(optionsSheet);

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="kweekers-groeimodel-definitie-export.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}

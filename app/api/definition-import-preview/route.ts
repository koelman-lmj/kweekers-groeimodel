import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Geen bestand ontvangen.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;

    if (!fileName.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Ongeldig bestandstype. Upload een .xlsx-bestand.",
        },
        { status: 400 }
      );
    }

    if (fileSize === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Het bestand is leeg.",
        },
        { status: 400 }
      );
    }

    const result = {
      ok: true,
      message: "Bestand ontvangen en basiscontrole geslaagd.",
      file: {
        name: fileName,
        size: fileSize,
        type: file.type || "onbekend",
      },
      preview: {
        status: "Nog geen inhoudelijke Excel-controle actief.",
        note: "Deze stap controleert nu alleen of er een geldig .xlsx-bestand is geüpload.",
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Onbekende fout",
      },
      { status: 500 }
    );
  }
}

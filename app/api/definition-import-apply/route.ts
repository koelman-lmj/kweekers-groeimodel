import { NextResponse } from "next/server";
import { buildImportDiff } from "@/lib/scan/definition/import-diff";

type ImportRows = Record<string, Record<string, string>[]>;

type ApplyRequestBody = {
  importRows?: ImportRows;
  confirmed?: boolean;
  confirmText?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImportRows(value: unknown): value is ImportRows {
  if (!isRecord(value)) return false;

  return Object.values(value).every((sheetRows) => {
    if (!Array.isArray(sheetRows)) return false;

    return sheetRows.every((row) => {
      if (!isRecord(row)) return false;

      return Object.values(row).every(
        (cellValue) => typeof cellValue === "string"
      );
    });
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/definition-import-apply",
    mode: "safe-test",
    message:
      "Deze API-route is bereikbaar. Er wordt nog niets definitief geïmporteerd.",
  });
}

export async function POST(request: Request) {
  let body: ApplyRequestBody;

  try {
    body = (await request.json()) as ApplyRequestBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Ongeldige JSON-body.",
      },
      { status: 400 }
    );
  }

  const confirmed = body.confirmed === true;
  const confirmText = body.confirmText?.trim().toUpperCase();

  if (!confirmed || confirmText !== "TOEPASSEN") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Import niet bevestigd. Checkbox moet aan staan en bevestigingstekst moet TOEPASSEN zijn.",
      },
      { status: 400 }
    );
  }

  if (!isImportRows(body.importRows)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Geen geldige importRows ontvangen. De import kan niet worden voorbereid.",
      },
      { status: 400 }
    );
  }

  const diff = buildImportDiff(body.importRows);

  const hasInvalidRows = diff.totals.invalid > 0;

  if (hasInvalidRows) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Import bevat ongeldige regels. Los deze eerst op voordat toepassen mogelijk wordt.",
        totals: diff.totals,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "safe-test",
    message:
      "Server-side veilige test geslaagd. Er is nog niets definitief toegepast.",
    totals: diff.totals,
    sheets: diff.sheets.map((sheet) => ({
      sheetName: sheet.sheetName,
      title: sheet.title,
      counts: sheet.counts,
    })),
  });
}
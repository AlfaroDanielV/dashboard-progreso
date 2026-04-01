// src/app/api/debug/route.ts
import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.DEBUG_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sheet = searchParams.get("sheet") || "Registro";
  try {
    const data = await getSheetData(sheet);
    return NextResponse.json({
      sheetName: sheet,
      headers: data[0],
      rowCount: data.length - 1,
      sampleRows: data.slice(1, 4),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

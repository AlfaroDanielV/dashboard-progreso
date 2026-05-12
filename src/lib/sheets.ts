// src/lib/sheets.ts
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Builds a map of { filename → webViewLink } for all files inside a Drive folder
// (including one level of subfolders, where AppSheet stores uploads).
// Requires the folder to be shared "anyone with the link can view".
export async function buildDriveFileMap(
  folderId: string
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  if (!folderId || !API_KEY) return map;

  const fields = "files(id,name,webViewLink)";

  // Helper: list files (non-folders) inside a given parent folder
  async function listFiles(parentId: string) {
    const q = encodeURIComponent(
      `'${parentId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
    );
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${API_KEY}&fields=${fields}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return;
    const data = await res.json();
    for (const file of data.files ?? []) {
      const viewUrl =
        file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`;
      map[file.name] = viewUrl;
    }
  }

  // Find subfolders one level deep (AppSheet creates e.g. "Guias_Files_")
  const subQ = encodeURIComponent(
    `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const subUrl = `https://www.googleapis.com/drive/v3/files?q=${subQ}&key=${API_KEY}&fields=files(id,name)`;
  const subRes = await fetch(subUrl, { next: { revalidate: 300 } });

  const subfolderIds: string[] = [folderId];
  if (subRes.ok) {
    const subData = await subRes.json();
    for (const folder of subData.files ?? []) {
      subfolderIds.push(folder.id);
    }
  }

  await Promise.all(subfolderIds.map(listFiles));
  return map;
}

export async function getSheetData(sheetName: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error(`Error fetching sheet ${sheetName}:`, response.statusText);
    return [];
  }

  const data = await response.json();
  return (data.values as string[][]) || [];
}

export async function getMultipleSheets(
  sheetNames: string[]
): Promise<Record<string, string[][]>> {
  const results: Record<string, string[][]> = {};

  await Promise.all(
    sheetNames.map(async (name) => {
      results[name] = await getSheetData(name);
    })
  );

  return results;
}

// CSV出力ユーティリティ

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const bom = "\uFEFF"; // BOM for Excel UTF-8 compatibility
  const headerRow = headers.join(",");
  const dataRows = rows.map((row) =>
    row.map((cell) => {
      const str = String(cell);
      // Escape cells containing commas, quotes, or newlines
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );
  const csv = bom + [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

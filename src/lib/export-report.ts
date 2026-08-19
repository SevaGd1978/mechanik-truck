import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BuiltReport } from "@/lib/reports";

function safeFileName(title: string) {
  return title
    .replace(/[^\p{L}\p{N}\-_ ]+/gu, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

let fontCache: Promise<{ regular: string; bold: string }> | null = null;

function loadFonts() {
  if (!fontCache) {
    fontCache = Promise.all([
      fetch("/fonts/DejaVuSans.ttf").then(async (r) => {
        if (!r.ok) throw new Error("Не удалось загрузить шрифт DejaVuSans");
        return arrayBufferToBase64(await r.arrayBuffer());
      }),
      fetch("/fonts/DejaVuSans-Bold.ttf").then(async (r) => {
        if (!r.ok) throw new Error("Не удалось загрузить шрифт DejaVuSans-Bold");
        return arrayBufferToBase64(await r.arrayBuffer());
      }),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return fontCache;
}

export function downloadExcel(report: BuiltReport) {
  const header = report.columns.map((c) => c.label);
  const body = report.rows.map((row) =>
    report.columns.map((c) => row[c.key] ?? ""),
  );

  const sheetData: (string | number)[][] = [
    [report.title],
    [`Сформирован: ${report.generatedAt}`],
    [report.description],
    [],
    header,
    ...body,
  ];

  if (report.totals?.length) {
    sheetData.push([]);
    for (const t of report.totals) {
      sheetData.push([t.label, t.value]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = report.columns.map((c) => ({
    wch: Math.min(
      40,
      Math.max(
        c.label.length + 2,
        ...report.rows.map((r) => String(r[c.key] ?? "").length + 2),
        8,
      ),
    ),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, report.title.slice(0, 31));
  XLSX.writeFile(wb, `${safeFileName(report.title)}_${stamp()}.xlsx`);
}

export async function downloadPdf(report: BuiltReport) {
  const landscape = report.columns.length > 6;
  const doc = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const fonts = await loadFonts();
  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(14);
  doc.text(report.title, 14, 16);

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Mechanik Truck · ${report.generatedAt}`, 14, 22);
  const descLines = doc.splitTextToSize(report.description, landscape ? 270 : 180);
  doc.text(descLines, 14, 27);
  doc.setTextColor(0);

  const startY = 27 + descLines.length * 4 + 4;

  autoTable(doc, {
    startY,
    head: [report.columns.map((c) => c.label)],
    body: report.rows.map((row) =>
      report.columns.map((c) => String(row[c.key] ?? "")),
    ),
    styles: {
      font: "DejaVu",
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      font: "DejaVu",
      fontStyle: "bold",
      fillColor: [36, 99, 235],
      textColor: 255,
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  });

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? startY;

  if (report.totals?.length) {
    let y = finalY + 8;
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(10);
    doc.text("Итого", 14, y);
    y += 5;
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(9);
    for (const t of report.totals) {
      doc.text(`${t.label}: ${t.value}`, 14, y);
      y += 5;
    }
  }

  doc.save(`${safeFileName(report.title)}_${stamp()}.pdf`);
}

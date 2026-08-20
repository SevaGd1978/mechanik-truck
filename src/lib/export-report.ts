import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BuiltReport } from "@/lib/reports";

const REPORT_FILE_SLUG: Record<string, string> = {
  fleet: "avtopark",
  service: "zakaz-naryady",
  warehouse: "sklad",
  tires: "shiny",
  "parts-writeoff": "spisanie-zapchastey",
  summary: "svodka-zatrat",
};

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

function fileBase(report: BuiltReport) {
  return REPORT_FILE_SLUG[report.id] ?? "otchet";
}

/** Имя листа Excel: без запрещённых символов, до 31 символа */
function sheetName(title: string) {
  const cleaned = title.replace(/[:\\/?*\[\]]/g, "-").trim() || "Отчёт";
  return cleaned.slice(0, 31);
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

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // revoke after click has been processed
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1500);
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

export async function downloadExcel(report: BuiltReport) {
  if (typeof window === "undefined") {
    throw new Error("Выгрузка Excel доступна только в браузере");
  }

  // динамический импорт — надёжнее для клиентского бандла Next.js
  const XLSX = await import("xlsx");

  const header = report.columns.map((c) => c.label);
  const body = report.rows.map((row) =>
    report.columns.map((c) => {
      const value = row[c.key];
      return value === null || value === undefined ? "" : value;
    }),
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

  const colWidths = report.columns.map((c) => {
    const lengths = [
      c.label.length + 2,
      8,
      ...report.rows.map((r) => String(r[c.key] ?? "").length + 2),
    ];
    return { wch: Math.min(40, Math.max(...lengths)) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName(report.title));

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  }) as ArrayBuffer | Uint8Array;

  const bytes =
    buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);

  if (!bytes.byteLength) {
    throw new Error("Не удалось сформировать файл Excel");
  }

  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  triggerBrowserDownload(blob, `${fileBase(report)}_${stamp()}.xlsx`);
}

export async function downloadPdf(report: BuiltReport) {
  if (typeof window === "undefined") {
    throw new Error("Выгрузка PDF доступна только в браузере");
  }

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
  const descLines = doc.splitTextToSize(
    report.description,
    landscape ? 270 : 180,
  );
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

  doc.save(`${fileBase(report)}_${stamp()}.pdf`);
}

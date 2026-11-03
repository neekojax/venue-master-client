import { jsPDF } from "jspdf";
import autoTable, { type CellHookData } from "jspdf-autotable";

// 方案来源：jsPDF-AutoTable（https://github.com/simonbengtsson/jsPDF-AutoTable）+ 内嵌中文字体。
// 与位图导出（html2canvas）相比：矢量文本、可选中搜索、文件只有几十 KB（jsPDF 自动做字体子集化）。
// 字体：Noto Sans SC（OFL 许可，全字符覆盖），存放于 public/fonts，首次导出时按需加载并被浏览器缓存。
const FONT_NAME = "NotoSansSC";
const FONT_FILE = `${FONT_NAME}.ttf`;

// 配色（与前端 antd 视觉一致）
type Rgb = [number, number, number];
const INK: Rgb = [31, 41, 55]; // 正文 #1F2937
const MUTED: Rgb = [100, 116, 139]; // 次要文字 #64748B
const ACCENT: Rgb = [37, 99, 235]; // 强调蓝 #2563EB
const GRID: Rgb = [226, 232, 240]; // 表格网格 #E2E8F0
const HEAD_FILL: Rgb = [241, 245, 249]; // 表头底色 #F1F5F9
const HEAD_INK: Rgb = [51, 65, 85]; // 表头文字 #334155
const ZEBRA: Rgb = [248, 250, 252]; // 斑马纹 #F8FAFC
const GREEN: Rgb = [22, 163, 74];
const RED: Rgb = [239, 68, 68];
const RISK_COLORS: Record<string, Rgb> = {
  low: [82, 196, 26],
  medium: [22, 119, 255],
  high: [250, 173, 20],
  critical: [255, 77, 79],
};

let fontPromise: Promise<string> | null = null;

// 首次导出时加载字体并转 base64（约 10MB，浏览器缓存后不再重复下载）。
const loadFontBase64 = (): Promise<string> => {
  if (!fontPromise) {
    fontPromise = fetch("/fonts/NotoSansSC-Regular.ttf")
      .then((res) => {
        if (!res.ok) throw new Error(`字体加载失败 (${res.status})`);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        return btoa(binary);
      })
      .catch((error) => {
        fontPromise = null; // 失败后允许下次重试
        throw error;
      });
  }
  return fontPromise;
};

export interface MatrixPdfSection {
  title: string;
  head: string[];
  body: string[][];
  /** 按列下标指定宽度（pt）或对齐；未指定的列自动布局 */
  columnStyles?: Record<number, { cellWidth?: number; halign?: "left" | "center" | "right" }>;
  /** 从该列起是 ✓ 矩阵列（居中、绿色） */
  checkFrom?: number;
  /** 这些列的单元格与表头居中 */
  centerColumns?: number[];
  /** 风险等级列：按 low/medium/high/critical 着色 */
  riskColumn?: number;
  /** 状态列：「禁用」红色标注 */
  statusColumns?: number[];
  /** 正文行号（0 起）整行浅蓝高亮，用于强调关键行（如通配组织） */
  highlightRows?: number[];
  /** 首列按「概念标签」样式着色（蓝字 + 浅蓝底），用于说明类章节 */
  accentFirstColumn?: boolean;
  /** 正文字号覆盖（默认 8），说明类章节可用 9 提升可读性 */
  bodyFontSize?: number;
  /** 书签父节点标题：同一 parent 的多个小节挂在同一父书签下（如按账号分组） */
  bookmarkParent?: string;
}

type ColumnStyle = NonNullable<MatrixPdfSection["columnStyles"]>[number];
type OutlineNode = ReturnType<jsPDF["outline"]["add"]>;

// 生成文档（独立出来便于测试与复用），不触发下载。
export async function buildMatrixPdf(
  sections: MatrixPdfSection[],
  meta: { generatedAt: string; title?: string },
): Promise<jsPDF> {
  const fontBase64 = await loadFontBase64();
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4", compress: true });
  doc.addFileToVFS(FONT_FILE, fontBase64);
  doc.addFont(FONT_FILE, FONT_NAME, "normal");
  const docTitle = meta.title || "权限矩阵文档";

  // 每页归属的章节标题（用于续页页眉）+ 已创建的父书签节点（按标题索引）
  const pageSection: string[] = [];
  const outlineNodes = new Map<string, OutlineNode>();

  sections.forEach((section, index) => {
    if (index > 0) doc.addPage();
    const firstPage = doc.getNumberOfPages();

    // 书签目录：阅读器（Chrome/预览/Acrobat）侧边栏可直接跳转章节；bookmarkParent 挂到分组书签下
    let parentNode = section.bookmarkParent ? outlineNodes.get(section.bookmarkParent) : undefined;
    if (section.bookmarkParent && !parentNode) {
      parentNode = doc.outline.add(null, section.bookmarkParent, { pageNumber: firstPage });
      outlineNodes.set(section.bookmarkParent, parentNode);
    }
    doc.outline.add(parentNode ?? null, section.title, { pageNumber: firstPage });

    if (index === 0) {
      // 首页文档头：标题 + 元信息 + 分隔线（蓝色短线压在浅灰线上）
      doc.setFont(FONT_NAME, "normal");
      doc.setFontSize(15);
      doc.setTextColor(...INK);
      doc.text(docTitle, 24, 44);
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(`生成时间：${meta.generatedAt} · 数据来源：权限中心`, 24, 60);
      doc.setDrawColor(...GRID);
      doc.setLineWidth(0.8);
      doc.line(24, 68, 818, 68);
      doc.setFillColor(...ACCENT);
      doc.rect(24, 67.2, 64, 1.6, "F");
    }

    // 章节标题：蓝色竖条 + 深色文字
    const titleY = index === 0 ? 90 : 46;
    doc.setFillColor(...ACCENT);
    doc.rect(24, titleY - 10, 3, 13, "F");
    doc.setFontSize(12.5);
    doc.setTextColor(...INK);
    doc.text(section.title, 33, titleY);

    // 合并列样式：✓ 列与 centerColumns 居中
    const columnStyles: Record<number, ColumnStyle> = { ...(section.columnStyles || {}) };
    const centerSet = new Set(section.centerColumns || []);
    if (section.checkFrom !== undefined) {
      for (let c = section.checkFrom; c < section.head.length; c += 1) centerSet.add(c);
    }
    centerSet.forEach((c) => {
      columnStyles[c] = { ...(columnStyles[c] || {}), halign: "center" };
    });

    autoTable(doc, {
      head: [section.head],
      body: section.body,
      startY: titleY + 14,
      margin: { top: 56, left: 24, right: 24, bottom: 40 },
      styles: {
        font: FONT_NAME,
        fontSize: section.bodyFontSize ?? 8,
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        textColor: INK,
        lineColor: GRID,
        lineWidth: 0.5,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: HEAD_FILL,
        textColor: HEAD_INK,
        fontStyle: "normal",
        fontSize: 8.5,
        // 表头底边加粗，形成分隔层次
        lineWidth: { top: 0.5, bottom: 1.2, left: 0.5, right: 0.5 },
        lineColor: GRID,
      },
      alternateRowStyles: { fillColor: ZEBRA },
      columnStyles,
      didParseCell: (data: CellHookData) => {
        if (data.section !== "body") return;
        if (section.accentFirstColumn && data.column.index === 0) {
          data.cell.styles.textColor = ACCENT;
          data.cell.styles.fillColor = [239, 246, 255];
        }
        if (section.highlightRows?.includes(data.row.index)) {
          data.cell.styles.fillColor = [239, 246, 255];
        }
        const raw = String(data.cell.raw ?? "").trim();
        if (section.riskColumn === data.column.index) {
          const color = RISK_COLORS[raw];
          if (color) data.cell.styles.textColor = color;
        } else if (section.statusColumns?.includes(data.column.index) && raw === "禁用") {
          data.cell.styles.textColor = RED;
        } else if (section.checkFrom !== undefined && data.column.index >= section.checkFrom && raw === "✓") {
          data.cell.styles.textColor = GREEN;
        }
      },
    });

    const lastPage = doc.getNumberOfPages();
    for (let p = firstPage; p <= lastPage; p += 1) pageSection[p] = section.title;
  });

  // 页眉（续页显示当前章节）与页脚（左侧文档名、右侧页码）
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setFont(FONT_NAME, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    if (page > 1 && pageSection[page]) {
      doc.text(`${docTitle} · ${pageSection[page]}`, 24, 30);
    }
    doc.text(docTitle, 24, 584);
    doc.text(`第 ${page} / ${total} 页`, 818, 584, { align: "right" });
  }
  return doc;
}

// 一键下载：生成后直接保存，无打印对话框。
export async function exportMatrixPdf(
  sections: MatrixPdfSection[],
  meta: { generatedAt: string; title?: string },
  fileName: string,
): Promise<void> {
  const doc = await buildMatrixPdf(sections, meta);
  doc.save(fileName);
}

/**
 * i18n 自动化改写脚本（一次性迁移工具）
 *
 * 作用：扫描 src/**\/*.{ts,tsx} 中的中文文案（JSX 文本 / 字符串字面量 / 简单模板字符串），
 * 自动替换为 t("中文原文") 调用（自然键：中文原文即 key），并补充 import。
 *
 * 安全跳过（避免破坏数据逻辑）：
 * - 比较表达式 === !== == !=、switch-case、对象 key、成员访问 obj["中文"]
 * - 枚举成员值、[...].includes(...)/indexOf(...)/find(...) 等判定位
 * - console.* 的参数（开发日志保留中文）
 * - 含复杂表达式的模板字符串（列入人工清单 manual-review.json）
 *
 * 用法：node scripts/i18n/extract-and-rewrite.mjs
 * 产出：scripts/i18n/keys-report.json（唯一 key 及出现次数）
 *       scripts/i18n/manual-review.json（需人工处理的残留文案）
 */
import fs from "node:fs";
import path from "node:path";
import babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import _types from "@babel/types";

const traverse = _traverse.default;
const types = _types;

const ROOT = path.resolve(process.cwd(), "src");
const SKIP_DIRS = new Set(["locales"]);
// 不参与自动改写的文件（语言切换按钮自身等）
const SKIP_FILES = new Set([path.resolve(ROOT, "components/language-switch/index.tsx")]);
const EXTENSIONS = new Set([".ts", ".tsx"]);
const HAS_CJK = /[㐀-䶿一-龥]/;
const DECISION_CALLEES = new Set([
  "includes", "indexOf", "lastIndexOf", "find", "findIndex",
  "some", "every", "filter", "excludes", "remove", "has", "get",
]);

/** 归一化：折叠空白（中文换行拼接场景） */
const normalize = (s) => s.replace(/\s+/g, " ").trim();

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&times;/g, "×")
    .replace(/&amp;/g, "&");

const keyStats = new Map(); // key -> count
const manualReview = []; // { file, line, reason, snippet }
const fileResults = [];

function recordKey(key) {
  keyStats.set(key, (keyStats.get(key) || 0) + 1);
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    if (SKIP_FILES.has(full)) continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.has(path.extname(full))) out.push(full);
  }
  return out;
}

/** 判断模板字符串表达式能否转成插值参数，返回 { name, code } 或 null */
function simpleExprParam(expr, src, usedNames) {
  let code = src.slice(expr.start, expr.end).replace(/\s*\n\s*/g, " ");
  let name = null;
  if (types.isIdentifier(expr)) {
    name = expr.name;
  } else if (types.isMemberExpression(expr)) {
    // a.b.c 链（含 ?.）取末端属性名；链断裂（函数调用、计算属性等）回退通用参数名
    const parts = [];
    let cur = expr;
    let broken = false;
    while (types.isMemberExpression(cur)) {
      if (cur.computed) { broken = true; break; }
      if (!types.isIdentifier(cur.property)) { broken = true; break; }
      parts.unshift(cur.property.name);
      cur = cur.object;
    }
    if (!broken && types.isIdentifier(cur)) {
      name = parts[parts.length - 1];
    } else {
      name = "value";
    }
  } else if (
    types.isObjectExpression(expr) ||
    types.isFunctionExpression(expr) ||
    types.isArrowFunctionExpression(expr) ||
    types.isJSXElement(expr)
  ) {
    return null; // 复杂/不可读的插值，交给人工
  } else {
    // 其余表达式（??、||、算术、函数调用等）用通用参数名 value 兜底
    name = "value";
  }
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return null;
  let base = name;
  let i = 2;
  while (usedNames.has(name)) name = `${base}${i++}`;
  usedNames.add(name);
  return { name, code };
}

function buildTCall(key, params) {
  if (!params || params.length === 0) return `t(${JSON.stringify(key)})`;
  const opts = params.map((p) => `${p.name}: ${p.code}`).join(", ");
  return `t(${JSON.stringify(key)}, { ${opts} })`;
}

/** 检查模块内是否已有名为 t 的本地绑定（有则改用别名 i18nT） */
function fileHasLocalT(src) {
  return (
    /\b(const|let|var)\s+t\s*[=:]/.test(src) ||
    /\bfunction\s+t\s*\(/.test(src) ||
    /\(\s*t\s*[,):]/.test(src) ||
    /,\s*t\s*[:),]/.test(src) ||
    /[{,]\s*t\s*[,}:]/.test(src) ||
    /\bt\s*:\s*(number|string|any)\b/.test(src)
  );
}

function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(process.cwd(), file);
  let ast;
  try {
    ast = babelParser.parse(src, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy", "importAssertions"],
    });
  } catch (e) {
    manualReview.push({ file: rel, line: 0, reason: "PARSE_ERROR", snippet: String(e.message) });
    return;
  }

  /** @type {{start:number,end:number,text:string}[]} */
  const edits = [];
  const overlaps = (s, e) => edits.some((ed) => s < ed.end && e > ed.start);

  const addEdit = (start, end, text) => {
    if (overlaps(start, end)) return false; // 已被更大范围编辑覆盖（如模板/JSX 合并），跳过
    edits.push({ start, end, text });
    return true;
  };

  const inConsoleCall = (path) =>
    !!path.findParent(
      (p) =>
        p.isCallExpression() &&
        types.isMemberExpression(p.node.callee) &&
        types.isIdentifier(p.node.callee.object, { name: "console" }),
    );

  // 已是 t("...") / i18nT("...") 的参数（幂等保护：避免二次包裹）
  const inTCallArg = (path) =>
    types.isCallExpression(path.parent) &&
    types.isIdentifier(path.parent.callee) &&
    ["t", "i18nT"].includes(path.parent.callee.name);

  const inDecisionContext = (path) => {
    const p = path.parent;
    // 比较 / switch-case / 对象 key / 成员属性 / 枚举值
    if (types.isBinaryExpression(p) && ["==", "===", "!=", "!==", "in"].includes(p.operator)) return true;
    if (types.isSwitchCase(p) && p.test === path.node) return true;
    if (types.isProperty(p) && p.key === path.node) return true;
    if (types.isMemberExpression(p) && p.property === path.node && !p.computed) return true;
    if (types.isMemberExpression(p) && p.computed) {
      // obj["中文"] 视为取值逻辑
      return true;
    }
    if (types.isTSEnumMember(p) && p.initializer === path.node) return true;
    // [...].includes("中文") 等判定数组
    if (types.isArrayExpression(p)) {
      const call = path.findParent((pp) => pp.isCallExpression());
      if (call && types.isMemberExpression(call.node.callee)) {
        const prop = call.node.callee.property;
        if (types.isIdentifier(prop) && DECISION_CALLEES.has(prop.name)) return true;
      }
    }
    return false;
  };

  // ---------- 1) JSXElement：整段 children 合并（"共 {n} 台" -> t("共 {{n}} 台", ...)） ----------
  traverse(ast, {
    JSXElement(path) {
      const children = path.node.children;
      if (!children || children.length === 0) return;
      // 仅当混合了文本与表达式时才需要合并；纯表达式无中文文本交给其他规则
      const hasTextWithCJK = children.some(
        (c) => types.isJSXText(c) && HAS_CJK.test(decodeEntities(c.value)),
      );
      if (!hasTextWithCJK) return;
      // 所有子节点必须是 JSXText 或含真实表达式的容器（无嵌套元素）
      const ok = children.every(
        (c) =>
          types.isJSXText(c) ||
          (types.isJSXExpressionContainer(c) &&
            !types.isJSXEmptyExpression(c.expression)),
      );
      if (!ok || children.length < 2) {
        // 无法合并，交给 JSXText 单节点规则
        return;
      }
      const used = new Set();
      const quasis = [];
      const params = [];
      let failed = false;
      for (const c of children) {
        if (types.isJSXText(c)) {
          quasis.push(decodeEntities(c.value));
        } else {
          const p = simpleExprParam(c.expression, src, used);
          if (!p) { failed = true; break; }
          quasis.push(`{{${p.name}}}`);
          params.push(p);
        }
      }
      if (failed) {
        manualReview.push({
          file: rel, line: path.node.loc?.start.line, reason: "JSX_MERGE_COMPLEX",
          snippet: src.slice(path.node.start, Math.min(path.node.end, path.node.start + 160)),
        });
        return;
      }
      // JSXText 中被拆开的中英混合要拼成完整句子
      const key = normalize(quasis.join(""));
      if (!HAS_CJK.test(key)) return;
      if (addEdit(children[0].start, children[children.length - 1].end, `{${buildTCall(key, params)}}`)) {
        recordKey(key);
      }
    },
  });

  // ---------- 2) JSXText：单文本节点 ----------
  traverse(ast, {
    JSXText(path) {
      const node = path.node;
      if (overlaps(node.start, node.end)) return;
      const raw = node.value;
      if (!HAS_CJK.test(decodeEntities(raw))) return;
      const lead = raw.match(/^\s*/)[0];
      const trail = raw.match(/\s*$/)[0];
      const core = raw.slice(lead.length, raw.length - trail.length);
      if (!core) return;
      const key = normalize(decodeEntities(core));
      if (!key) return;
      if (addEdit(node.start + lead.length, node.end - trail.length, `{${buildTCall(key)}}`)) {
        recordKey(key);
      }
    },
  });

  // ---------- 3) 字符串字面量 与 模板字符串 ----------
  traverse(ast, {
    StringLiteral(path) {
      const node = path.node;
      const value = node.value;
      if (!HAS_CJK.test(value)) return;
      if (overlaps(node.start, node.end)) return;
      // TS 类型位置的字面量（type A = "中文" | "中文2"）——编译期语法，禁止改写
      if (types.isTSLiteralType(path.parent)) return;
      if (inTCallArg(path)) return;
      // JSX 属性：placeholder="请输入" -> placeholder={t("请输入")}
      // 注意 Babel 的 StringLiteral start/end 已包含引号
      if (types.isJSXAttribute(path.parent)) {
        const key = normalize(value);
        if (!key) return;
        if (addEdit(node.start, node.end, `{${buildTCall(key)}}`)) recordKey(key);
        return;
      }
      if (inDecisionContext(path) || inConsoleCall(path)) return;
      const key = normalize(value);
      if (!key) return;
      if (addEdit(node.start, node.end, buildTCall(key))) recordKey(key);
    },
    TemplateLiteral(path) {
      const node = path.node;
      const hasCJK = node.quasis.some((q) => HAS_CJK.test(q.value.cooked ?? ""));
      if (!hasCJK) return;
      if (overlaps(node.start, node.end)) return;
      // 标签模板跳过
      if (types.isTaggedTemplateExpression(path.parent)) return;
      if (inTCallArg(path)) return;
      if (inDecisionContext(path)) return;
      const used = new Set();
      const parts = [];
      const params = [];
      let failed = false;
      node.quasis.forEach((q, i) => {
        parts.push(q.value.cooked ?? "");
        if (i < node.expressions.length) {
          const p = simpleExprParam(node.expressions[i], src, used);
          if (!p) { failed = true; return; }
          parts.push(`{{${p.name}}}`);
          params.push(p);
        }
      });
      if (failed) {
        manualReview.push({
          file: rel, line: node.loc?.start.line, reason: "TEMPLATE_COMPLEX",
          snippet: src.slice(node.start, Math.min(node.end, node.start + 160)),
        });
        return;
      }
      const key = normalize(parts.join(""));
      if (!key) return;
      // JSX 属性里的模板：placeholder={`共${n}条`} —— 外层已有 {}，只替换表达式
      if (addEdit(node.start, node.end, buildTCall(key, params))) recordKey(key);
    },
  });

  if (edits.length === 0) return;

  // ---------- 4) 处理 import ----------
  const localT = fileHasLocalT(src);
  const callName = localT ? "i18nT" : "t";
  if (localT) {
    // 调用处统一改用 i18nT
    for (const e of edits) e.text = e.text.replace(/\bt\(/g, "i18nT(");
  }
  let output = src;
  const applyFrom = [...edits].sort((a, b) => b.start - a.start);
  for (const e of applyFrom) {
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  }
  const importLine = localT
    ? `import { t as i18nT } from "@/locales";`
    : `import { t } from "@/locales";`;
  if (!output.includes('@/locales"')) {
    const importRe = /^[ \t]*import[^;]+;[ \t]*$/gm;
    let lastEnd = -1;
    let m;
    while ((m = importRe.exec(output)) !== null) lastEnd = m.index + m[0].length;
    if (lastEnd >= 0) {
      output = output.slice(0, lastEnd) + `\n` + importLine + output.slice(lastEnd);
    } else {
      output = importLine + `\n` + output;
    }
  }
  fs.writeFileSync(file, output);
  fileResults.push({ file: rel, edits: edits.length });
}

const files = walk(ROOT);
for (const f of files) processFile(f);

fs.mkdirSync(path.resolve(process.cwd(), "scripts/i18n"), { recursive: true });
const sortedKeys = [...keyStats.entries()].sort((a, b) => b[1] - a[1]);
fs.writeFileSync(
  path.resolve(process.cwd(), "scripts/i18n/keys-report.json"),
  JSON.stringify(
    Object.fromEntries(sortedKeys.map(([k, c]) => [k, { count: c }])),
    null,
    0,
  ),
);
fs.writeFileSync(
  path.resolve(process.cwd(), "scripts/i18n/manual-review.json"),
  JSON.stringify(manualReview, null, 2),
);

const totalEdits = fileResults.reduce((s, f) => s + f.edits, 0);
console.log(`文件扫描: ${files.length}`);
console.log(`改写文件: ${fileResults.length}`);
console.log(`替换处数: ${totalEdits}`);
console.log(`唯一 key: ${keyStats.size}`);
console.log(`人工清单: ${manualReview.length}`);

#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const documents = [
  {
    key: "machines",
    appAnchor: 'slug: "stanki"',
    pdfName: "machines.pdf",
    pagesDir: "machines/pages",
  },
  {
    key: "materials",
    appAnchor: 'slug: "rashodnye-materialy"',
    pdfName: "materials.pdf",
    pagesDir: "materials/pages",
  },
];

const siteRoot = resolve(process.env.SITE_ROOT || ".");
const docsRoot = resolve(process.env.DOCS_ROOT || join(siteRoot, "docs"));
const staticCatalogFile = resolve(process.env.STATIC_CATALOG_FILE || join(siteRoot, "site.js"));
const appCatalogFile = resolve(process.env.APP_CATALOG_FILE || "app/catalog.ts");
const renderDpi = process.env.PDF_RENDER_DPI || "96";
const jpegQuality = process.env.PDF_JPEG_QUALITY || "82";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function getPageCount(pdfPath) {
  const output = run("pdfinfo", [pdfPath]);
  const match = output.match(/^Pages:\s+(\d+)/m);

  if (!match) {
    throw new Error(`Cannot read page count from ${pdfPath}`);
  }

  return Number(match[1]);
}

function renderPdfPages(pdfPath, outputDir, pageCount) {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const tempPrefix = join(outputDir, "render");

  execFileSync(
    "pdftoppm",
    ["-jpeg", "-r", renderDpi, "-jpegopt", `quality=${jpegQuality},optimize=y`, pdfPath, tempPrefix],
    { stdio: "inherit" },
  );

  for (let page = 1; page <= pageCount; page += 1) {
    const padded = String(page).padStart(2, "0");
    const popplerPadded = String(page).padStart(String(pageCount).length, "0");
    const candidates = [
      join(outputDir, `render-${page}.jpg`),
      join(outputDir, `render-${padded}.jpg`),
      join(outputDir, `render-${popplerPadded}.jpg`),
    ];
    const source = candidates.find((candidate) => existsSync(candidate));
    const target = join(outputDir, `page-${padded}.jpg`);

    if (!source) {
      throw new Error(`Expected rendered page is missing: ${candidates.join(", ")}`);
    }

    renameSync(source, target);
  }
}

function replacePageCountAfterAnchor(content, anchor, pageCount, filePath) {
  const anchorIndex = content.indexOf(anchor);

  if (anchorIndex === -1) {
    throw new Error(`Anchor "${anchor}" not found in ${filePath}`);
  }

  const searchStart = content.indexOf("pageCount:", anchorIndex);

  if (searchStart === -1) {
    throw new Error(`pageCount after "${anchor}" not found in ${filePath}`);
  }

  const before = content.slice(0, searchStart);
  const after = content.slice(searchStart).replace(/pageCount:\s*\d+/, `pageCount: ${pageCount}`);

  return before + after;
}

function updateCatalogFile(filePath, anchorsByKey, countsByKey) {
  if (!existsSync(filePath)) {
    return;
  }

  let content = readFileSync(filePath, "utf8");

  for (const document of documents) {
    content = replacePageCountAfterAnchor(
      content,
      anchorsByKey[document.key],
      countsByKey[document.key],
      filePath,
    );
  }

  writeFileSync(filePath, content);
}

const countsByKey = {};

for (const document of documents) {
  const pdfPath = join(docsRoot, document.pdfName);

  if (!existsSync(pdfPath)) {
    throw new Error(`PDF file is missing: ${pdfPath}`);
  }

  const pageCount = getPageCount(pdfPath);
  const outputDir = join(docsRoot, document.pagesDir);

  renderPdfPages(pdfPath, outputDir, pageCount);
  countsByKey[document.key] = pageCount;
  console.log(`${document.pdfName}: ${pageCount} pages`);
}

updateCatalogFile(
  staticCatalogFile,
  {
    machines: "machines: {",
    materials: "materials: {",
  },
  countsByKey,
);

updateCatalogFile(
  appCatalogFile,
  Object.fromEntries(documents.map((document) => [document.key, document.appAnchor])),
  countsByKey,
);

console.log("Catalog assets are up to date.");

/*
  One-off asset optimizer. Reads delivered originals from assets/ (not served)
  and writes web-friendly copies into public/assets/ (served by Next).
  Run: pnpm tsx scripts/optimize-gallery.ts
*/
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MAX_EDGE = 2000;

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

/** Optimize a directory of images into sequential numbered files. */
async function optimizeSequential(opts: {
  srcDir: string;
  outDir: string;
  outExt: "jpg" | "png";
  sort?: (a: string, b: string) => number;
}) {
  const { srcDir, outDir, outExt } = opts;
  await ensureDir(outDir);
  const entries = (await fs.readdir(srcDir)).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  );
  entries.sort(opts.sort ?? ((a, b) => a.localeCompare(b, undefined, { numeric: true })));

  let i = 1;
  for (const file of entries) {
    const src = path.join(srcDir, file);
    const out = path.join(outDir, `${i}.${outExt}`);
    let pipeline = sharp(src).rotate().resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
    pipeline =
      outExt === "jpg"
        ? pipeline.jpeg({ quality: 80, mozjpeg: true })
        : pipeline.png({ quality: 80, compressionLevel: 9 });
    await pipeline.toFile(out);
    const { size } = await fs.stat(out);
    console.log(`  ${file} -> ${path.relative(ROOT, out)} (${(size / 1024).toFixed(0)} KB)`);
    i++;
  }
  return i - 1;
}

async function optimizeSingle(src: string, out: string) {
  await ensureDir(path.dirname(out));
  await sharp(src)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  const { size } = await fs.stat(out);
  console.log(`  ${path.basename(src)} -> ${path.relative(ROOT, out)} (${(size / 1024).toFixed(0)} KB)`);
}

async function main() {
  console.log("Prenup photos:");
  const prenup = await optimizeSequential({
    srcDir: path.join(ROOT, "assets", "Pre_Wedding_Photo"),
    outDir: path.join(ROOT, "public", "assets", "prenup"),
    outExt: "jpg",
  });

  console.log("Invitations:");
  const invites = await optimizeSequential({
    srcDir: path.join(ROOT, "assets", "Invitations"),
    outDir: path.join(ROOT, "public", "assets", "invitations"),
    outExt: "jpg",
  });

  console.log("Venues:");
  await optimizeSingle(
    path.join(ROOT, "assets", "wedding_venue.jpg"),
    path.join(ROOT, "public", "assets", "wedding_venue.jpg"),
  );
  await optimizeSingle(
    path.join(ROOT, "assets", "reception_venue.jpg"),
    path.join(ROOT, "public", "assets", "reception_venue.jpg"),
  );

  console.log(`\nDone. prenup=${prenup} invitations=${invites}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

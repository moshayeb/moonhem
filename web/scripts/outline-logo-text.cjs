/**
 * Build path data for MOONHEM in logo_BO.svg from Inter Bold (WOFF → OTF via woff2otf).
 * Run: node scripts/outline-logo-text.cjs
 */
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");
const woff2otf = require("woff2otf");

const WOFF_PATH = path.join(
    __dirname,
    "../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"
);

const buf = fs.readFileSync(WOFF_PATH);
const rawOtf = woff2otf(buf);
const otf = Buffer.isBuffer(rawOtf) ? rawOtf : Buffer.from(rawOtf);
const font = opentype.parse(otf.buffer.slice(otf.byteOffset, otf.byteOffset + otf.byteLength));

const size = 88;
const moon = font.getPath("MOON", 0, 0, size);
const hem = font.getPath("HEM", 272.8, 0, size);
process.stdout.write(
    JSON.stringify(
        {
            moon: moon.toPathData(2),
            hem: hem.toPathData(2),
        },
        null,
        0
    ) + "\n"
);

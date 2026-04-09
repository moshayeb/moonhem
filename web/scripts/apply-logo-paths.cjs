/**
 * One-off / regen: writes outlined MOONHEM paths into public logo SVGs.
 * Run: node scripts/apply-logo-paths.cjs
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
const moon = font.getPath("MOON", 0, 0, size).toPathData(2);
const hem = font.getPath("HEM", 272.8, 0, size).toPathData(2);
const full = font.getPath("MOONHEM", 0, 0, size).toPathData(2);

function patchBOorWO(src) {
    let s = fs.readFileSync(src, "utf8");
    s = s.replace(/\n\s*\.st1\s*\{[^}]+\}/s, "");
    s = s.replace(
        /<text[^>]*>[\s\S]*?<\/text>/,
        `<g transform="translate(121.97 102.71)"><path class="st0" d="${moon}"/><path class="st2" d="${hem}"/></g>`
    );
    fs.writeFileSync(src, s);
}

function patchB(src) {
    let s = fs.readFileSync(src, "utf8");
    s = s.replace(
        /\s*\.st0,\s*\.st1\s*\{[^}]+\}\s*\n\s*\.st1\s*\{[^}]+\}\s*/s,
        "\n      .st0 {\n        fill: #1d1d1b;\n      }\n"
    );
    s = s.replace(
        /<text[^>]*>[\s\S]*?<\/text>/,
        `<g transform="translate(121.97 102.71)"><path class="st0" d="${full}"/></g>`
    );
    fs.writeFileSync(src, s);
}

const pub = path.join(__dirname, "../public");
patchBOorWO(path.join(pub, "logo_BO.svg"));
patchBOorWO(path.join(pub, "logo_WO.svg"));
patchB(path.join(pub, "logo_B.svg"));
console.log("Updated logo_BO.svg, logo_WO.svg, logo_B.svg");

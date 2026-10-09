import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
const root = new URL("../", import.meta.url);
await mkdir(new URL("dist/", root), { recursive: true });
await build({
  entryPoints: [new URL("src/app.js", root).pathname],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  outfile: new URL("dist/show.js", root).pathname,
  legalComments: "eof",
});
await copyFile(
  new URL("node_modules/three/LICENSE", root),
  new URL("dist/THREE-LICENSE.txt", root),
);

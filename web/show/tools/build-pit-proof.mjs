import { build } from "esbuild";
await build({entryPoints:[new URL("../src/pit-proof.js",import.meta.url).pathname],bundle:true,minify:true,format:"esm",target:"es2022",outfile:new URL("../dist/pit-proof.js",import.meta.url).pathname,legalComments:"eof"});

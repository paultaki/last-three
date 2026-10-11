import {build}from "esbuild";
await build({entryPoints:[new URL("../src/episode.js",import.meta.url).pathname],bundle:true,minify:true,format:"esm",target:"es2022",outfile:new URL("../dist/episode.js",import.meta.url).pathname,legalComments:"eof"});

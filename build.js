#!/usr/bin/env node
import esbuild from "esbuild";

esbuild
    .build({
        entryPoints: ["src/index.ts"],
        outdir: "build",
        bundle: true,
        format: "esm",
        target: ["esnext"],
        platform: "node",
        packages: "external",
    })
    .catch(() => process.exit(1));

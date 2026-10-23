import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
const root = fileURLToPath(new URL("../", import.meta.url));
// Test the packaged artifact, not the native Rust transform or a mocked compiler.
// A fresh cache prevents an earlier WASM build from masking ABI incompatibility.
const cacheRoot = mkdtempSync(path.join(tmpdir(), "codablejson-compiler-"));
const wasm = path.join(root, "dist/next_codablejson.wasm");
const customCoder = {
  toolsModule: fileURLToPath(new URL("./compiler-tools.mjs", import.meta.url)),
  clientModule: path.join(root, "dist/client.js"),
};

before(async () => {
  await swc.loadBindings();
});
after(() => rmSync(cacheRoot, { recursive: true, force: true }));

async function compile(source, filename, config = {}) {
  const { code } = await swc.transform(source, {
    filename: path.join(root, filename),
    jsc: {
      parser: { syntax: "typescript", tsx: true },
      target: "es2022",
      experimental: { plugins: [[wasm, config]], cacheRoot },
    },
    module: { type: "commonjs" },
    // Keep data exports so their generated wrappers can be executed below.
    disableNextSsg: true,
    isServerCompiler: true,
  });
  return code;
}

for (const config of [{}, { customCoder }]) {
  const coder = config.customCoder ? "custom" : "default";
  for (const dataExport of ["getServerSideProps", "getStaticProps"]) {
    test(`${coder} coder: ${dataExport} and page survive JSON transport`, async () => {
      const code = await compile(`
        export async function ${dataExport}() {
          return { props: { date: new Date("2026-10-23T00:00:00.000Z"), count: 9007199254740993n } };
        }
        export default function Page({ date, count }) {
          if (!(date instanceof Date) || typeof count !== "bigint") {
            throw new Error("Page received serialized props");
          }
          return date.toISOString() + " / " + count.toString();
        }
      `, "pages/compiler-check.tsx", config);
      assert.match(code, /withCodableJSONProps/);
      assert.match(code, /withCodableJSONPage/);
      if (config.customCoder) assert.ok(code.includes(customCoder.toolsModule));

      const module = { exports: {} };
      // Execute the compiled module with the real package serialization helpers.
      new Function("require", "module", "exports", code)(require, module, module.exports);
      const result = await module.exports[dataExport]({});
      const transported = JSON.parse(JSON.stringify(result));
      assert.equal(
        renderToStaticMarkup(React.createElement(module.exports.default, transported.props)),
        "2026-10-23T00:00:00.000Z / 9007199254740993",
      );
    });
  }

  test(`${coder} coder: App Router data-codable is transformed`, async () => {
    const code = await compile(`
      import Client from "./client";
      export default function Page() {
        return <Client data-codable date={new Date()} count={1n} />;
      }
    `, "app/compiler-check/page.tsx", config);
    assert.ok(code.includes(config.customCoder?.toolsModule ?? "next-codablejson-plugin/tools"));
    assert.ok(code.includes(config.customCoder?.clientModule ?? "next-codablejson-plugin/client"));
    assert.match(code, /serialize/);
    assert.doesNotMatch(code, /data-codable/);
  });
}

test("custom App Router coder requires a client module", async () => {
  await assert.rejects(
    compile('export default function Page() { return <Client data-codable />; }',
      "app/compiler-check/page.tsx", { customCoder: { toolsModule: customCoder.toolsModule } }),
    /customCoder\.clientModule is required/,
  );
});

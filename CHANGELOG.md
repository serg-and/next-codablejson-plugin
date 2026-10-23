# Changelog

## 0.2.1 - 2026-10-23

- Rebuild the WASM plugin against SWC 79 for Next.js 16.4.2 compatibility.
- Update Rust fixture dependencies and pin the Next.js compiler regression host
  to 16.4.2. Add `bun run test:compiler` to rebuild and test the packaged WASM,
  including Pages Router JSON transport and App Router custom-coder diagnostics.
- Rebuild and validate the WASM automatically before local npm publishing.

## 0.2.0 - 2026-10-21

### Added

- Support custom CodableJSON `Coder` instances through `customCoder.toolsModule`
  and optional `customCoder.clientModule` plugin options, without a Next config
  wrapper.
- Export `createCodableJSONTools(coder)` and `createCodableJSONComponent(coder)`
  factories for application-defined serialization and decoding modules.
- Report a build error when `data-codable` is used with a custom coder but
  `customCoder.clientModule` is missing. Pages Router only needs `toolsModule`.
- Document custom types, shared coder setup, and Pages Router and App Router
  integration with examples.
- Add custom-coder transform fixtures, runtime tests, and a typecheck script.

### Fixed

- Accept ordinary object props in the runtime helper types.
- Resolve the local TypeScript compiler explicitly in the prepack hook so
  `bun publish` can build the package.
- Allow SWC host imports when linking the release WASM plugin.

### Compatibility

- Next.js compatibility remains `^16.1.6`.
- Existing configurations continue to use the default coder when `customCoder`
  is omitted.

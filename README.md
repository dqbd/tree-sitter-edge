# Tree-Sitter on Vercel Edge Functions

This is a demo of using [Tree-Sitter](https://tree-sitter.github.io/tree-sitter/) on [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions).

## Usage

```bash
curl https://tree-sitter-edge.vercel.app/api/endpoint -d "expression"
```

## Changes made to the output JS file

1. Rename `require` to `_require` to resolve bundling issues with `esbuild`
2. Add the ability to pass a WebAssembly.Module to `Parser.Language.load`.
3. Added a special check for WebAssembly.Module imported from a different V8 context.

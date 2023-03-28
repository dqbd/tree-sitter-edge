import Parser from "web-tree-sitter"

// @ts-expect-error
import treeSitterWasm from "web-tree-sitter/tree-sitter.wasm?module"

// @ts-expect-error
import jsWasm from "../tree-sitter-javascript.wasm?module"

export const config = { runtime: "edge" }

export default async function (req: Request) {
  const inputString = (await req.text()) || "x10 + 1000"

  await Parser.init({
    instantiateWasm: (info, receive) =>
      WebAssembly.instantiate(treeSitterWasm, info).then((instance) =>
        receive(instance, treeSitterWasm)
      ),
  })

  const JavaScript = await Parser.Language.load(jsWasm)
  const parser = new Parser()

  parser.setLanguage(JavaScript)
  const tree = parser.parse(inputString)
  const response = new Response(tree.rootNode.toString())

  tree.delete()
  parser.delete()

  return response
}

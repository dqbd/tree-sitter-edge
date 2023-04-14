import Parser from "./tree-sitter.edge.js"

const JavaScript = {}

JavaScript.init = async () => {
  const mod = await import("./javascript.wasm?module")
  JavaScript.Language = await Parser.Language.load(mod.default)
}

export default JavaScript

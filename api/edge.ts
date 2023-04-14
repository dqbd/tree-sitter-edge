import Parser from "@diagram/web-tree-sitter"
import JavaScript from "@diagram/web-tree-sitter/javascript"

export const config = { runtime: "edge" }

export default async function (req: Request) {
  await Parser.init()
  await JavaScript.init?.()

  const parser = new Parser()
  parser.setLanguage(JavaScript.Language)

  const tree = parser.parse("3+2")
  const response = new Response(tree.rootNode.toString())

  tree.delete?.()
  parser.delete?.()

  return response
}

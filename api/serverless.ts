import Parser from "@diagram/web-tree-sitter"
import JavaScript from "@diagram/web-tree-sitter/javascript"
import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  const parser = new Parser()
  parser.setLanguage(JavaScript.Language)

  const tree = parser.parse("3+2")
  const res = tree.rootNode.toString()

  tree.delete?.()
  parser.delete?.()

  response.send(res).end()
}

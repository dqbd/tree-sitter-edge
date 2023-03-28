import { Project, SourceFile, ts } from "ts-morph"
import path from "node:path"

function patch(sourceFile: SourceFile) {
  if (
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.Identifier)
      .filter((i) => i.getText() === "_require").length
  ) {
    console.log("Already patched")
    return
  }

  // patch require to _require to resolve bundling issues with esbuild
  {
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.Identifier)
      .filter((i) => i.getText() === "require")
      .map((i) => i.getFirstAncestorByKindOrThrow(ts.SyntaxKind.CallExpression))
      .forEach((m) => m.setExpression("_require"))

    sourceFile.insertText(
      0,
      `var _require = typeof require != "undefined" ? require : null;`
    )
  }

  // patch Parser.Language.load to allow WebAssembly.Module as an argument
  {
    const block = sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.MethodDeclaration)
      .filter((i) => i.isStatic() && i.getName() === "load")
      .at(0)

    if (block == null) throw new Error("Failed to find load function")
    const parameterName = block.getParameters().at(0)?.getName()

    const ifStmt = block.getFirstDescendantByKindOrThrow(
      ts.SyntaxKind.IfStatement
    )
    const assignVar = ifStmt
      .getThenStatement()
      .getFirstDescendantByKindOrThrow(ts.SyntaxKind.BinaryExpression)
      .getLeft()
      .asKindOrThrow(ts.SyntaxKind.Identifier)
      .getText()

    if (parameterName == null) throw new Error("Failed to find parameter name")
    ifStmt.replaceWithText(
      `if (${parameterName} instanceof WebAssembly.Module) { ${assignVar} = Promise.resolve(${parameterName}) } else ${ifStmt.getText()}`
    )
  }

  // Add a check for WebAssembly.Module imported from a different V8 context
  // (e.g. a different iframe or worker), fixing the instanceof check.
  {
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.PropertyAccessExpression)
      .filter((i) => i.getText() === "WebAssembly.Module")
      .map((i) =>
        i.getFirstAncestorByKindOrThrow(ts.SyntaxKind.BinaryExpression)
      )
      .filter((i) => i.getOperatorToken().getText() === "instanceof")
      .forEach((expr) => {
        const text = expr.getText()
        const name = expr
          .getLeft()
          .asKindOrThrow(ts.SyntaxKind.Identifier)
          .getText()
        expr.replaceWithText(
          `${text} || ${name}.toString().includes("WebAssembly.Module")`
        )
      })
  }
}

const targetFilePath = path.resolve(
  __dirname,
  "../node_modules/web-tree-sitter/tree-sitter.js"
)
const sourceFile = new Project().addSourceFileAtPath(targetFilePath)

patch(sourceFile)

sourceFile.saveSync()

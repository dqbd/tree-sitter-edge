declare module "@diagram/web-tree-sitter/javascript" {
  import { Language } from "@diagram/web-tree-sitter"
  const JavaScript: { Language: Language; init?: () => Promise<void> }

  export = JavaScript
}

import tokenize from "./lexer.js"
import parse from "./parser.js"
import analyze from "./analyzer.js"
import optimize from "./optimizer.js"
import generate from "./generator/index.js"

export default function compile(source, outputType) {
  const tokens = tokenize(source)
  if (outputType === "tokens") return [...tokens]
  const ast = parse(tokens)
  if (outputType === "ast") return ast
  const analyzed = analyze(ast)
  if (outputType === "analyzed") return analyzed
  const optimized = optimize(analyzed)
  if (outputType === "optimized") return optimized
  if (["js", "c", "llvm"].includes(outputType)) {
    return generate(outputType)(optimized)
  }
  throw new Error("Unknown output type")
}

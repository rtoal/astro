import assert from "assert"
import tokenize from "../src/scanner.js"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as ast from "../src/ast.js"

const semanticChecks = [
  ["print variable", "x = 1; print(x);"],
  ["reassign variable", "x = 1; x = x * 5 / (3 + x);"],
  ["predefined identifiers", "print(sqrt(sin(cos(π + random()))));"],
]

const semanticErrors = [
  ["non declared ids", "print(x);", /Identifier x not declared/],
  ["var used as function", "x = 1; x(2);", /expected/],
  ["function used as var", "print(sin + 1);", /expected/],
  ["attempt to write a read-only var", "π = 3;", /The identifier π is read only/],
  ["too few args", "print(sin());", /Expected 1 arg\(s\), found 0/],
  ["too many args", "print(sin(5, 10));", /Expected 1 arg\(s\), found 2/],
]

// const varX = new ast.Variable("x")
// const letX1 = Object.assign(new ast.VariableDeclaration("x", 1), {
//   variable: varX,
// })
// const assignX2 = new ast.Assignment(varX, 2)
// const graphChecks = [["Variable created & resolved", "let x=1 x=2", [letX1, assignX2]]]
const graphChecks = []

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(tokenize(source))))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(tokenize(source))), errorMessagePattern)
    })
  }
  for (const [scenario, source, graph] of graphChecks) {
    it(`properly rewrites the AST for ${scenario}`, () => {
      assert.deepStrictEqual(analyze(parse(tokenize(source))), new ast.Program(graph))
    })
  }
})

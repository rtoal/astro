import assert from "assert/strict"
import tokenize from "../src/lexer.js"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

const semanticChecks = [
  ["variables can be printed", "x = 1; print(x);"],
  ["variables can be reassigned", "x = 1; x = x * -5 / (3 + x);"],
  ["all operators", "x = 3 * -2 + 4 - -7.3 * 8 ** 13 ** 2 / 1;"],
  ["all predefined identifiers", "print(sqrt(sin(cos(π + random()))));"],
]

const semanticErrors = [
  ["using undeclared identifiers", "print(x);", /Identifier x not declared/],
  ["a variable used as function", "x = 1; x(2);", /expected/],
  ["a function used as variable", "print(sin + 1);", /expected/],
  ["an attempt to write a read-only var", "π = 3;", /The identifier π is read only/],
  ["too few arguments", "print(sin());", /Expected 1 arg\(s\), found 0/],
  ["too many arguments", "print(sin(5, 10));", /Expected 1 arg\(s\), found 2/],
  ["procedure called in expression", "x=print(1);", /print does not return a value/],
  ["function called as statement", "sin(1);", /Return value of sin must be used/],
]

// TODO
// const varX = new core.Variable("x")
// const letX1 = Object.assign(new core.VariableDeclaration("x", 1), {
//   variable: varX,
// })
// const assignX2 = new core.Assignment(varX, 2)
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
      assert.deepEqual(analyze(parse(tokenize(source))), new core.Program(graph))
    })
  }
})

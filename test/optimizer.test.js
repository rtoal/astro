import assert from "assert/strict"
import tokenize from "../src/lexer.js"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Make some test cases easier to read
const x = new core.Variable("x", false)
const neg = x => new core.UnaryExpression("-", x)
const power = (x, y) => new core.BinaryExpression("**", x, y)
const sqrt = core.standardLibrary.sqrt
const print = core.standardLibrary.print
const call = (f, args, isStatement) => new core.Call(f, args, isStatement)

function expression(e) {
  return analyze(parse(tokenize(`x=1; print(${e});`))).statements[1].args[0]
}

const tests = [
  ["folds +", expression("5 + 8"), 13],
  ["folds -", expression("5 - 8"), -3],
  ["folds *", expression("5 * 8"), 40],
  ["folds /", expression("5 / 8"), 0.625],
  ["folds %", expression("17 % 5"), 2],
  ["folds **", expression("5 ** 8"), 390625],
  ["optimizes +0", expression("x + 0"), x],
  ["optimizes -0", expression("x - 0"), x],
  ["optimizes *1", expression("x * 1"), x],
  ["optimizes /1", expression("x / 1"), x],
  ["optimizes *0", expression("x * 0"), 0],
  ["optimizes 0*", expression("0 * x"), 0],
  ["optimizes 0/", expression("0 / x"), 0],
  ["optimizes 0+", expression("0 + x"), x],
  ["optimizes 0-", expression("0 - x"), neg(x)],
  ["optimizes 1*", expression("1 * x"), x],
  ["folds negation", expression("- 8"), -8],
  ["optimizes 1**", expression("1 ** x"), 1],
  ["optimizes **0", expression("x ** 0"), 1],
  ["optimizes sqrt", expression("sqrt(16)"), 4],
  ["optimizes sin", expression("sin(0)"), 0],
  ["optimizes cos", expression("cos(0)"), 1],
  ["optimizes deeply", expression("8 * (-5) + 2 ** 3"), -32],
  ["optimizes arguments", expression("sqrt(20 + 61)"), 9],
  ["leaves nonoptimizable binaries alone", expression("x ** 5"), power(x, 5)],
  ["leaves 0**0 alone", expression("0 ** 0"), power(0, 0)],
  ["leaves nonoptimizable calls alone", expression("sqrt(x)"), call(sqrt, [x])],
  [
    "removes x=x",
    analyze(parse(tokenize("x=1; x=x; print(x);"))),
    new core.Program([new core.Assignment(x, 1), call(print, [x], true)]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})

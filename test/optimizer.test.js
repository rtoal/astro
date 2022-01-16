import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as ast from "../src/ast.js"
import { standardLibrary } from "../src/analyzer.js"

// Make some test cases easier to read
const x = new ast.Variable("x", false)
const neg = x => new ast.UnaryExpression("-", x)
const print = standardLibrary.print
const sqrt = standardLibrary.sqrt
const sin = standardLibrary.sin
const cos = standardLibrary.cos
const print1 = new ast.Call(print, [1])
const twoPlusThree = new ast.BinaryExpression("+", 2, 3)

const tests = [
  ["folds +", new ast.BinaryExpression("+", 5, 8), 13],
  ["folds -", new ast.BinaryExpression("-", 5, 8), -3],
  ["folds *", new ast.BinaryExpression("*", 5, 8), 40],
  ["folds /", new ast.BinaryExpression("/", 5, 8), 0.625],
  ["folds %", new ast.BinaryExpression("%", 17, 5), 2],
  ["folds **", new ast.BinaryExpression("**", 5, 8), 390625],
  ["optimizes +0", new ast.BinaryExpression("+", x, 0), x],
  ["optimizes -0", new ast.BinaryExpression("-", x, 0), x],
  ["optimizes *1", new ast.BinaryExpression("*", x, 1), x],
  ["optimizes /1", new ast.BinaryExpression("/", x, 1), x],
  ["optimizes *0", new ast.BinaryExpression("*", x, 0), 0],
  ["optimizes 0*", new ast.BinaryExpression("*", 0, x), 0],
  ["optimizes 0/", new ast.BinaryExpression("/", 0, x), 0],
  ["optimizes 0+", new ast.BinaryExpression("+", 0, x), x],
  ["optimizes 0-", new ast.BinaryExpression("-", 0, x), neg(x)],
  ["optimizes 1*", new ast.BinaryExpression("*", 1, x), x],
  ["folds negation", new ast.UnaryExpression("-", 8), -8],
  ["optimizes 1**", new ast.BinaryExpression("**", 1, x), 1],
  ["optimizes **0", new ast.BinaryExpression("**", x, 0), 1],
  ["optimizes sqrt", new ast.Call(sqrt, [16]), 4],
  ["optimizes sin", new ast.Call(sin, [0]), 0],
  ["optimizes cos", new ast.Call(cos, [0]), 1],
  ["removes x=x at beginning", [new ast.Assignment(x, x), print1], [print1]],
  ["removes x=x at end", [print1, new ast.Assignment(x, x)], [print1]],
  ["removes x=x in middle", [print1, new ast.Assignment(x, x), print1], [print1, print1]],
  [
    "descends into programs",
    new ast.Program([print1, new ast.Call(print, [twoPlusThree])]),
    new ast.Program([print1, new ast.Call(print, [5])]),
  ],
  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      new ast.Assignment(x, new ast.BinaryExpression("*", x, 5)),
      new ast.Assignment(x, new ast.BinaryExpression("**", 0, 0)),
      new ast.Assignment(x, new ast.UnaryExpression("-", x)),
    ]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})

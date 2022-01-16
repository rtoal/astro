import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Make some test cases easier to read
const x = new core.Variable("x", false)
const neg = x => new core.UnaryExpression("-", x)
const print = core.standardLibrary.print
const sqrt = core.standardLibrary.sqrt
const sin = core.standardLibrary.sin
const cos = core.standardLibrary.cos
const print1 = new core.Call(print, [1])
const twoPlusThree = new core.BinaryExpression("+", 2, 3)

const tests = [
  ["folds +", new core.BinaryExpression("+", 5, 8), 13],
  ["folds -", new core.BinaryExpression("-", 5, 8), -3],
  ["folds *", new core.BinaryExpression("*", 5, 8), 40],
  ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
  ["folds %", new core.BinaryExpression("%", 17, 5), 2],
  ["folds **", new core.BinaryExpression("**", 5, 8), 390625],
  ["optimizes +0", new core.BinaryExpression("+", x, 0), x],
  ["optimizes -0", new core.BinaryExpression("-", x, 0), x],
  ["optimizes *1", new core.BinaryExpression("*", x, 1), x],
  ["optimizes /1", new core.BinaryExpression("/", x, 1), x],
  ["optimizes *0", new core.BinaryExpression("*", x, 0), 0],
  ["optimizes 0*", new core.BinaryExpression("*", 0, x), 0],
  ["optimizes 0/", new core.BinaryExpression("/", 0, x), 0],
  ["optimizes 0+", new core.BinaryExpression("+", 0, x), x],
  ["optimizes 0-", new core.BinaryExpression("-", 0, x), neg(x)],
  ["optimizes 1*", new core.BinaryExpression("*", 1, x), x],
  ["folds negation", new core.UnaryExpression("-", 8), -8],
  ["optimizes 1**", new core.BinaryExpression("**", 1, x), 1],
  ["optimizes **0", new core.BinaryExpression("**", x, 0), 1],
  ["optimizes sqrt", new core.Call(sqrt, [16]), 4],
  ["optimizes sin", new core.Call(sin, [0]), 0],
  ["optimizes cos", new core.Call(cos, [0]), 1],
  ["removes x=x at beginning", [new core.Assignment(x, x), print1], [print1]],
  ["removes x=x at end", [print1, new core.Assignment(x, x)], [print1]],
  [
    "removes x=x in middle",
    [print1, new core.Assignment(x, x), print1],
    [print1, print1],
  ],
  [
    "descends into programs",
    new core.Program([print1, new core.Call(print, [twoPlusThree])]),
    new core.Program([print1, new core.Call(print, [5])]),
  ],
  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      new core.Assignment(x, new core.BinaryExpression("*", x, 5)),
      new core.Assignment(x, new core.BinaryExpression("**", 0, 0)),
      new core.Assignment(x, new core.UnaryExpression("-", x)),
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

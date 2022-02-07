import util from "util"
import assert from "assert/strict"
import {
  Assignment,
  Call,
  Program,
  Token,
  UnaryExpression,
  BinaryExpression,
  error,
  Variable,
  Function,
} from "../src/core.js"

// The core module just defines classes for Tokens and AST nodes,
// these get “tested” by use. The only tests we really need to do
// are to make sure the error() function properly throws and that
// the pretty printer gives the expected string.

const parsed = new Program([
  new Assignment(
    new Token("Id", "x"),
    new BinaryExpression(
      new Token("Sym", "**"),
      new Token("Num", "3"),
      new UnaryExpression(new Token("Sym", "-"), new Token("Id", "π"))
    )
  ),
  new Call(new Token("Id", "print"), [
    new Call(new Token("Id", "sin"), [new Token("Id", "x")]),
  ]),
])

const x = new Variable("x", false)
const print = new Function("print", Infinity, true, false)
const analyzed = new Program([
  new Assignment(x, 1),
  new Call(print, [x], true),
  new Call(print, [x], true),
])

const expectedParseOutput = `   1 | Program statements=[#2,#5]
   2 | Assignment target=Id("x") source=#3
   3 | BinaryExpression op=Sym("**") left=Num("3") right=#4
   4 | UnaryExpression op=Sym("-") operand=Id("π")
   5 | Call callee=Id("print") args=[#6] isStatement=false
   6 | Call callee=Id("sin") args=[Id("x")] isStatement=false`

const expectedAnalysisOutput = `   1 | Program statements=[#2,#4,#6]
   2 | Assignment target=#3 source=1
   3 | Variable name='x' readOnly=false
   4 | Call callee=#5 args=[#3] isStatement=true
   5 | Function name='print' paramCount=Infinity readOnly=true valueReturning=false
   6 | Call callee=#5 args=[#3] isStatement=true`

describe("In the core module", () => {
  it("The error function throws with line and column data if present", () => {
    assert.throws(
      () => error("Oh no!", { line: 3, column: 2 }),
      /Line 3, Column 2: Oh no!/
    )
  })
  it("The error function ignores line and column data if missing", () => {
    assert.throws(() => error("Oh no!", { column: 2 }), /Line -, Column 2: Oh no!/)
    assert.throws(() => error("Oh no!", { line: 2 }), /Line 2, Column -: Oh no!/)
    assert.throws(() => error("Oh no!"), /Line -, Column -: Oh no!/)
  })
  it("the pretty printer gives an expected result for ASTs", () => {
    assert.deepEqual(util.format(parsed), expectedParseOutput)
  })
  it("the pretty printer gives an expected result for decorated ASTs", () => {
    assert.deepEqual(util.format(analyzed), expectedAnalysisOutput)
  })
})

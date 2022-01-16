import assert from "assert/strict"
import tokenize from "../src/scanner.js"
import parse from "../src/parser.js"
import * as ast from "../src/ast.js"

const syntaxChecks = [
  ["all numeric literal forms", "print(8 * 89.123);"],
  ["complex expressions", "print(83 * ((((((((-13 / 21)))))))) + 1 - -0);"],
  ["end of program inside comment", "print(0); // yay"],
  ["comments with no text", "print(1);//\nprint(0);//"],
  ["non-Latin letters in identifiers", "コンパイラ = 100;"],
]

const syntaxErrors = [
  [
    "non-letter in an identifier",
    "ab😭c = 2",
    /Line 1, Column 2: Unexpected character: '😭'/,
  ],
  ["malformed number", "x= 2.", /Line 1, Column 6: Digit expected/],
  ["missing semicolon", "x = 3 y = 1", /Line 1, Column 7: Expected ';'/],
  [
    "a missing right operand",
    "print(5 -",
    /Line 2, Column 1: Expected id, number, or '\('/,
  ],
  [
    "a non-operator",
    "print(7 * ((2 _ 3)",
    /Line 1, Column 14: Unexpected character: '_'/,
  ],
  [
    "an expression starting with a )",
    "x = );",
    /Line 1, Column 5: Expected id, number, or '\('/,
  ],
  [
    "a statement starting with expression",
    "x * 5;",
    /Error: Line 1, Column 3: "=" or "\(" expected/,
  ],
  [
    "an illegal statement on line 2",
    "print(5);\nx * 5;",
    /Line 2, Column 3: "=" or "\(" expected/,
  ],
  [
    "a statement starting with a )",
    "print(5);\n) * 5",
    /Line 2, Column 1: Statement expected/,
  ],
  [
    "an expression starting with a *",
    "x = * 71;",
    /Line 1, Column 5: Expected id, number, or '\('/,
  ],
]

const source = `x=-1;print(x**5);`

const expectedAst = new ast.Program([
  new ast.Assignment(
    new ast.Token("#ID", "x", 1, 1),
    new ast.UnaryExpression(
      new ast.Token("#SYMBOL", "-", 1, 3),
      new ast.Token("#NUMBER", "1", 1, 4)
    )
  ),
  new ast.Call(new ast.Token("#ID", "print", 1, 6), [
    new ast.BinaryExpression(
      new ast.Token("#SYMBOL", "**", 1, 13),
      new ast.Token("#ID", "x", 1, 12),
      new ast.Token("#NUMBER", "5", 1, 15)
    ),
  ]),
])

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`recognizes that ${scenario}`, () => {
      assert(parse(tokenize(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => parse(tokenize(source)), errorMessagePattern)
    })
  }
  it("produces the expected AST for all node types", () => {
    assert.deepEqual(parse(tokenize(source)), expectedAst)
  })
})

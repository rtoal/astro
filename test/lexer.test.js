import assert from "assert/strict"
import tokenize from "../src/lexer.js"
import { Token } from "../src/core.js"

const errorCases = [
  ["malformed number", "2.f", /Error: Line 1, Column 3: Digit expected/],
  ["unknown character", "y = @x", /Error: Line 1, Column 4: Unexpected character: '@'/],
  ["unknown emoji", "𐌸 = -😎", /Line 1, Column 5: Unexpected character: '😎'/],
]

// Test case uses astral characters to test columns are correct
const allTokens = `𐌸𐌺𐍉𐍆 =  1
    print(x * 3  / 
      ++   π ** 22.5);   // comment


   // OK
   %*1-       77;`

const expectedTokens = [
  new Token("Id", "𐌸𐌺𐍉𐍆", 1, 1),
  new Token("Sym", "=", 1, 6),
  new Token("Num", "1", 1, 9),
  new Token("Id", "print", 2, 5),
  new Token("Sym", "(", 2, 10),
  new Token("Id", "x", 2, 11),
  new Token("Sym", "*", 2, 13),
  new Token("Num", "3", 2, 15),
  new Token("Sym", "/", 2, 18),
  new Token("Sym", "+", 3, 7),
  new Token("Sym", "+", 3, 8),
  new Token("Id", "π", 3, 12),
  new Token("Sym", "**", 3, 14),
  new Token("Num", "22.5", 3, 17),
  new Token("Sym", ")", 3, 21),
  new Token("Sym", ";", 3, 22),
  new Token("Sym", "%", 7, 4),
  new Token("Sym", "*", 7, 5),
  new Token("Num", "1", 7, 6),
  new Token("Sym", "-", 7, 7),
  new Token("Num", "77", 7, 15),
  new Token("Sym", ";", 7, 17),
  new Token("End", "", 8, 1),
]

describe("The lexer", () => {
  it(`correctly tokenizes the big test case`, () => {
    assert.deepEqual(expectedTokens, [...tokenize(allTokens)])
  })
  for (const [scenario, source, errorMessagePattern] of errorCases) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => [...tokenize(source)], errorMessagePattern)
    })
  }
})

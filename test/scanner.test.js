import assert from "assert/strict"
import tokenize from "../src/scanner.js"
import { Token } from "../src/ast.js"

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
  new Token("#ID", "𐌸𐌺𐍉𐍆", 1, 1),
  new Token("#SYMBOL", "=", 1, 6),
  new Token("#NUMBER", "1", 1, 9),
  new Token("#ID", "print", 2, 5),
  new Token("#SYMBOL", "(", 2, 10),
  new Token("#ID", "x", 2, 11),
  new Token("#SYMBOL", "*", 2, 13),
  new Token("#NUMBER", "3", 2, 15),
  new Token("#SYMBOL", "/", 2, 18),
  new Token("#SYMBOL", "+", 3, 7),
  new Token("#SYMBOL", "+", 3, 8),
  new Token("#ID", "π", 3, 12),
  new Token("#SYMBOL", "**", 3, 14),
  new Token("#NUMBER", "22.5", 3, 17),
  new Token("#SYMBOL", ")", 3, 21),
  new Token("#SYMBOL", ";", 3, 22),
  new Token("#SYMBOL", "%", 7, 4),
  new Token("#SYMBOL", "*", 7, 5),
  new Token("#NUMBER", "1", 7, 6),
  new Token("#SYMBOL", "-", 7, 7),
  new Token("#NUMBER", "77", 7, 15),
  new Token("#SYMBOL", ";", 7, 17),
  new Token("#END", "", 8, 1),
]

describe("The scanner", () => {
  it(`correctly scans the big test case`, () => {
    assert.deepEqual(expectedTokens, [...tokenize(allTokens)])
  })
  for (const [scenario, source, errorMessagePattern] of errorCases) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => [...tokenize(source)], errorMessagePattern)
    })
  }
})

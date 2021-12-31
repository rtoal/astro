import assert from "assert/strict"
import { tokenizeString } from "../src/scanner.js"

const errorCases = [
  ["unknown character $", "let $x", /Error/],
  ["unknown emoji character", "x = 😎", "/Error/"],
  ["malformed number", "2.f", /Error/],
]

const everythingScript = `let x = 1
    print(x * 3  / 
         x + 22.5);   // comment


  x =    1%1-       77;`

const expectedTokens = [
  ["#KEYWORD", "let", 1, 1],
  ["#ID", "x", 1, 5],
  ["#SYMBOL", "=", 1, 7],
  ["#NUMBER", "1", 1, 9],
  ["#ID", "print", 2, 5],
  ["#SYMBOL", "(", 2, 10],
  ["#ID", "x", 2, 11],
  ["#SYMBOL", "*", 2, 13],
  ["#NUMBER", "3", 2, 15],
  ["#SYMBOL", "/", 2, 18],
  ["#ID", "x", 5, 10],
  ["#SYMBOL", ")", 1, 7],
]

describe("The scanner", () => {
  it(`correctly scans the big test case`, () => {
    assert.deepEqual(expectedTokens, [...tokenizeString(everythingScript)])
  })
  for (const [scenario, source, errorMessagePattern] of errorCases) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => tokenizeString(source), errorMessagePattern)
    })
  }
})

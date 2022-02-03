// Scanner
//
// This is a hand-crafted scanner, using no external libraries at all. The
// module exports a function to tokenize a program passed as a string.
// (A real-life compiler would provide a way to compile line-by-line from
// a file as well.)
//
// Tokens are yielded as tuples of the form [category, lexeme, line, column].
// Categories always begin with a # character. There are four categories,
// illustrated here in these example tokens:
//
//   { category: "Id", lexeme: "found", line: 8, column: 34 }
//   { category: "Num", lexeme: "153.8831", line: 21, column: 13 }
//   { category: "Sym", lexeme: "<=", line: 89, column: 5 }
//   { category: "End", lexeme: "", line: 21, column: 1 }

import { Token, error } from "./core.js"

export default function* tokenize(program) {
  let lineNumber = 1
  for (let line of program.split(/\r?\n/)) {
    yield* tokenizeLine(lineNumber++, [...line, "\n"])
  }
  yield new Token("End", "", lineNumber, 1)
}

// Line is expected to be an array of Unicode chars not JS chars
function* tokenizeLine(lineNumber, line) {
  for (let i = 0; i < line.length; ) {
    // Skip spaces
    while (/[ \t]/.test(line[i])) i++

    // Done if at end or starting a comment
    if (line[i] === "\n" || line[i] + line[i + 1] === "//") break

    // Gather up the lexeme from start..i
    let category
    let start = i++
    if (/\p{L}/u.test(line[start])) {
      while (/[\p{L}\d_]/u.test(line[i])) i++
      category = "Id"
    } else if (/\d/.test(line[start])) {
      while (/\d/.test(line[i])) i++
      if (line[i] === ".") {
        i++
        if (!/\d/.test(line[i])) {
          error(`Digit expected`, { line: lineNumber, column: i + 1 })
        }
        while (/\d/.test(line[i])) i++
      }
      category = "Num"
    } else if (/[-+*/%=,;()]/.test(line[start])) {
      if (line[start] + line[i] === "**") i++
      category = "Sym"
    } else {
      error(`Unexpected character: '${line[start]}'`, { line: lineNumber, column: start })
    }

    // Compensate for column beginning at 1, not 0
    yield new Token(category, line.slice(start, i).join(""), lineNumber, start + 1)
  }
}

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
//   ("#ID", "found", 8, 34)
//   ("#NUMBER", "153.8831", 21, 13)
//   ("#SYMBOL", "<=", 89, 5)
//   ("#END", "", 21, 1)

export class Token {
  constructor(category, lexeme, line, column) {
    Object.assign(this, { category, lexeme, line, column })
  }
}

export function* tokenize(program) {
  let lineNumber = 1
  for (let line of program.split(/\r?\n/)) {
    yield* tokenizeLine(lineNumber++, [...line])
  }
  yield new Token("#END", "", lineNumber, 1)
}

// Line is expected to be an array of Unicode chars not JS chars
function* tokenizeLine(lineNumber, line) {
  for (let i = 0; i < line.length; ) {
    // Skip spaces
    while (/[ \t]/.test(line[i])) i++

    // Done if at end or starting a comment
    if (i >= line.length) return
    if (line[i] + line[i + 1] === "//") return

    // Gather up the lexeme from start..i
    let category
    let start = i++
    if (/\p{L}/u.test(line[start])) {
      while (/[\p{L}\d_]/u.test(line[i])) i++
      category = "#ID"
    } else if (/\d/.test(line[start])) {
      while (/\d/.test(line[i])) i++
      if (line[i] === ".") {
        i++
        while (/\d/.test(line[i])) i++
      }
      category = "#NUMBER"
    } else if (/[-+*/%=;()]/.test(line[start])) {
      if (line[start] + line[i] === "**") i++
      category = "#SYMBOL"
    } else {
      throw new Error(`Unexpected character: '${line[i]}'`)
    }

    // Compensate for column beginning at 1, not 0
    yield new Token(category, line.slice(start, i).join(""), lineNumber, start + 1)
  }
}

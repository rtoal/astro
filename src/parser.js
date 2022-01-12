// Parser
//
// This is a recursive descent parser. Each phrase rule gets its own parsing
// function which returns a piece of the Abstract Syntax Tree or throws an
// Error. More information about Recursive Descent Parsing can be found at
// https://en.wikipedia.org/wiki/Recursive_descent_parser.
//
// The parser is implemented as a function accepting a token stream from a
// generator. In addition to the variable *token*, the parser uses three
// utility functions:
//
//     match(t)
//         Here t is a lexeme, a category, or an array of lexemes/categories.
//         If the next token in the stream matches t (has the lexeme, has the
//         category, or its lexeme/category in the array), the consume it and
//         return it. Otherwise, throw an error.
//
//     match()
//         Consume and return the next token, whatever it is.
//
//     at(t)
//         Similar to match(t) but just returns whether the current token
//         matches, without consuming it.
//
// When calling match() or at(), you can supply either a category or a lexeme,
// or an array of categories and lexemes:
//
//     match("#ID")
//     match("=")
//     match(["+", "-", "#NUMBER"])
//     at(["/", "*"])

import { Program, Assignment, Call, BinaryExpression, UnaryExpression } from "./ast.js"
import error from "./error.js"

export default function parse(tokenStream) {
  let token = tokenStream.next().value

  function at(candidate) {
    // Just checks whether we’re (looking) at a token or tokens we expect
    if (Array.isArray(candidate)) {
      return candidate.some(at)
    }
    if (candidate.startsWith("#")) {
      return token.category === candidate
    }
    return token.lexeme === candidate
  }

  function match(expected) {
    // Advances iff we’re at a token we want to be at
    if (expected === undefined || at(expected)) {
      const matchedToken = token
      token = tokenStream.next().value
      return matchedToken
    }
    error(`Expected '${expected}'`, token)
  }

  function parseProgram() {
    const statements = []
    do {
      statements.push(parseStatement())
      match(";")
    } while (!at("#END"))
    return new Program(statements)
  }

  function parseStatement() {
    if (at("#ID")) {
      const id = match()
      if (at("=")) {
        match()
        return new Assignment(id, parseExpression())
      } else if (at("(")) {
        return new Call(id, parseArgs())
      }
      error(`"=" or "(" expected`, token)
    }
    error("Statement expected", token)
  }

  function parseExpression() {
    let left = parseTerm()
    while (at(["+", "-"])) {
      const op = match()
      const right = parseTerm()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }

  function parseTerm() {
    let left = parseFactor()
    while (at(["*", "/", "%"])) {
      const op = match()
      const right = parseFactor()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }

  function parseFactor() {
    let left = parsePrimary()
    if (at("**")) {
      const op = match()
      const right = parseFactor()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }

  function parsePrimary() {
    if (at("#NUMBER")) {
      return match()
    } else if (at("#ID")) {
      const id = match()
      return at("(") ? new Call(id, parseArgs()) : id
    } else if (at("-")) {
      const op = match()
      return new UnaryExpression(op, parsePrimary())
    } else if (at("(")) {
      match()
      const e = parseExpression()
      match(")")
      return e
    }
    error("Expected id, number, or '('", token)
  }

  function parseArgs() {
    match("(")
    const args = []
    if (!at(")")) {
      args.push(parseExpression())
      while (at(",")) {
        match()
        args.push(parseExpression())
      }
    }
    match(")")
    return args
  }

  return parseProgram()
}

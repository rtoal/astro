// Semantic Analyzer
//
// Analyzes the AST by looking for semantic errors and resolving references.

import { Variable, Function } from "./ast.js"
import error from "./error.js"

class Context {
  constructor() {
    // In Astro, the only analysis context needed is the set of declared
    // variables. We store this as a map, indexed by the variable name,
    // for efficient lookup. More complex languages will a lot more here,
    // such as the current function (to validate return statements), whether
    // you were in a loop (for validating breaks and continues), and a link
    // to a parent context for static scope analysis.
    this.locals = new Map()
  }
  add(name, entity) {
    this.locals.set(name, entity)
  }
  lookup(token) {
    return this.locals.get(token.lexeme)
  }
  get(token) {
    const entity = this.lookup(token)
    if (!entity) error(`Identifier ${token.lexeme} not declared`, token)
    return entity
  }
  getVariable(token) {
    const entity = this.get(token)
    if (!entity.constructor === Variable) {
      error(`Cannot use function ${token.lexeme} here`, token)
    }
    return entity
  }
  getFunction(token) {
    const entity = this.get(token)
    if (!entity.constructor === Function) error(`${token.lexeme} cannot be called`, token)
    return entity
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  Assignment(s) {
    s.source = this.analyze(s.source)
    let entity = this.lookup(s.target)
    if (!entity) {
      entity = this.add(new Variable(s.target.lexeme, false))
    } else if (entity.readOnly) {
      error(`The identifier ${s.target.lexeme} is read only`, token)
    }
    s.target = entity
    return s
  }
  BinaryExpression(e) {
    e.left = this.analyze(e.left)
    e.right = this.analyze(e.right)
    e.op = e.op.lexeme
    return e
  }
  UnaryExpression(e) {
    e.operand = this.analyze(e.operand)
    e.op = e.op.lexeme
    return e
  }
  Call(c) {
    c.args = this.analyze(c.args)
    c.callee = this.getFunction(c.callee)
    if (Number.isFinite(c.callee.paramCount)) {
      if (c.args.length !== c.callee.paramCount) {
        error(`Expected ${c.callee.paramCount} args, found ${c.args.length}`)
      }
    }
    return c
  }
  Token(e) {
    if (e.category === "#ID") return this.getVariable(e)
    if (e.category === "#NUMBER") return Number(e.lexeme)
    return e
  }
  Array(a) {
    return a.map(item => this.analyze(item))
  }
}

export const standardLibrary = {
  π: new Variable("π", true),
  sqrt: new Function("sqrt", 1, true),
  sin: new Function("sin", 1, true),
  cos: new Function("cos", 1, true),
  random: new Function("random", 0, true),
  print: new Function("print", Infinity, true),
}

export default function analyze(programNode) {
  const initialContext = new Context()
  for (const [name, entity] of Object.entries(standardLibrary)) {
    initialContext.add(name, entity)
  }
  return initialContext.analyze(programNode)
}

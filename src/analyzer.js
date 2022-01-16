// Semantic Analyzer
//
// Analyzes the AST by looking for semantic errors and resolving references.

import { Variable, Function, standardLibrary, error } from "./core.js"

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
    return entity
  }
  lookup(token) {
    return this.locals.get(token.lexeme)
  }
  get(token, expectedType) {
    const entity = this.lookup(token)
    if (!entity) error(`Identifier ${token.lexeme} not declared`, token)
    if (entity.constructor !== expectedType) {
      error(`${token.lexeme} was expected to be a ${expectedType.name}`, token)
    }
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
      entity = this.add(s.target.lexeme, new Variable(s.target.lexeme, false))
    } else if (entity.readOnly) {
      error(`The identifier ${s.target.lexeme} is read only`, s.target)
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
    c.callee = this.get(c.callee, Function)
    if (c.isStatement && c.callee.valueReturning) {
      error(`Return value of ${c.callee.name} must be used`)
    }
    if (!c.isStatement && !c.callee.valueReturning) {
      error(`${c.callee.name} does not return a value`)
    }
    if (Number.isFinite(c.callee.paramCount)) {
      if (c.args.length !== c.callee.paramCount) {
        error(`Expected ${c.callee.paramCount} arg(s), found ${c.args.length}`)
      }
    }
    return c
  }
  Token(t) {
    if (t.category === "#ID") return this.get(t, Variable)
    if (t.category === "#NUMBER") return Number(t.lexeme)
    return e
  }
  Array(a) {
    return a.map(item => this.analyze(item))
  }
}

export default function analyze(programNode) {
  const initialContext = new Context()
  for (const [name, entity] of Object.entries(standardLibrary)) {
    initialContext.add(name, entity)
  }
  return initialContext.analyze(programNode)
}

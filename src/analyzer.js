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
  addVariable(name, readOnly = false) {
    const entity = new Variable(name, readOnly)
    this.locals.set(name, entity)
    return entity
  }
  addFunction(name, numberOfArguments, readOnly = true) {
    this.locals.set(name, new Function(name, numberOfArguments, readOnly))
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
      entity = this.addVariable(s.target.lexeme)
    } else if (entity.readOnly) {
      error(`The identifier ${s.target.lexeme} is read only`, token)
    }
    s.target = entity
    return s
  }
  BinaryExpression(e) {
    e.left = this.analyze(e.left)
    e.right = this.analyze(e.right)
    return e
  }
  UnaryExpression(e) {
    e.operand = this.analyze(e.operand)
    return e
  }
  Call(c) {
    c.args = this.analyze(c.args)
    c.callee = this.getFunction(c.callee)
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

export default function analyze(programNode) {
  const initialContext = new Context()
  initialContext.addVariable("π", true)
  initialContext.addFunction("sqrt", 1)
  initialContext.addFunction("sin", 1)
  initialContext.addFunction("cos", 1)
  initialContext.addFunction("random", 0)
  initialContext.addFunction("print", Infinity)
  return initialContext.analyze(programNode)
}

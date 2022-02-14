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
    this.analyze(p.statements)
  }
  Assignment(s) {
    this.analyze(s.source)
    let entity = this.lookup(s.target)
    if (!entity) {
      entity = this.add(s.target.lexeme, new Variable(s.target.lexeme, false))
    } else if (entity.readOnly) {
      error(`The identifier ${s.target.lexeme} is read only`, s.target)
    }
    s.target.value = entity
  }
  BinaryExpression(e) {
    this.analyze(e.left)
    this.analyze(e.right)
  }
  UnaryExpression(e) {
    this.analyze(e.operand)
  }
  Call(c) {
    this.analyze(c.args)
    c.callee.value = this.get(c.callee, Function)
    if (c.isStatement && c.callee.value.valueReturning) {
      error(`Return value of ${c.callee.value.name} must be used`)
    }
    if (!c.isStatement && !c.callee.value.valueReturning) {
      error(`${c.callee.value.name} does not return a value`)
    }
    if (Number.isFinite(c.callee.value.paramCount)) {
      if (c.args.length !== c.callee.value.paramCount) {
        error(`Expected ${c.callee.value.paramCount} arg(s), found ${c.args.length}`)
      }
    }
  }
  Token(t) {
    // Shortcut: only handle ids that are variables, not functions, here.
    // We will handle the ids in function calls in the Call() handler. This
    // strategy only works here, but in more complex languages, we would do
    // proper type checking.
    if (t.category === "Id") t.value = this.get(t, Variable)
    if (t.category === "Num") t.value = Number(t.lexeme)
  }
  Array(a) {
    a.forEach(item => this.analyze(item))
  }
}

export default function analyze(programNode) {
  const initialContext = new Context()
  for (const [name, entity] of Object.entries(standardLibrary)) {
    initialContext.add(name, entity)
  }
  initialContext.analyze(programNode)
  return programNode
}

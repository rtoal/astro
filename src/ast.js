// Abstract Syntax Tree Nodes
//
// This module defines classes for the AST nodes. Only the constructors are
// defined here. Semantic analysis methods, optimization methods, and code
// generation are handled by other modules. This keeps the compiler organized
// by phase.

export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class Variable {
  constructor(name) {
    this.name = name
  }
}

export class Function {
  constructor(name, parameters) {
    Object.assign(this, { name, parameters })
  }
}

export class Assignment {
  constructor(op, target, source) {
    Object.assign(this, { op, target, source })
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

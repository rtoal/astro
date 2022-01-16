// Code Generator Astro -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import { standardLibrary } from "../core.js"

export default function generate(program) {
  const output = []

  // Collect all assigned variables here so we can output declarations
  const assigned = new Set()

  // Variable names in JS will be suffixed with _1, _2, _3, etc. This is
  // because "while", for example, is a legal variable name in Astro, but
  // not in JS. So we want to generate something like "while_1". We handle
  // this by mapping each variable declaration to its suffix.
  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = node => generators[node.constructor.name](node)

  const generators = {
    Program(p) {
      output.push("") // leave one line open for variable declarations
      gen(p.statements)
    },
    Variable(v) {
      if (v === standardLibrary.π) return "Math.PI"
      return targetName(v)
    },
    Function(f) {
      if (f === standardLibrary.sqrt) return "Math.sqrt"
      if (f === standardLibrary.sin) return "Math.sin"
      if (f === standardLibrary.cos) return "Math.cos"
      if (f === standardLibrary.random) return "Math.random"
      if (f === standardLibrary.print) return "console.log"
      // Note: In general, we'd write <return targetName(f)> here,
      // but there are no functions in Astro other than these five!
    },
    Assignment(s) {
      const source = gen(s.source)
      const target = gen(s.target)
      assigned.add(target)
      output.push(`${target} = ${source};`)
    },
    Call(c) {
      const args = gen(c.args)
      const callee = gen(c.callee)
      if (c.isStatement) {
        output.push(`${callee}(${args.join(",")});`)
      } else {
        return `${callee}(${args.join(",")})`
      }
    },
    BinaryExpression(e) {
      return `(${gen(e.left)} ${e.op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      return `${e.op}(${gen(e.operand)})`
    },
    Number(e) {
      return e
    },
    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  output[0] = assigned.size > 0 ? `let ${[...assigned].join(", ")};` : ""
  return output.join("\n")
}

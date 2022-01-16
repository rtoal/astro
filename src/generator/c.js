// Code Generator Astro -> C
//
// Invoke generate(program) with the program node to get back the C
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
      output.push("#include <stdio.h>")
      output.push("#include <math.h>")
      output.push("int main() {")
      output.push("")
      gen(p.statements)
      output.push("return 0;")
      output.push("}")
    },
    Variable(v) {
      if (v === standardLibrary.π) return "M_PI"
      return targetName(v)
    },
    Function(f) {
      if (f === standardLibrary.sqrt) return "sqrt"
      if (f === standardLibrary.sin) return "sin"
      if (f === standardLibrary.cos) return "cos"
      if (f === standardLibrary.random) return "random"
      if (f === standardLibrary.print) return "printf"
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
        if (c.callee === standardLibrary.print) {
          const format = `"${Array(c.args.length).fill("%g").join(" ")}\\n"`
          const allArgs = [format, ...args].join(", ")
          output.push(`printf(${allArgs});`)
        }
        // Note: no else part needed, because print is the ONLY statement
        // level function in Astro. If we had others, we would have an else
        // part with <output.push(`${callee}(${args.join(",")});`)>
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
  output[3] = assigned.size > 0 ? `double ${[...assigned].join(", ")};` : ""
  return output.join("\n")
}

// Code Generator Astro -> C
//
// Invoke generate(program) with the program node to get back the C
// translation as a string.

import { standardLibrary } from "../core.js"

export default function generate(program) {
  const output = []

  // Collect all assigned variables here so we can output declarations
  const assigned = new Set()

  // Variable names in C will be suffixed with _1, _2, _3, etc. This is
  // because "while", for example, is a legal variable name in Astro, but
  // not in C. So we want to generate something like "while_1". We handle
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
      output.push("#include <stdlib.h>")
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
      // Only three possible functions will ever need to be generated, as
      // two of the five are intrinsically handled in the Call generator.
      return new Map([
        [standardLibrary.sqrt, "sqrt"],
        [standardLibrary.sin, "sin"],
        [standardLibrary.cos, "cos"],
      ]).get(f)
    },
    Assignment(s) {
      const source = gen(s.source)
      const target = gen(s.target)
      assigned.add(target)
      output.push(`${target} = ${source};`)
    },
    Call(c) {
      const args = gen(c.args)
      if (c.callee === standardLibrary.print) {
        const format = `"${Array(c.args.length).fill("%g").join(" ")}\\n"`
        const allArgs = [format, ...args].join(", ")
        output.push(`printf(${allArgs});`)
      } else if (c.callee == standardLibrary.random) {
        return "(rand()/(double)RAND_MAX)"
      } else {
        // Note: There is no need here in Astro to try to distinguish between
        // statement-level and expression-level calls as the ONLY statement-
        // level call, print, has been taken care of earlier as a special
        // case, so here the only possible kinds of functions remaining are
        // expression-level ones.
        return `${gen(c.callee)}(${args.join(",")})`
      }
    },
    BinaryExpression(e) {
      if (e.op === "**") {
        return `pow(${gen(e.left)}, ${gen(e.right)})`
      }
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
  // Fifth line declares all the variables (required in C, not in Astro)
  output[4] = assigned.size > 0 ? `double ${[...assigned].join(", ")};` : ""
  return output.join("\n")
}

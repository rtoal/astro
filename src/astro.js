#! /usr/bin/env node

import fs from "fs/promises"
import util from "util"
import process from "process"
import { Program } from "./ast.js"
import { tokenize, Token } from "./scanner.js"
import parse from "./parser.js"
// import analyze from "./analyzer.js"
// import optimize from "./optimizer.js"
// import generate from "./generator.js"

const help = `Astro compiler

Syntax: astro <filename> <outputType>

Prints to stdout according to <outputType>, which must be one of:

  tokens     the token sequence
  ast        the abstract syntax tree
  analyzed   the semantically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
  c          the translation to C
  llvm       the translation to LLVM IR
`

function compile(source, outputType) {
  const tokens = tokenize(source)
  if (outputType === "tokens") return [...tokens]
  const ast = parse(tokens)
  if (outputType === "ast") return ast
  //   const analyzed = analyze(ast)
  //   if (outputType === "analyzed") return analyzed
  //   const optimized = optimize(analyzed)
  //   if (outputType === "optimized") return optimized
  //   if (["js", "c", "llvm"].includes(outputType)) {
  //     return generate(outputType)(optimized)
  //   }
  return "Unknown output type"
}

Program.prototype[util.inspect.custom] = function () {
  // Return a compact and pretty string representation of the node graph,
  // taking care of cycles. Written here from scratch because the built-in
  // inspect function, while nice, isn't nice enough. Defined properly in
  // the AST root class prototype so it automatically runs on console.log.
  const tags = new Map()

  function tag(node) {
    // Attach a unique integer tag to every AST node
    if (tags.has(node)) return
    if (typeof node !== "object" || node === null) return
    if (node.constructor === Token) return
    tags.set(node, tags.size + 1)
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child)
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (e && e.constructor === Token) return e.lexeme
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, ""]
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`))
      yield `${String(id).padStart(4, " ")} | ${type}${props}`
    }
  }

  tag(this)
  return [...lines()].join("\n")
}

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename)
    console.log(compile(buffer.toString(), outputType))
  } catch (e) {
    console.error(e)
    process.exitCode = 1
  }
}

if (process.argv.length !== 4) {
  console.log(help)
} else {
  compileFromFile(process.argv[2], process.argv[3])
}

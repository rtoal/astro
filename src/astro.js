#! /usr/bin/env node

import fs from "fs/promises"
import process from "process"
import tokenize from "./scanner.js"
import parse from "./parser.js"
import analyze from "./analyzer.js"
import optimize from "./optimizer.js"
import generate from "./generator/index.js"

const help = `Astro compiler

Syntax: node astro.js <filename> <outputType>

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
  const analyzed = analyze(ast)
  if (outputType === "analyzed") return analyzed
  const optimized = optimize(analyzed)
  if (outputType === "optimized") return optimized
  if (["js", "c", "llvm"].includes(outputType)) {
    return generate(outputType)(optimized)
  }
  return "Unknown output type"
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

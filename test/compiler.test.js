import assert from "assert/strict"
import util from "util"
import compile from "../src/compiler.js"

const sampleProgram = "print(0);"

describe("The compiler", () => {
  it("throws when the output type is unknown", done => {
    assert.throws(() => compile("print(0);", "blah"), /Unknown output type/)
    done()
  })
  it("accepts the tokens option", done => {
    const compiled = compile(sampleProgram, "tokens")
    assert(Array.isArray(compiled))
    assert.equal(compiled.length, 6)
    done()
  })
  it("accepts the ast option", done => {
    const compiled = compile(sampleProgram, "ast")
    assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })
  it("accepts the analyzed option", done => {
    const compiled = compile(sampleProgram, "analyzed")
    assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })
  it("accepts the optimized option", done => {
    const compiled = compile(sampleProgram, "optimized")
    assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })
  it("generates js code when given the js option", done => {
    const compiled = compile(sampleProgram, "js")
    assert(util.format(compiled).startsWith("\nconsole.log(0)"))
    done()
  })
  it("generates c code when given the c option", done => {
    const compiled = compile(sampleProgram, "c")
    assert(util.format(compiled).startsWith("#include"))
    done()
  })
  //   it("generates llvm code when given the llvm option", done => {
  //     const compiled = compile(sampleProgram, "llvm")
  //     assert(util.format(compiled).startsWith("@format ="))
  //     done()
  //   })
})

import assert from "assert/strict"
import tokenize from "../src/lexer.js"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator/index.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

// Just one trivial test case for now, enough to get coverage.
const fixture = {
  source: `
    x = sin(random() ** 3.1);
    x = 5 * sqrt(x) / -x + x - cos(π);
    print(x);
  `,
  expected: {
    js: dedent`
      let x_1;
      x_1 = Math.sin((Math.random() ** 3.1));
      x_1 = ((((5 * Math.sqrt(x_1)) / -(x_1)) + x_1) - Math.cos(Math.PI));
      console.log(x_1);
    `,
    c: dedent`
      #include <stdio.h>
      #include <stdlib.h>
      #include <math.h>
      int main() {
      double x_1;
      x_1 = sin(pow((rand()/(double)RAND_MAX), 3.1));
      x_1 = ((((5 * sqrt(x_1)) / -(x_1)) + x_1) - cos(M_PI));
      printf("%g\\n", x_1);
      return 0;
      }
    `,
    llvm: dedent`
      @format = private constant [3 x i8] c"%g\\0A"
      declare i64 @printf(i8*, ...)
      declare double @llvm.sqrt.f64(double)
      declare double @llvm.sin.f64(double)
      declare double @llvm.cos.f64(double)
      declare i32 @rand()
      define i64 @main() {
      entry:
      %0 = call i32 @rand()
      %1 = sitofp i32 %0 to double
      %2 = fdiv double %1, 0x41DFFFFFFFC00000
      %3 = call double @llvm.pow.f64(double %2, double 3.1)
      %4 = call double @llvm.sin.f64(double %3)
      %5 = call double @llvm.sqrt.f64(double %4)
      %6 = fmul double 5.0, %5
      %7 = fsub double 0.0, %4
      %8 = fdiv double %6, %7
      %9 = fadd double %8, %4
      %10 = call double @llvm.cos.f64(double 3.141592653589793)
      %11 = fsub double %9, %10
      %12 = call i64 (i8*, ...) @printf(i8* getelementptr inbounds ([3 x i8], [3 x i8]* @format, i64 0, i64 0), double %11);
      ret i64 0
      }
    `,
  },
}

describe("The code generator", () => {
  for (const target of ["js", "c", "llvm"]) {
    it(`produces expected ${target} output for the small program`, done => {
      const intermediate = optimize(analyze(parse(tokenize(fixture.source))))
      const actual = generate(target)(intermediate)
      assert.deepEqual(actual, fixture.expected[target])
      done()
    })
  }
})

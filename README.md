![Logo](https://raw.githubusercontent.com/rtoal/astro/main/docs/astrologo.png)

# Astro

A simple programming language, used for a compiler course. Here is a sample program:

```
// A simple program in Astro
radius = 55.2 * (-random() + 89) % 21;
the_area = π * radius ** 2;
print(the_area, cos(2.28) / 5);
```

## Language Specification

### Grammar

In this grammar notation, capitalized variables implicitly can have spaces between components in the definition. The character set is Unicode, with the predefined variable `letter` being any Unicode letter and `digit` standing for the characters U+0030 to U+0039, inclusive.

```
Program    → Statement+
Statement  → id "=" Exp ";"
           | Call ";"
Exp        → (Exp ("+" | "-"))? Term
Term       → (Term ("*" | "/" | "%"))? Factor
Factor     → Primary ("**" Factor)?
Primary    → num
           | id
           | Call
           | "-" Primary
           | "(" Exp ")"
Call       → id "(" (Exp ("," Exp)*)? ")"
num        → digit+ ("." digit+)?
id         → letter (letter | digit | "_")*
space      → " " | "\t" | "\r" | "//" (~"\n" any)* ("\n" | end)
```

### Static Semantics

An identifier cannot be used in an expression unless it is one of the built-in identifiers or has been previously assigned to.

The following identifiers are built-in:

- `π`, a number
- `sqrt`, a function of exactly one argument
- `sin`, a function of exactly one argument
- `cos`, a function of exactly one argument
- `random`, a function of exactly zero arguments
- `print`, a function of any number of arguments

All function calls must accept the proper number of arguments.

The built-in identifiers cannot be assigned to.

The function `print` can only be called in a call statement; the others can only be called in a call `expression`.

### Dynamic Semantics

Like JavaScript.

## Building

Nodejs is required to build and run this project. Make sure you have a recent version of Node, since the source code uses a fair amount of very modern JavaScript.

Clone the repo, then run `npm install`.

You can then run `npm test`.

## Usage

You can run this on the command line or use this as a module in a larger program.

Command line syntax:

```
node astro.js <filename> <outputType>
```

The `outputType` indicates what you wish to print to standard output:

<table>
<tr><th>Option</th><th>Description</th></tr>
<tr><td>tokens</td><td>The tokens</td></tr>
<tr><td>ast</td><td>The AST</td></tr>
<tr><td>analyzed</td><td>The decorated AST</td></tr>
<tr><td>optimized</td><td>The optimized decorated AST</td></tr>
<tr><td>llvm</td><td>The translation of the program to LLVM IR</td></tr>
<tr><td>c</td><td>The translation of the program to C</td></tr>
<tr><td>js</td><td>The translation of the program to JavaScript</td></tr>
</table>

To embed in another program:

```
import { compile } from astro

compile(programAsString, outputType)
```

where the `outputType` argument is as in the previous section.

## Contributing

I’m happy to take PRs. As usual, be nice when filing issues and contributing. Do remember the idea is to keep the language tiny; if you’d like to extend the language, you’re probably better forking into a new project. However, I would love to see any improvements you might have for the implementation or the pedagogy.

Make sure to run `npm test` before submitting the PR.

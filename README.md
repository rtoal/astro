# Astro

A simple programming language, used for a compiler course. Here is a sample program:

```
radius = 12.2 * random() + 2E1;
the_area = π * radius ** 2;
print(the_area, cos(2.2E-11) / 5);
```

## Language Specification

### Grammar

We’re using a notation in which rules are to be interpreted as in PEGs and capitalized variables implicitly can have spaces between components in the definition. The character set is Unicode, with letter being any Unicode letter and digit standing for the characters U+0030 to U+0039, inclusive.

```
-- Grammar for the programming language Astro

Program    → Statement+
Statement  → id "=" Exp ";"
           | Call ";"
Exp        → "-"? Term (("+" | "-") Tern)*
Term       → Factor (("*" | "/" | "%") Factor)*
Factor     → Primary ("**" Primary)*
Primary    → numeral
           | Call
           | id
           | "(" Exp ")"
Call       → id "(" (Exp ("," Exp)*)? ")"
numeral    → digit+ ("." digit+)? (("E" | "e") ("+" | "-")? digit+)?
id         → letter (letter | digit | "_")*
```

### Static Semantics

All operators are left-associative except \*\* which is right-associative. Assignments bring variables into existence. A variable may not be used unless it has been previously assigned to. In a global context, the following identifiers are assumed to have been declared: `π`, `sqrt`, `sin`, `cos`, `random`, and `print`. The first is just a number and the rest are like their JavaScript counterparts.

### Dynamic Semantics

Like JavaScript, really.

## Usage

You can run this on the command line or use this as a module in a larger program.

Command line syntax:

```
node astro.js <filename> <outputType>
```

The `outputType` indicates what you wish to print to standard output:

<table>
<tr><th>Option</th><th>Description</th></tr>
<tr><td>tokenized</td><td>The tokens</td></tr>
<tr><td>parsed</td><td>The AST</td></tr>
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

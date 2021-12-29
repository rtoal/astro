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
node astro.js --option filename.astro
```

The option is one of:

<table>
<tr><th>Option</th><th>Description</th></tr>
<tr><td>--tokens</td><td>Show the tokens then halt.</td></tr>
<tr><td>--ast</td><td>Show the AST then halt.</td></tr>
<tr><td>--semantic</td><td>Show the decorated AST then halt.</td></tr>
<tr><td>--llvm</td><td>Show the translation of the program to LLVM IR then halt.</td></tr>
<tr><td>--c</td><td>Show the translation of the program to C then halt.</td></tr>
<tr><td>--js</td><td>Show the translation of the program to JavaScript then halt.</td></tr>
</table>

Output goes to stdout.

To embed in another program:

```
import { compile } from astro

compile(programAsString, option)
```

where the option argument is as in the previous section, without the `--`.

## Contributing

Pull requests are welcome.

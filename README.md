# Mini Compiler Frontend

Compiler frontend project using C++ for the compiler logic and HTML, CSS, and JavaScript for the future web interface.

## Preview

<img width="1497" height="911" alt="compiler1" src="https://github.com/user-attachments/assets/1c12299f-3163-4af2-91c6-7a8aa41dc41a" />

## Project Structure

```text
backend/
  include/
    token.h      Token types and token structure
    lexer.h      Lexer interface and lexical errors
    ast.h        Abstract syntax tree structures
    parser.h     Parser interface and syntax errors
    symbol_table.h
    semantic_analyzer.h
    ir_generator.h
  src/
    main.cpp     Backend entry point
    token.cpp    Token type implementation
    lexer.cpp    Lexical analyzer implementation
    ast.cpp      Abstract syntax tree implementation
    parser.cpp   Recursive-descent parser implementation
    symbol_table.cpp
    semantic_analyzer.cpp
    ir_generator.cpp
  tests/
    token_test.cpp
    lexer_test.cpp
    ast_test.cpp
    parser_test.cpp
    backend_pipeline_test.cpp
frontend/
  index.html     Frontend entry point
  css/           Stylesheets
  js/            JavaScript files
```


The compiler backend now includes the token system, lexer, AST, parser, symbol table, semantic analyzer, and simple three-address-style intermediate representation. The HTTP server and frontend integration remain separate future phases.

```text
Token
Lexer
AST
Parser
Symbol Table
Semantic Analyzer
IR Generator
Tests
```

## C++ Environment

The current development environment uses MinGW GCC and CMake.

## Build and Run with MinGW

From the project root in PowerShell:

```powershell
New-Item -ItemType Directory -Force build | Out-Null
g++ -std=c++17 -Wall -Wextra -pedantic backend/src/main.cpp -o build/mini_compiler.exe
./build/mini_compiler.exe
```

Expected output depends on the current backend entry point.


## CMake Build

With CMake and MinGW installed:

```powershell
cmake -S . -B build -G "MinGW Makefiles"
cmake --build build
./build/mini_compiler.exe
```

The `build/` directory is local generated output and is ignored by Git.

## Run Tests

```powershell
ctest --test-dir build --output-on-failure
```



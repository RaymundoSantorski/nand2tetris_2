const {readFile, readFileSync} = require('fs');

const keywords = [
    'class',
    'constructor',
    'function',
    'method',
    'field',
    'static',
    'var',
    'int',
    'char',
    'boolean',
    'void',
    'true',
    'false',
    'null',
    'this',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return'
];

const symbols = [
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    '.',
    ',',
    ';',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '=',
    '~'
];

const numberStrings = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
];  

class JackTokenizer{
    static inputFile;
    static index;
    static len;

    constructor(inputFile = []){
        this.inputFile = inputFile.filter(value => value !== '' || value !== '\n');
        this.index = 0;
        this.len = this.inputFile.length;
    }

    hasMoreTokens(){
        return this.index < this.len;
    }

    advance(){
        this.index++;
    }

    tokenType(){}

    keyWord(){}

    symbol(){}

    identifier(){}

    intVal(){}

    stringVal(){}
}

class CompilationEngine{
    compileExpression(){}

    compileTerm(){}

    compileExpressionList(){}

    compileStatements(){}

    compileIfStatement(){}

    compileWhileStatement(){}
}

function main(){
    const filename = process.argv[2];
    const buffer = readFileSync(filename, {});
    const inputfile = buffer.toString().trim().split('\n');
    const jackTokenizer = new JackTokenizer(inputfile);
    while(jackTokenizer.hasMoreTokens()){
        jackTokenizer.advance();
    }
}

main();
const {readFileSync} = require('fs');

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

const tokenTypes = [
    'KEYWORD',
    'SYMBOL',
    'INT_CONST',
    'STRING_CONST',
    'IDENTIFIER',
];

const unicodeRegex = /^"(?:(?![\n"])[\p{L}\p{P}\p{Nd} ])*"$/u;
const identifierRegex = /(?!.*[" ])(^[A-Za-z_][A-Za-z0-9_]*)/u;
const numberRegex = /[0-9]+/u;

const  classNames = [];

class JackTokenizer{
    static inputFile;
    static index;
    static jindex;
    static len;
    static jlen;
    static currentLine;

    constructor(inputFile = []){
        this.inputFile = inputFile.filter(value => value !== '' || value !== '\n');
        this.index = 0;
        this.jindex = 0;
        this.len = this.inputFile.length;
    }

    get hasMoreTokens(){
        if(this.index == this.len) return false;
        if(this.inputFile[this.index].includes('"')) this.currentLine = this.inputFile[this.index].trim().split(/ (?=(?:[^"]*"[^"]*")*$)/g);
        else this.currentLine = this.inputFile[this.index].trim().split(' ');
        this.jlen = this.currentLine.length;
        if(this.index == this.len && this.jindex == this.jlen) return false;
        return true;
    }

    advance(){
        if(this.jindex < this.jlen-1){
            this.jindex++;
        }
        else{
            this.index++;
            this.jindex = 0;
        }
    }

    get tokenType(){
        const currentToken = this.currentLine[this.jindex];
        if(keywords.includes(currentToken)) return tokenTypes[0];
        if(symbols.includes(currentToken)) return tokenTypes[1];
        if(numberRegex.test(currentToken)) return tokenTypes[2];
        if(unicodeRegex.test(currentToken)) return tokenTypes[3];
        if(identifierRegex.test(currentToken)) return tokenTypes[4];
    }

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
    while(jackTokenizer.hasMoreTokens){
        console.log(jackTokenizer.tokenType);
        jackTokenizer.advance();
    }
}

main();
// console.log(identifierRegex.test(' variable'));
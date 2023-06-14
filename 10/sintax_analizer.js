const {readFileSync} = require('fs');

const keywords = [
    'class',
    'method',
    'function',
    'constructor',
    'int',
    'boolean',
    'char',
    'void',
    'var',
    'static',
    'field',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return',
    'true',
    'false',
    'null',
    'this',
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

    get _token(){
        return this.currentLine[this.jindex];
    }

    get tokenType(){
        if(keywords.includes(this._token)) return tokenTypes[0];
        if(symbols.includes(this._token)) return tokenTypes[1];
        if(numberRegex.test(this._token)) return tokenTypes[2];
        if(unicodeRegex.test(this._token)) return tokenTypes[3];
        if(identifierRegex.test(this._token)) return tokenTypes[4];
    }

    get keyWord(){
        return this._token.toUpperCase();
    }

    get symbol(){
        return this._token;
    }

    get identifier(){
        return this._token;
    }

    get intVal(){
        return this._token;
    }

    get stringVal(){
        return this._token.replaceAll('"', '');
    }
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
    const tokenizer = new JackTokenizer(inputfile);
    while(tokenizer.hasMoreTokens){
        const tokenType = tokenizer.tokenType;
        switch(tokenType){
            case 'KEYWORD':
                console.log(tokenizer.keyWord);
                break;
            case 'SYMBOL':
                console.log(tokenizer.symbol);
                break;
            case 'IDENTIFIER':
                console.log(tokenizer.identifier);
                break;
            case 'INT_CONST':
                console.log(tokenizer.intVal);
                break;
            case 'STRING_CONST':
                console.log(tokenizer.stringVal);
                break;
        }
        tokenizer.advance();
    }
}

main();
// console.log(identifierRegex.test(' variable'));
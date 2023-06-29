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
const commentRegex = /^\/\*\*.*\*\/|\/\/.*$/ug;

const  classNames = [];

class JackTokenizer{
    static inputFile;
    static index;
    static jindex;
    static len;
    static jlen;
    static currentLine;

    constructor(inputFile = []){
        let aux = inputFile.map(line => {
            return line.replaceAll(commentRegex, '');
        });
        this.inputFile = aux.filter(value => (value !== '' || value !== '\n'));
        this.index = 0;
        this.jindex = 0;
        this.len = this.inputFile.length;
    }

    _insertSpaces(str = ''){
        const symbolsRegex = /[ ]*([\(\)\[\]\{\}\.\;,])[ ]*/g;
        str = str.replaceAll(symbolsRegex, " $1 ").replaceAll(/ +/g, ' ');
        return str;
    }

    get hasMoreTokens(){
        if(this.index == this.len) return false;
        const currLine = this._insertSpaces(this.inputFile[this.index]);
        if(currLine.includes('"')) this.currentLine = currLine.trim().split(/\s(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/g);
        else this.currentLine = currLine.trim().split(' ');
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

    get _lastToken(){
        if(this.jindex>0){
            return this.currentLine[this.jindex - 1];
        }
        return null;
    }

    get tokenType(){
        if(keywords.includes(this._token)) return tokenTypes[0];
        if(symbols.includes(this._token)) return tokenTypes[1];
        if(numberRegex.test(this._token)) return tokenTypes[2];
        if(unicodeRegex.test(this._token)) return tokenTypes[3];
        if(identifierRegex.test(this._token)) return tokenTypes[4];
    }

    get keyWord(){
        return this._token;
    }

    get symbol(){
        const symbolTranslate = {
            '<': "&lt;",
            '>': "&gt;",
            '"': "&quot;",
            '&': "&amp;",
        }
        if(symbolTranslate[this._token]) return symbolTranslate[this._token];
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

module.exports = JackTokenizer;
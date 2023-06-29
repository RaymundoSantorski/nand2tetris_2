const {readFileSync, openSync, existsSync} = require('fs');
const JackTokenizer = require('./jackTokenizer');
const CompilationEngine = require('./compilationEngine');

const loop = (tokenizer, engine) => {
    while(tokenizer.hasMoreTokens){
        const tokenType = tokenizer.tokenType;
        let tag;
        let token;
        switch(tokenType){
            case 'KEYWORD':
                tag = 'keyword';
                token = tokenizer.keyWord;
                break;
            case 'SYMBOL':
                tag = 'symbol';
                token = tokenizer.symbol;
                break;
            case 'IDENTIFIER':
                tag = 'identifier';
                token = tokenizer.identifier;
                break;
            case 'INT_CONST':
                tag = 'integerConstant';
                token = tokenizer.intVal;
                break;
            case 'STRING_CONST':
                tag = 'stringConstant';
                token = tokenizer.stringVal;
                break;
            default:
                // throw new Error('Instrucción o tipo de dato no reconocido', tokenType);
        }
        let data = `<${tag}> ${token} </${tag}>\n`;
        console.log(tokenizer._lastToken);
        token && engine._write(data); // if token has value, write the tag 
        tokenizer.advance();
    }
}

function main(){
    const dir = process.argv[2];
    let currentDir = dir;
    let filename;
    let inputfile;
    let outputfile;
    if(dir.includes('.jack')){
        let aux = dir.split('/');
        currentDir = aux.slice(0, -1).join('/');
        filename = aux.slice(-1).join('').split('.')[0];
        inputfile = readFileSync(dir, 'utf-8').split(/\r?\n/);
        let [file] = dir.split('.');
        outputfile = openSync(`${file}TT.xml`, 'w');
    }else{
        inputfile = readFileSync(`${dir}/index.jack`, 'utf-8').split(/\r?\n/);
        filename = 'index';
        let file;
        if(dir.endsWith('/')){
            file = dir.split('/').slice(-2)[0];
        }else{
            file = dir.split('/').slice(-1)[0];
        }
        outputfile = openSync(`${dir}/${file}TT.xml`, 'w');
    }
    const tokenizer = new JackTokenizer(inputfile);
    const engine = new CompilationEngine(outputfile);
    loop(tokenizer, engine);
    engine.close();
    console.log('Hecho!');
}

main(); 
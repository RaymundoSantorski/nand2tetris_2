const {readFileSync, openSync, existsSync} = require('fs');
const JackTokenizer = require('./jackTokenizer');
const CompilationEngine = require('./compilationEngine');

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
    while(tokenizer.hasMoreTokens){
        const tokenType = tokenizer.tokenType;
        let tag;
        let token;
        switch(tokenType){
            case 'KEYWORD':
                token = tokenizer.keyWord;
                console.log(`<${tokenType}> ${token} </${tokenType}>\n`);
                break;
            case 'SYMBOL':
                token = tokenizer.symbol;
                console.log(`<${tokenType}> ${token} </${tokenType}>\n`);
                break;
            case 'IDENTIFIER':
                token = tokenizer.identifier;
                console.log(`<${tokenType}> ${token} </${tokenType}>\n`);
                break;
            case 'INT_CONST':
                token = tokenizer.intVal;
                console.log(`<${tokenType}> ${token} </${tokenType}>\n`);
                break;
            case 'STRING_CONST':
                token = tokenizer.stringVal;
                console.log(`<${tokenType}> ${token} </${tokenType}>\n`);
                break;
            default:
                // throw new Error('Instrucción o tipo de dato no reconocido', tokenType);
        }
        tag = `<${tokenType}> ${token} </${tokenType}>\n`;
        token && engine._write(tag); // if token has value, write the tag 
        tokenizer.advance();
    }
    engine.close();
    console.log('Hecho!');
}

main(); 
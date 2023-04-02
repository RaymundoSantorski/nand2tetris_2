const fs = require('fs');
const { parse } = require('path');

let ariLogCommands = [
    'add',
    'sub',
    'neg',
    'eq',
    'gt',
    'lt',
    'and',
    'or',
    'not'
];

let commands = {
    'pop': 'C_POP',
    'push': 'C_PUSH',
    'label': 'C_LABEL',
    'goto': 'C_GOTO',
    'if-goto': 'C_IF',
    'function': 'C_FUNCTION',
    'call': 'C_CALL',
    'return': 'c_RETURN'
}

let locations = {
    local: 'LCL',
    argument: 'ARG',
    this: 'THIS',
    that: 'THAT',
}

class Parser{
    static inputFile;
    static index;
    static command;

    constructor(inputFile){
        this.inputFile = inputFile;
        this.index = 0;
        this.command = null;
    }

    hasMoreCommands(){
        return this.inputFile.length > this.index;
    }

    advance(){
        while(true){
            if(!this.hasMoreCommands()) break;
            let aux = this.inputFile[this.index];
            if(aux?.startsWith('/') | aux?.length === 0){
                this.command = '';
                this.index ++;
            }else{
                this.command = aux;
                break;
            }
        }
        this.index ++;
    }

    commandType(){
        let [com] = this.command.split(' ');
        if(commands[com]){
            return commands[com];
        }else if(ariLogCommands.includes(com)){
            return 'C_ARITHMETIC'
        }
    }

    fields(){
        let [com, seg, ind] = this.command.split(' ');
        return [com, seg, ind];
    }
}

class CodeWriter{
    static outputFile;
    static fileName;
    static stat;
    static temp;
    static eqCounter;
    static gtCounter;
    static ltCounter;

    constructor(outputFile, fileName){
        this.outputFile = outputFile;
        this.temp = 5;
        this.eqCounter = 0;
        this.gtCounter = 0;
        this.ltCounter = 0;
        if(fileName.includes('/')){
            let aux = fileName.split('/');
            let len = aux.length;
            this.fileName = aux[len - 1];
        }else{
            this.fileName = fileName;
        }
    }

    writeArithmetic(command){
        fs.writeFileSync(this.outputFile, `// ${command}\n`);
        let instruction = '';
        switch(command){
            case 'add':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=D+M\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case 'sub':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=M-D\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case 'neg':
                instruction += '@SP\nM=M-1\nA=M\nD=!M\n';
                instruction += '@1\nD=D+A\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case 'eq':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=M-D\n';
                instruction += `@EQ.${this.eqCounter}\nD;JEQ\n`;
                instruction += '@SP\nA=M\nM=0\n';
                instruction += '@SP\nM=M+1\n'
                instruction += `@CONTINUEEQ.${this.eqCounter}\n0;JMP\n`;
                instruction += `(EQ.${this.eqCounter})\n`;
                instruction += '@SP\nA=M\nM=-1\n';
                instruction += '@SP\nM=M+1\n';
                instruction += `(CONTINUEEQ.${this.eqCounter})\n`;
                this.eqCounter++;
                break;
            case 'gt':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=D-M\n';
                instruction += `@GT.${this.gtCounter}\nD;JLT\n`;
                instruction += '@SP\nA=M\nM=0\n';
                instruction += '@SP\nM=M+1\n'
                instruction += `@CONTINUEGT.${this.gtCounter}\n0;JMP\n`;
                instruction += `(GT.${this.gtCounter})\n`;
                instruction += '@SP\nA=M\nM=-1\n';
                instruction += '@SP\nM=M+1\n';
                instruction += `(CONTINUEGT.${this.gtCounter})\n`;
                this.gtCounter++;
                break;
            case 'lt':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=D-M\n';
                instruction += `@LT.${this.ltCounter}\nD;JGT\n`;
                instruction += '@SP\nA=M\nM=0\n';
                instruction += '@SP\nM=M+1\n'
                instruction += `@CONTINUELT.${this.ltCounter}\n0;JMP\n`;
                instruction += `(LT.${this.ltCounter})\n`;
                instruction += '@SP\nA=M\nM=-1\n';
                instruction += '@SP\nM=M+1\n';
                instruction += `(CONTINUELT.${this.ltCounter})\n`;
                this.ltCounter++;
                break;
            case 'and':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=D&M\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case 'or':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@SP\nM=M-1\nA=M\nD=D|M\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case 'not':
                instruction += '@SP\nM=M-1\nA=M\nD=!M\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            default:
                console.log('Se encontró una operación no reconocida', command);
                break;
        }
        fs.writeFileSync(this.outputFile, instruction);
    }

    writePushPop(command, segment, index){
        fs.writeFileSync(this.outputFile, `// ${command} ${segment} ${index}\n`);
        let instruction = '';
        switch(true){
            case (segment === 'local'  
                | segment === 'argument' 
                | segment === 'this' 
                | segment === 'that')
                && command === 'pop':
                instruction += `@${locations[segment]}\nD=M\n`;
                instruction += `@${index}\nD=D+A\n`;
                instruction += '@SP\nM=M-1\nA=M\nD=D+M\n';
                instruction += 'A=D-M\nM=D-A\n';
                break;
            case (segment === 'local'  
                | segment === 'argument' 
                | segment === 'this' 
                | segment === 'that')
                && command === 'push':
                instruction += `@${locations[segment]}\nD=M\n`;
                instruction += `@${index}\nA=D+A\nD=M\n`;
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case segment === 'static' && command === 'pop':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += `@${this.fileName}.${index}\nM=D\n`;
                break;
            case segment === 'static' && command === 'push':
                instruction += `@${this.fileName}.${index}\nD=M\n`;
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case segment === 'temp' && command === 'pop':
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += `@${this.temp + parseInt(index)}\nM=D\n`;
                break;
            case segment === 'temp' && command === 'push':
                instruction += `@${this.temp + parseInt(index)}\nD=M\n`;
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case segment === 'pointer' && command === 'pop' && parseInt(index) === 0:
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@THIS\nM=D\n';
                break;
            case segment === 'pointer' && command === 'pop' && parseInt(index) === 1:
                instruction += '@SP\nM=M-1\nA=M\nD=M\n';
                instruction += '@THAT\nM=D\n';
                break;
            case segment === 'pointer' && command === 'push' && parseInt(index) === 0:
                instruction += '@THIS\nD=M\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case segment === 'pointer' && command === 'push' && parseInt(index) === 1:
                instruction += '@THAT\nD=M\n';
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            case segment === 'constant' && command === 'push':
                instruction += `@${index}\nD=A\n`;
                instruction += '@SP\nA=M\nM=D\n';
                instruction += '@SP\nM=M+1\n';
                break;
            default:
                console.log('Se encontró una referencia a un segmento no reconocido');
        }
        fs.writeFileSync(this.outputFile, instruction);
    }

    close(){
        let instruction = '(END)\n@END\n0;JMP\n';
        fs.writeFileSync(this.outputFile, instruction);
        fs.closeSync(this.outputFile);
    }
}

const main = () => {
    const fileName = process.argv[2];
    const inputFile = fs.readFileSync(`${fileName}.vm`, 'utf-8').split(/\r?\n/);
    const outputFile = fs.openSync(`${fileName}.asm`, 'w');
    let parser = new Parser(inputFile);
    let codeWriter = new CodeWriter(outputFile, fileName);
    let hasMoreCommands = true;
    while(hasMoreCommands){
        parser.advance();
        let [command, segment, index] = parser.fields();
        let type = parser.commandType();
        if(type === 'C_ARITHMETIC'){
            codeWriter.writeArithmetic(command);
        }else if(type === 'C_PUSH' | type === 'C_POP'){
            codeWriter.writePushPop(command, segment, index);
        }
        hasMoreCommands = parser.hasMoreCommands();
    }
    console.log('Proceso terminado');
    codeWriter.close();
}

main();
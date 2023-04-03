const fs = require('fs');

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
    'return': 'C_RETURN'
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
    static calls;
    static eqCounter;
    static gtCounter;
    static ltCounter;
    static pendingFiles;

    constructor(outputFile, fileName){
        this.outputFile = outputFile;
        this.temp = 5;
        this.calls = 0;
        this.eqCounter = 0;
        this.gtCounter = 0;
        this.ltCounter = 0;
        this.pendingFiles = {};
        if(fileName.includes('/')){
            let aux = fileName.split('/');
            let len = aux.length;
            this.fileName = aux[len - 1];
        }else{
            this.fileName = fileName;
        }
    }

    hasPendingFiles(){
        let has = Object.entries(this.pendingFiles).length > 0;
        return [has, this.pendingFiles];
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

    setFileName(fileName /** string */){
        // Informs the codeWriter that the translation of a new VM file
        // has started (called by the main program of the VM translator).
        this.fileName = fileName;
    }

    writeInit(){
        // Writes the assembly instructions that effect the bootstrap code
        // that initializes the VM. This code must be placed at the 
        // beggining of the generated *.asm file
        fs.writeFileSync(this.outputFile, '// Bootstrap code\n');
        let instruction = '@261\nD=A\n@SP\nM=D\n@LCL\nM=D\n@256\nD=A\n@ARG\nM=D\n';
        instruction += '@Sys.init\n0;JMP\n'
        fs.writeFileSync(this.outputFile, instruction);
    }

    writeLabel(label /** string */){
        // Writes assembly code that effects the label command
        let instruction = `(${label})\n`;
        fs.writeFileSync(this.outputFile, instruction);
    }

    writeGoto(label /** string */){
        // Writes the assembly code that effects the goto command
        fs.writeFileSync(this.outputFile, `// goto ${label}\n`);
        let instruction = `@${label}\n0;JMP\n`;
        fs.writeFileSync(this.outputFile, instruction);
    }

    writeIf(label /** string */){
        // Writes assembly code that effects the if-goto command
        fs.writeFileSync(this.outputFile, `// if-goto ${label}\n`);
        let instruction = '@SP\nM=M-1\nA=M\nD=M\n';
        instruction += `@${label}\nD;JNE\n`;
        fs.writeFileSync(this.outputFile, instruction);
    }

    writeFunction(functionName, /** string */ numVars /** int */){
        // Writes assembly code that effects the function command
        let instruction = `(${functionName})\n`;
        let pushLocal = '@SP\nA=M\nM=0\n@SP\nM=M+1\n'.repeat(numVars);
        instruction += pushLocal;
        fs.writeFileSync(this.outputFile, instruction);
    }

    writeCall(functionName, /** string */ numArgs /** int */){
        // Writes assembly code that effects the call command
        fs.writeFileSync(this.outputFile, `// call ${functionName} ${numArgs}\n`);
        let label = `${this.fileName}$ret.${this.calls}`;
        let instruction = `@${label}\nD=A\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
        instruction += '@LCL\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n';
        instruction += '@ARG\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n';
        instruction += '@THIS\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n';
        instruction += '@THAT\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n';
        instruction += `@SP\nD=M\n@${5+Number.parseInt(numArgs)}\nD=D-A\n`;
        instruction += '@ARG\nM=D\n@SP\nD=M\n@LCL\nM=D\n';
        instruction += `@${functionName}\n0;JMP\n`;
        instruction += `(${label})\n`;
        let reg = /\((\w+)\)/g;
        let [file, func] = functionName.replace(reg, '').split('.');
        if(file !== this.fileName){
            if(this.pendingFiles[file]){
                this.pendingFiles[file] = {
                    ...this.pendingFiles[file],
                    [func]: false,
                };
            }else{
                this.pendingFiles[file] = {
                    [func]: false,
                };
            }
        }
        this.calls++;
        fs.writeFileSync(this.outputFile, instruction);
    }

    writeReturn(){
        // Writes assembly code that effects the return command
        fs.writeFileSync(this.outputFile, '// return\n');
        let instruction = '@LCL\nD=M\n@11\nM=D\n';
        instruction += '@11\nD=M\n@5\nD=D-A\nA=D\nD=M\n@12\nM=D\n';
        instruction += '@SP\nM=M-1\nA=M\nD=M\n@ARG\nA=M\nM=D\n';
        instruction += '@ARG\nD=M+1\n@SP\nM=D\n';
        instruction += '@11\nA=M-1\nD=M\n@THAT\nM=D\n';
        instruction += '@2\nD=A\n@11\nA=M-D\nD=M\n@THIS\nM=D\n';
        instruction += '@3\nD=A\n@11\nA=M-D\nD=M\n@ARG\nM=D\n';
        instruction += '@4\nD=A\n@11\nA=M-D\nD=M\n@LCL\nM=D\n';
        instruction += '@12\nA=M\n0;JMP\n';
        fs.writeFileSync(this.outputFile, instruction);
    }

    close(){
        let instruction = '(END)\n@END\n0;JMP\n';
        fs.writeFileSync(this.outputFile, instruction);
        fs.closeSync(this.outputFile);
    }
}

const loop = (parser, codeWriter) => {
    let hasMoreCommands = true;
    while(hasMoreCommands){
        parser.advance();
        let [command, segment, index] = parser.fields();
        let type = parser.commandType();
        switch(type){
            case 'C_ARITHMETIC':
                codeWriter.writeArithmetic(command);
                break;
            case 'C_PUSH':
                codeWriter.writePushPop(command, segment, index);
                break;
            case 'C_POP':
                codeWriter.writePushPop(command, segment, index);
                break;
            case 'C_LABEL':
                codeWriter.writeLabel(segment); 
                break;
            case 'C_GOTO':
                codeWriter.writeGoto(segment);
                break;
            case 'C_IF':
                codeWriter.writeIf(segment);
                break;
            case 'C_FUNCTION':
                codeWriter.writeFunction(segment, index);
                break;
            case 'C_CALL':
                codeWriter.writeCall(segment, index);
                break;
            case 'C_RETURN':
                codeWriter.writeReturn();
                break;
        }
        hasMoreCommands = parser.hasMoreCommands();
    }
}

const main = () => {
    const dir = process.argv[2];
    let currentDir = dir;
    let fileName;
    let inputFile;
    let outputFile;
    if(dir.includes('.vm')){
        let aux = dir.split('/');
        currentDir = aux.slice(0, -1).join('/');
        fileName = aux.slice(-1).join('').split('.')[0];
        inputFile = fs.readFileSync(dir, 'utf-8').split(/\r?\n/);
        let [file] = dir.split('.');
        outputFile = fs.openSync(`${file}.asm`, 'w');
    }else{
        inputFile = fs.readFileSync(`${dir}/Sys.vm`, 'utf-8').split(/\r?\n/);
        fileName = 'Sys';
        let file;
        if(dir.endsWith('/')){
            file = dir.split('/').slice(-2)[0];
        }else{
            file = dir.split('/').slice(-1)[0];
        }
        outputFile = fs.openSync(`${dir}/${file}.asm`, 'w');
    }
    let parser = new Parser(inputFile);
    let codeWriter = new CodeWriter(outputFile, fileName);
    fileName === 'Sys' && codeWriter.writeInit();
    loop(parser, codeWriter);
    let [hasPendingFiles, pendingFiles] = codeWriter.hasPendingFiles();
    if(hasPendingFiles){
        Object.keys(pendingFiles).forEach(key => {
            console.log(key, pendingFiles[key]);
            let tempFile = `${currentDir}/${key}.vm`;
            let tempInputFile = fs.readFileSync(tempFile, 'utf-8').split(/\r?\n/);
            parser = new Parser(tempInputFile);
            codeWriter.setFileName(key);
            loop(parser, codeWriter);
        });
    }
    console.log('Proceso terminado');
    codeWriter.close();
}

main();

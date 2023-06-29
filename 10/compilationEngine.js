const {writeFileSync} = require('fs');
class CompilationEngine{
    static outputfile;
    static level = 0;
    constructor(outputfile){
        this.outputfile = outputfile;
        this._write('<class>\n', 'a+');
    }

    compileExpression(){}

    compileTerm(){}

    compileExpressionList(){}

    compileStatements(){}

    compileIfStatement(){}

    compileWhileStatement(){}

    _write(data, flag = 'w'){
        writeFileSync(this.outputfile, `${data}`, {
            encoding: 'utf-8',
            flag
        });
    }

    close(){
        this._write('</class>\n');
    }
}

module.exports = CompilationEngine;
const {writeFileSync} = require('fs');
class CompilationEngine{
    static outputfile;
    constructor(outputfile){
        this.outputfile = outputfile;
        this._write('<tokens>\n', 'a+');
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
        this._write('</tokens>');
    }
}

module.exports = CompilationEngine;
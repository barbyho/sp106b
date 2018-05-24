var fs = require('fs'); //引入模板
var temp = fs.readFileSync(process.argv.slice(2).toString(), {
    encoding: 'utf8'
}); // 讀取命令列引數以及讀檔
var lines = temp.split(/\r?\n/); //分割字串
var clearLines = []; //消除空白，新陣列030
var dtable = {
    "": 0b000,
    "M": 0b001,
    "D": 0b010,
    "MD": 0b011,
    "A": 0b100,
    "AM": 0b101,
    "AD": 0b110,
    "AMD": 0b111
}

var jtable = {
    "": 0b000,
    "JGT": 0b001,
    "JEQ": 0b010,
    "JGE": 0b011,
    "JLT": 0b100,
    "JNE": 0b101,
    "JLE": 0b110,
    "JMP": 0b111
}

var ctable = {
    "0": 0b0101010,
    "1": 0b0111111,
    "-1": 0b0111010,
    "D": 0b0001100,
    "A": 0b0110000,
    "M": 0b1110000,
    "!D": 0b0001101,
    "!A": 0b0110001,
    "!M": 0b1110001,
    "-D": 0b0001111,
    "-A": 0b0110011,
    "-M": 0b1110011,
    "D+1": 0b0011111,
    "A+1": 0b0110111,
    "M+1": 0b1110111,
    "D-1": 0b0001110,
    "A-1": 0b0110010,
    "M-1": 0b1110010,
    "D+A": 0b0000010,
    "D+M": 0b1000010,
    "D-A": 0b0010011,
    "D-M": 0b1010011,
    "A-D": 0b0000111,
    "M-D": 0b1000111,
    "D&A": 0b0000000,
    "D&M": 0b1000000,
    "D|A": 0b0010101,
    "D|M": 0b1010101
}

var symTable = {
    "R0": 0,
    "R1": 1,
    "R2": 2,
    "R3": 3,
    "R4": 4,
    "R5": 5,
    "R6": 6,
    "R7": 7,
    "R8": 8,
    "R9": 9,
    "R10": 10,
    "R11": 11,
    "R12": 12,
    "R13": 13,
    "R14": 14,
    "R15": 15,
    "SP": 0,
    "LCL": 1,
    "ARG": 2,
    "THIS": 3,
    "THAT": 4,
    "KBD": 24576,
    "SCREEN": 16384
};
function clearnote(F) {
    F = F.replace(/[\s]+/g, "");
    F = F.replace(/\/\/\S*/g, "");  //消註解
    return F; // 回傳值
}
var lineNum = 0;
//消除空白字元及註解後將非空字串，擺入新陣列
for (var i = 0,
len = lines.length; i < len; i++) { //讀取lines的長度，讀到陣列長度為止(結尾)
    if (clearnote(lines[i]) == "") continue; //轉型後比對
    clearLines[lineNum] = clearnote(lines[i]);
    lineNum++;
}
//PASS1:L指令解析
var num = 0;
for (var j = 0,
len1 = clearLines.length; j < len1; j++) { //for 迴圈宣告
    if (clearLines[j].match(/\(\S*\)/g)) { //判斷若為L指令
        symTable[clearLines[j].replace(/[\(\)]/g, "")] = num; //將括號刪除後連同num值加入表中  
        continue; //跳離迴圈，進入下一次
    }
    num++; //並且將num值往上加
}
//PASS2:查表編碼
var PC = 16; //變數序列
var machineCode; //單行機械碼
var End = new String(); //機械碼總和  之後輸出用
for (var k = 0,
len2 = clearLines.length; k < len2; k++) {
    if (clearLines[k].match(/\(\S+\)/g)) continue; // 忽略L指令 無用
    if (clearLines[k].match(/\@\S+/g)) { // 解析A指令  
        var tmp = clearLines[k].replace(/^\@/g, ""); //清除A指令的@並存進tmp
        if (tmp.match(/^\d+$/g)) { // 若為數字
            machineCode = (Array(16).join('0') + parseInt(tmp).toString(2)).slice( - 16); //輸出成機械碼
        } else {
            machineCode = symTable[tmp]; // 反之去查表
            if (typeof machineCode == 'undefined') {
                symTable[tmp] = PC; //表沒有則新增進表
                machineCode = (Array(16).join('0') + PC.toString(2)).slice( - 16); // 並且輸出機械碼
                PC++;
            } else {
                machineCode = (Array(16).join('0') + machineCode.toString(2)).slice( - 16); // 有直接輸出
            }
        }
        // C指令解析
    } else {
        if (!clearLines[k].match('=')) {
            clearLines[k] = '=' + clearLines[k];
        } // 統一規格必有=
        if (!clearLines[k].match(';')) {
            clearLines[k] = clearLines[k] + ';';
        } //統一規格必有;
        var C = clearLines[k].substring(clearLines[k].indexOf('=') + 1, clearLines[k].indexOf(';')); //Comp
        var D = clearLines[k].substring(0, clearLines[k].indexOf('=')); //Dest
        var J = clearLines[k].substring(clearLines[k].indexOf(';') + 1, clearLines[k].length); //Jump
        machineCode = '111' + (Array(7).join('0') + ctable[C].toString(2)).slice( - 7) + (Array(3).join('0') + dtable[D].toString(2)).slice( - 3) + (Array(3).join('0') + jtable[J].toString(2)).slice( - 3);
    }
    End += machineCode + '\n';
}
fs.writeFileSync(process.argv.slice(2).toString().replace(".asm", ".hack"), End, {
    encoding: 'utf8'
});
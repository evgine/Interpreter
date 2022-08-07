const fs = require("fs");
const readlineSync = require('readline-sync');
const { Console } = require("console");

const ADD = "ADD";
const SUB = "SUB";
const DIV = "DIV";
const MUL = "MUL";
const ENDL = "ENDL";
const NUM = "NUM";
const BOOL = "BOOL";
const STR = "STR";
const IF = "IF";
const FOR = "FOR";
const PRINT = "PRINT"

// Get the file name.
const fileName = readlineSync.question("Enteer file name : ", function () {
    readlineSync.close();
});

// Read file.
let allFileContents;
try {
    allFileContents = fs.readFileSync(`${fileName}`, 'utf-8');

} catch (error) {
    console.log('Not Such File');
}

// Syntax analize.
let variableNames = new Map();
let localVariableNames = new Map();
let isLocal = false;                    

let linesOfFile = allFileContents.split(/\r?\n/);

function isNum(string) {    
    if ((string[0] == 0 && string.length === 1) || (/^[0-9]+$/.test(string) && string[0] != 0)) { //
        return true;
    }
    return false;
}
function isNumOrVar(string, map) { 
    if (isNum(string) || (map.has(string) && map.get(string) === NUM)) {
        return true;
    }
    return false;
}
function isValidVarName(string, map) {
    if ((/^[a-zA-Z0-9]+$/.test(string)) && !(map.has(string))) {
        return true;
    }
    return false;
}

for (let lineIdx = 0; lineIdx < linesOfFile.length; ++lineIdx) {
    if (linesOfFile[lineIdx].trim("").length === 0) {
        continue;
    }
    let splitedLine = linesOfFile[lineIdx].split(" ");

    if (splitedLine[0] === IF) {
        if (splitedLine.length === 3) {
            if (splitedLine[1][0] === "(" && splitedLine[1][splitedLine[1].length - 1] === ")") {
                if (variableNames.has(splitedLine[1].match(/\(([^)]+)\)/)[1])) {
                    if (variableNames.get(splitedLine[1].match(/\(([^)]+)\)/)[1]) === BOOL) {
                        if (splitedLine[2] === "{") {
                            isLocal = true;

                            for (let i = lineIdx + 1; i < linesOfFile.length; ++i) {
                                let spLine = linesOfFile[i].split("")

                                if (spLine[0] === IF || spLine[0] === FOR || spLine[0] === "{") {
                                    console.log(`Syntax Error in line ${i + 1}`)
                                    return;
                                }
                                else if (spLine[0] === "}" && spLine.length === 1) {
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        console.log(`Invalid condition in line ${lineIdx + 1}`);
                        return;
                    }
                }
                else {
                    console.log(`None declared variable in line ${lineIdx + 1}`);
                    return;
                }
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            console.log(`Syntax Error in line ${lineIdx + 1}`);
            return;
        }
    }
    else if (splitedLine[0] === FOR) {
        if (splitedLine.length === 10) {
            if (splitedLine[1][0] === "(" && splitedLine[splitedLine.length - 2][splitedLine[splitedLine.length - 2].length - 1] === ")") {
                if (splitedLine[1].split('(')[1] === NUM
                    && splitedLine[3] === "="
                    && splitedLine[4][splitedLine[4].length - 1] === ";"
                    && ((/^[0-9]+$/.test(splitedLine[4].split(';')[0]) && splitedLine[4][0] !== 0) || (splitedLine[4][0] === 0 && splitedLine[4].length === 1))     //aystex uxxelu ban ka
                    && splitedLine[2] === splitedLine[5]
                    && /^[>=<]+$/.test(splitedLine[6])
                    && splitedLine[7][splitedLine[7].length - 1] === ";"
                    && /^[0-9]+$/.test(splitedLine[7].split(';')[0])
                    && (splitedLine[splitedLine.length - 2] === `++${splitedLine[2]})` || splitedLine[splitedLine.length - 2] === `--${splitedLine[2]})`)
                ) {

                    if (splitedLine[splitedLine.length - 1] === "{") {
                        isLocal = true;
                        localVariableNames.set(splitedLine[2], NUM)
                        for (let i = lineIdx + 1; i < linesOfFile.length; ++i) {
                            let spLine = linesOfFile[i].split(" ");

                            if (spLine[0] === IF || spLine[0] === FOR || spLine[0] === "{") {
                                console.log(`Syntax Error in line ${i + 1}`)
                                return;
                            }
                            else if (spLine[0] === "}" && spLine.length === 1) {
                                break;
                            }
                        }
                    }
                    else {
                        console.log(`Unexpected token '{' in line ${lineIdx + 1}`);
                        return;
                    }
                }
                else {
                    console.log(`Syntax Error in line ${lineIdx + 1}`);
                    return;
                }
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            console.log(`Syntax Error in line ${lineIdx + 1}`);
            return;
        }
    }

    else if (splitedLine[0] === NUM && splitedLine.length > 1
        && splitedLine[1][splitedLine[1].length - 1] === ";"
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
    ) {
        if (isLocal) {
            if (isValidVarName(splitedLine[1].split(';')[0], localVariableNames)) {
                localVariableNames.set(splitedLine[1].split(';')[0], NUM);
            }
        }
        else {
            if (isValidVarName(splitedLine[1].split(';')[0], variableNames)) {
                variableNames.set(splitedLine[1].split(';')[0], NUM);
            }
        }
    }

    else if (splitedLine[0] === NUM && splitedLine.length > 3
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
        && splitedLine[2] === "="
        && splitedLine[3][splitedLine[3].length - 1] === ";") {

        let filteredsplitedLine = splitedLine[3].split(';')[0].replace(/\./g, '');
        if (isLocal) {
            if (isValidVarName(splitedLine[1], localVariableNames) && isNumOrVar(filteredsplitedLine, localVariableNames)) {
                localVariableNames.set(splitedLine[1], NUM);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (isValidVarName(splitedLine[1], variableNames) && isNumOrVar(filteredsplitedLine, variableNames)) {
                variableNames.set(splitedLine[1], NUM);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
    }

    else if (splitedLine[0] === NUM && splitedLine.length > 5
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
        && splitedLine[2] === "="
        && ((splitedLine[4] === ADD) || (splitedLine[4] === SUB) || (splitedLine[4] === DIV) || (splitedLine[4] === MUL))
        && splitedLine[5][splitedLine[5].length - 1] === ";"
    ) {
        if (isLocal) {
            if (isValidVarName(splitedLine[1], localVariableNames)
                && isNumOrVar(splitedLine[3], localVariableNames)
                && isNumOrVar(splitedLine[5].split(';')[0], localVariableNames)) {
                localVariableNames.set(splitedLine[1], NUM);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (isValidVarName(splitedLine[1], variableNames)
                && isNumOrVar(splitedLine[3], variableNames)
                && isNumOrVar(splitedLine[5].split(';')[0], variableNames)) {
                variableNames.set(splitedLine[1], NUM);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
    }

    else if (splitedLine[0] === BOOL
        && splitedLine.length > 3
        && splitedLine[3][splitedLine[3].length - 1] === ";"
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
        && splitedLine[2] === "="
        && (splitedLine[3].split(';')[0] === "true" || splitedLine[3].split(';')[0] === "false")
    ) {
        if (isLocal) {
            if (isValidVarName(splitedLine[1], localVariableNames)) {
                localVariableNames.set(splitedLine[1], BOOL);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (isValidVarName(splitedLine[1], variableNames)) {
                variableNames.set(splitedLine[1], BOOL);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
    }

    else if (splitedLine[0] === STR
        && splitedLine.length > 1
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
        && splitedLine[1][splitedLine[1].length - 1] === ";"
    ) {
        if (isLocal) {
            if (isValidVarName(splitedLine[1].split(";")[0], localVariableNames)) {
                localVariableNames.set(splitedLine[1].split(";")[0], STR);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (isValidVarName(splitedLine[1].split(";")[0], variableNames)) {
                variableNames.set(splitedLine[1].split(";")[0], STR);
            }
            else {
                console.log(`Syntax Error in lineh ${lineIdx + 1}`);
                return;
            }
        }
    }

    else if (splitedLine[0] === STR
        && splitedLine.length > 3
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
        && splitedLine[2] === "="
        && splitedLine[3][splitedLine[3].length - 1] === ";"
        && splitedLine[3].split(';')[0][0] === "\""
        && splitedLine[3][splitedLine[3].length - 2] === "\""
    ) {
        if (isLocal) {
            if (isValidVarName(splitedLine[1], localVariableNames)) {
                localVariableNames.set(splitedLine[1], STR);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (isValidVarName(splitedLine[1], variableNames)) {
                variableNames.set(splitedLine[1], STR);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
    }

    else if (splitedLine[0] === STR
        && splitedLine.length > 5
        && !(/^[0-9]+$/.test(splitedLine[1][0]))
        && splitedLine[2] === "="
        && splitedLine[5][splitedLine[5].length - 1] === ";"
        && splitedLine[3][0] === "\""
        && splitedLine[3][splitedLine[3].length - 1] === "\""
        && splitedLine[4] === ADD
        && splitedLine[5].split(';')[0][0] === "\""
        && splitedLine[5][splitedLine[5].length - 2] === "\""
    ) {
        if (isLocal) {
            if (isValidVarName(splitedLine[1], localVariableNames)) {
                localVariableNames.set(splitedLine[1], STR);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (isValidVarName(splitedLine[1], variableNames)) {
                variableNames.set(splitedLine[1], STR);
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
    }

    else if (splitedLine[0] === PRINT && splitedLine.length === 2) {
        if (splitedLine[1][splitedLine[1].length - 1] === ";") {
            if (splitedLine[1][0] === "(" && splitedLine[1][splitedLine[1].length - 2] === ")") {
                
                if (!(splitedLine[1][1] === "\"" && splitedLine[1][splitedLine[1].length - 3] === "\"")) {
                    
                    if (isLocal) {
                        if (!(localVariableNames.has(splitedLine[1].split(";")[0].match(/\(([^)]+)\)/)[1]) || splitedLine === ENDL)) {
                            console.log(`None declared variable in line ${lineIdx + 1}`)
                        }
                    }
                    else {
                        if (!(variableNames.has(splitedLine[1].split(";")[0].match(/\(([^)]+)\)/)[1]) || splitedLine === ENDL)) {
                            console.log(`None declared variable in line ${lineIdx + 1}`)
                        }
                    }
                }
            }
        }
        else {
            console.log(`Syntax Error in line ${lineIdx + 1}`);
            return;
        }
    }

    else if (splitedLine[1] === "="
        && splitedLine[splitedLine.length - 1][splitedLine[splitedLine.length - 1].length - 1] === ";") {

        if (isLocal) {
            if (splitedLine.length === 3) {
                if (localVariableNames.get(splitedLine[0]) === NUM
                    && isNumOrVar(splitedLine[2].split(";")[0], localVariableNames)
                ) {
                    continue;
                }
                else if (localVariableNames.get(splitedLine[0]) === BOOL
                    && (splitedLine[2].split(";")[0] === "true" || splitedLine[2].split(";")[0] === "false")
                ) {
                    continue;
                }
                else if (localVariableNames.get(splitedLine[0]) === STR
                    && splitedLine[2].split(";")[0][0] === "\""
                    && splitedLine[2].split(";")[0][splitedLine[2].length - 2] === "\""
                ) {
                    continue;
                }
                else {
                    console.log(`Syntax Error in line ${lineIdx + 1}`);
                    return;
                }
            }

            else if (splitedLine.length === 5) {
                if (localVariableNames.get(splitedLine[0]) === NUM
                    && isNumOrVar(splitedLine[2], localVariableNames)
                    && isNumOrVar(splitedLine[4].split(";")[0], localVariableNames)
                    && ((splitedLine[3] === ADD) || (splitedLine[3] === SUB) || (splitedLine[3] === DIV) || (splitedLine[3] === MUL))
                ) {
                    continue;
                }
                else if (localVariableNames.get(splitedLine[0]) === STR
                    && splitedLine[2][0] === "\""
                    && splitedLine[2][splitedLine[2].length - 1] === "\""
                    && (splitedLine[3] === ADD)
                    && splitedLine[4].split(";")[0][0] === "\""
                    && splitedLine[4].split(";")[0][splitedLine[4].length - 2] === "\""
                ) {
                    continue;
                }
                else {
                    console.log(`Syntax Error in line ${lineIdx + 1}`);
                    return;
                }
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
        else {
            if (splitedLine.length === 3) {
                if (variableNames.get(splitedLine[0]) === NUM
                    && isNumOrVar(splitedLine[2].split(";")[0], variableNames)
                ) {
                    console.log("barev")
                    continue;
                }
                else if (variableNames.get(splitedLine[0]) === BOOL
                    && (splitedLine[2].split(";")[0] === "true" || splitedLine[2].split(";")[0] === "false")
                ) {
                    continue;
                }
                else if (variableNames.get(splitedLine[0]) === STR
                    && splitedLine[2].split(";")[0][0] === "\""
                    && splitedLine[2].split(";")[0][splitedLine[2].length - 2] === "\""
                ) {
                    continue;
                }
                else {
                    console.log(`Syntax Error in line ${lineIdx + 1}`);
                    return;
                }
            }
            else if (splitedLine.length === 5) {
                if (variableNames.get(splitedLine[0]) === NUM
                    && isNumOrVar(splitedLine[2], variableNames)
                    && isNumOrVar(splitedLine[4].split(";")[0], variableNames)
                    && ((splitedLine[3] === ADD) || (splitedLine[3] === SUB) || (splitedLine[3] === DIV) || (splitedLine[3] === MUL))
                ) {
                    continue;
                }
                else if (variableNames.get(splitedLine[0]) === STR
                    && splitedLine[2][0] === "\""
                    && splitedLine[2][splitedLine[2].length - 1] === "\""
                    && (splitedLine[3] === ADD)
                    && splitedLine[4].split(";")[0][0] === "\""
                    && splitedLine[4].split(";")[0][splitedLine[4].length - 2] === "\""
                ) {
                    continue;
                }
                else {
                    console.log(`Syntax Error in line ${lineIdx + 1}`);
                    return;
                }
            }
            else {
                console.log(`Syntax Error in line ${lineIdx + 1}`);
                return;
            }
        }
    }
    else if (isLocal && (splitedLine[0] === "}" && splitedLine.length === 1)) {
        isLocal = false;
        localVariableNames.clear();
    }
    else {
        console.log(`Syntax Error in line ${lineIdx + 1}`);
        return;
    }
}

let global = new Map();
let local = new Map();

function operation(line, map) {
    if (line[0] === NUM) {
        if (line.length === 2) {
            map.set(line[1].split(";")[0], [NUM, undefined]);
        }
        else if (line.length === 4) {
            if (!map.has(line[3].split(";")[0])) {
                map.set(line[1], [NUM, line[3].split(";")[0]])
            }
            else {
                map.set(line[1], [NUM, map.get(line[3].split(";")[0])[1]])
            }
        }
        else if (line.length === 6) {
            if (map.has(line[3])) {
                if (map.has(line[5].split(";")[0])) {
                    if (line[4] === ADD) {
                        map.set(line[1], [NUM, Number(map.get(line[3])[1]) + Number(map.get(line[5].split(";")[0])[1])])
                    }
                    if (line[4] === SUB) {
                        map.set(line[1], [NUM, Number(map.get(line[3])[1]) - Number(map.get(line[5].split(";")[0])[1])])
                    }
                    if (line[4] === MUL) {
                        map.set(line[1], [NUM, Number(map.get(line[3])[1]) * Number(map.get(line[5].split(";")[0])[1])])
                    }
                    if (line[4] === DIV) {
                        if (map.get(line[5].split(";")[0])[1] == 0) {
                            console.log("Illegal action ")
                        }
                        else {
                            map.set(line[1], [NUM, Number(map.get(line[3])[1]) / Number(map.get(line[5].split(";")[0])[1])])
                        }
                    }
                }
                else {
                    if (line[4] === ADD) {
                        map.set(line[1], [NUM, Number(map.get(line[3])[1]) + Number(line[5].split(";")[0])])
                    }
                    if (line[4] === SUB) {
                        map.set(line[1], [NUM, Number(map.get(line[3])[1]) - Number(line[5].split(";")[0])])
                    }
                    if (line[4] === MUL) {
                        map.set(line[1], [NUM, Number(map.get(line[3])[1]) * Number(line[5].split(";")[0])])
                    }
                    if (line[4] === DIV) {
                        if (line[5].split(";")[0] == 0) {
                            console.log("Illegal action ")
                        }
                        else {
                            map.set(line[1], [NUM, Number(map.get(line[3])[1]) / Number(line[5].split(";")[0])])
                        }
                    }
                }
            }
            else {
                if (map.has(line[5].split(";")[0])) {
                    if (line[4] === ADD) {
                        map.set(line[1], [NUM, Number(line[3]) + Number(map.get(line[5].split(";")[0])[1])])
                    }
                    if (line[4] === SUB) {
                        map.set(line[1], [NUM, Number(line[3]) - Number(map.get(line[5].split(";")[0])[1])])
                    }
                    if (line[4] === MUL) {
                        map.set(line[1], [NUM, Number(line[3]) * Number(map.get(line[5].split(";")[0])[1])])
                    }
                    if (line[4] === DIV) {
                        if (map.get(line[5].split(";")[0])[1] == 0) {
                            console.log("Illegal action ")
                        }
                        else {
                            map.set(line[1], [NUM, Number(line[3]) / Number(map.get(line[5].split(";")[0])[1])])
                        }
                    }
                }
                else {
                    if (line[4] === ADD) {
                        map.set(line[1], [NUM, Number(line[3]) + Number(line[5].split(";")[0])])
                    }
                    if (line[4] === SUB) {
                        map.set(line[1], [NUM, Number(line[3]) - Number(line[5].split(";")[0])])
                    }
                    if (line[4] === MUL) {
                        map.set(line[1], [NUM, Number(line[3]) * Number(line[5].split(";")[0])])
                    }
                    if (line[4] === DIV) {
                        if (line[5].split(";")[0] == 0) {
                            console.log("Illegal action ")
                        }
                        else {
                            map.set(line[1], [NUM, Number(line[3]) / Number(line[5].split(";")[0])])
                        }
                    }
                }
            }
        }
    }

    else if (line[0] === BOOL) {
        map.set(line[1], [BOOL, line[3].split(";")[0]])
    }

    else if (line[0] === STR) {
        if (line.length === 2) {
            map.set(line[1].split(";")[0], [STR, undefined]);
        }
        if (line.length === 4) {
            map.set(line[1], [STR, line[3].split(";")[0].split('"')[1]]);
        }
        if (line.length === 6) {
            map.set(line[1], [STR, line[3].split('"')[1] + line[5].split(";")[0].split('"')[1]]);
        }
    }
    else if (line[0] === PRINT) {
        if (line[1].split(";")[0] === ENDL) {
            console.log("\n")
        }
        else if(line[1][1] === "\"" && line[1][line[1].length - 3] === "\""){
            console.log(line[1].split(";")[0].match(/\(([^)]+)\)/)[1])
        }
        else{
            console.log(map.get(line[1].split(";")[0].match(/\(([^)]+)\)/)[1])[1])
        }
    }

    else if (map.has(line[0])) {
        if (map.get(line[0])[0] === NUM) {
            if (line.length === 3) {
                if (!map.has(line[2].split(";")[0])) {
                    map.set(line[0], [NUM, line[2].split(";")[0]])
                }
                else {
                    map.set(line[0], [NUM, map.get(line[2].split(";")[0])[1]])
                }
            }
            else if (line.length === 5) {
                if (map.has(line[2])) {
                    if (map.has(line[4].split(";")[0])) {
                        if (line[3] === ADD) {
                            map.set(line[0], [NUM, Number(map.get(line[2])[1]) + Number(map.get(line[4].split(";")[0])[1])])
                        }
                        if (line[3] === SUB) {
                            map.set(line[0], [NUM, Number(map.get(line[2])[1]) - Number(map.get(line[4].split(";")[0])[1])])
                        }
                        if (line[3] === MUL) {
                            map.set(line[0], [NUM, Number(map.get(line[2])[1]) * Number(map.get(line[4].split(";")[0])[1])])
                        }
                        if (line[3] === DIV) {
                            if (map.get(line[4].split(";")[0])[1] == 0) {
                                console.log("Illegal action ")
                            }
                            else {
                                map.set(line[0], [NUM, Number(map.get(line[2])[1]) / Number(map.get(line[4].split(";")[0])[1])])
                            }
                        }
                    }
                    else {
                        if (line[3] === ADD) {
                            map.set(line[0], [NUM, Number(map.get(line[2])[1]) + Number(line[4].split(";")[0])])
                        }
                        if (line[3] === SUB) {
                            map.set(line[0], [NUM, Number(map.get(line[2])[1]) - Number(line[4].split(";")[0])])
                        }
                        if (line[3] === MUL) {
                            map.set(line[0], [NUM, Number(map.get(line[2])[1]) * Number(line[4].split(";")[0])])
                        }
                        if (line[3] === DIV) {
                            if (line[4].split(";")[0] == 0) {
                                console.log("Illegal action ")
                            }
                            else {
                                map.set(line[0], [NUM, Number(map.get(line[2])[1]) / Number(line[4].split(";")[0])])
                            }
                        }
                    }
                }
                else {
                    if (map.has(line[4].split(";")[0])) {
                        if (line[3] === ADD) {
                            map.set(line[0], [NUM, Number(line[2]) + Number(map.get(line[4].split(";")[0])[1])])
                        }
                        if (line[3] === SUB) {
                            map.set(line[0], [NUM, Number(line[2]) - Number(map.get(line[4].split(";")[0])[1])])
                        }
                        if (line[3] === MUL) {
                            map.set(line[0], [NUM, Number(line[2]) * Number(map.get(line[4].split(";")[0])[1])])
                        }
                        if (line[3] === DIV) {
                            if (map.get(line[4].split(";")[0])[1] == 0) {
                                console.log("Illegal action ")
                            }
                            else {
                                map.set(line[0], [NUM, Number(line[2]) / Number(map.get(line[4].split(";")[0])[1])])
                            }
                        }
                    }
                    else {
                        if (line[3] === ADD) {
                            map.set(line[0], [NUM, Number(line[2]) + Number(line[4].split(";")[0])])
                        }
                        if (line[3] === SUB) {
                            map.set(line[0], [NUM, Number(line[2]) - Number(line[4].split(";")[0])])
                        }
                        if (line[3] === MUL) {
                            map.set(line[0], [NUM, Number(line[2]) * Number(line[4].split(";")[0])])
                        }
                        if (line[3] === DIV) {
                            if (line[4].split(";")[0] == 0) {
                                console.log("Illegal action ")
                            }
                            else {
                                map.set(line[0], [NUM, Number(line[2]) / Number(line[4].split(";")[0])])
                            }
                        }
                    }
                }
            }
        }
        else if (map.get(line[0])[0] === BOOL) {
            map.set(line[0], [BOOL, line[2].split(";")[0]])
        }
        //str = "akuna", str = "akuna" ADD "matata"
        else if (map.get(line[0])[0] === STR) {
            if (line.length === 3) {
                map.set(line[0], [STR, line[2].split(";")[0].split('"')[1]]);
            }
            if (line.length === 5) {
                map.set(line[0].split(";")[0], [STR, line[2].split('"')[1] + line[4].split(";")[0].split('"')[1]]);
            }
        }
    }
}

for (let lineIdx = 0; lineIdx < linesOfFile.length; ++lineIdx) {
    let splitedLine = linesOfFile[lineIdx].split(" ");
    
    if (splitedLine[0] === IF) {
        if (global.get(splitedLine[1].match(/\(([^)]+)\)/)[1])[1] === "true") {
            for (let i = lineIdx + 1;  linesOfFile[i].split(" ")[0] !== "}"; ++i) {
                let spLine = linesOfFile[i].split(" ");
                operation(spLine, local);
                
                if(linesOfFile[i+1][0] === "}") {
                    lineIdx = i+2;
                    local.clear();
                }
            } 
        }
    }
    else if(splitedLine[0] === FOR) {
        //to do
    }
    else {
        operation(splitedLine, global);
    }
}

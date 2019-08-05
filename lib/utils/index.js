const fs = require('fs');
const path = require('path');

function loadFile(curPath, type, callback) {
    fs.readdir(curPath, (err, file) => {
        if (err) {
            console.log(err);
            return;
        }
    
        file.forEach((v, i) => {
            const __path__ = path.join(curPath, v);
            if (fs.statSync(__path__).isDirectory()) {
                loadFile(__path__, type, callback);
                return;
            }
            if (path.extname(__path__) !== type) {
                return;
            }
            setTimeout(_ => {
                callback(__path__);
            }, 0);
        });
    });
}

function validateDate(row, curMonth, curYear) {
    const dateArr = row.w.split('/');
    return curMonth === dateArr[0] && curYear === dateArr[2];
}

function createDir(__path__) {
    const dirname = `${path.dirname(__path__)}_new`;
    try {
        fs.mkdirSync(dirname);
    } catch (error) {
    }
    return dirname;
}

function splitBracket(text) {
    const [] = text.split('（');
    let l = '';
    let r = '';
    let t = '';
    const leftBracket = text.indexOf('（');
    const rightBracket = text.indexOf('）');
    [l, r] = text.indexOf('（') > -1 ? text.split('（') : text.split('(');
    [t] = text.indexOf('）') > -1 ? r.split('）') : r.split(')');
    return [l, t];
}

module.exports = {
    loadFile,
    validateDate,
    createDir,
    splitBracket,
}

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { TITLE, COLS, DATEKEY, CLASSKEY } = require('../config');

const type = '.xlsx';
const curPath = path.resolve('../../testfile');

function loadFile(curPath, type) {
    fs.readdir(curPath, (err, file) => {
        if (err) {
            console.log(err);
            return;
        }
    
        file.forEach((v, i) => {
            const __path__ = path.join(curPath, v);
            if (fs.statSync(__path__).isDirectory()) {
                loadFile(__path__, type);
                return;
            }
            if (path.extname(__path__) !== type) {
                return;
            }
            setTimeout(_ => {
                screenFile(__path__);
            }, 0);
        });
    });
}

function screenFile(path) {
    const count = readFile(path);
    const newDirName = createDir(path);
    createFile(path, newDirName, count);
}

function readFile(__path__) {
    const wb = XLSX.readFile(__path__);
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    const rowRange = [];
    const dateRange = [];
    let rowIdx = 3;
    const curMonth = (new Date().getMonth() + 1).toString();
    const curYear = new Date().getFullYear().toString().substr(2, 2);
    let hasNotFind = true;
    let hasNotFinded = true;

    while (1) {
        const row = ws[`${DATEKEY}${rowIdx}`];
        if (!row) {
            break;
        }
        if (validateDate(row, curMonth, curYear)) {
            if (hasNotFind) {
                hasNotFind = false
            }
            rowRange.push(rowIdx);
            dateRange.push(dateRange.length + 1);
            rowIdx++;
        } else if (hasNotFind) {
            // 还没找到
            rowIdx++;
        } else if (!hasNotFind && hasNotFinded) {
            // 找完了
            hasNotFinded = false;
            rowIdx++;
        } else {
            break;
        }
    }
    
    const count = {};
    CLASSKEY.forEach(key => {
        rowRange.forEach((rowKey, idx) => {
            const row = ws[`${key}${rowKey}`];
            if (row) {
                const [ l, r ] = row.v.split('（');
                const [ t ] = r.split('）');
                if (count[t]) {
                    if (count[t][l]) {
                        count[t][l]++;
                    } else {
                        count[t][l] = 1;
                    }
                    if (count[t].date[dateRange[idx]]) {
                        count[t].date[dateRange[idx]]++;
                    } else {
                        count[t].date[dateRange[idx]] = 1;
                    }
                    count[t].count++;
                } else {
                    count[t] = {
                        [l]: 1,
                        count: 1,
                        date: { [dateRange[idx]]: 1 },
                    };
                }
            }
        });
    });

    return count;
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

function createFile(oldPath, newPath, count) {
    try {
        fileName = oldPath.replace(path.dirname(oldPath), '').replace(type, type);
        const excelArr = [TITLE];
        for (const tKey in count) {
            const t = count[tKey];
            const item = [tKey, '', ''];
            for (const key in t) {
                switch (key) {
                    case 'count':
                        item[2] += `共${t[key]}`;
                        break;
                    case 'date':
                        for (const date in t[key]) {
                            item[1] += `${date},`;
                        }
                        break;
                    default:
                        break;
                }
            }
            excelArr.push(item);
        }
        let wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelArr);
        ws['!cols'] = COLS;
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${newPath}${fileName}`);
    } catch (error) {
        console.log('写入失败');
        console.log(error);
    }
}

loadFile(curPath, type);

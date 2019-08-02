const path = require('path');
const createExcel = require('../main');

const curPath = path.resolve('../../testfile');

createExcel(curPath);

// module.exports = function(curPath) {
//     createExcel(curPath);
// }

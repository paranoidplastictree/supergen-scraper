const readFromFile = (filePath) => {
    var fs = require('fs');
    return fs.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });
}

const readJSONLToArray = (sourceFileName) => {
  const filePath = 'data/' + sourceFileName;
  const data = readFromFile(filePath);
  const jsonl = data.toString().split("\r\n");

  return jsonl.filter(line => line.trim() !== '')
                  .map(line => JSON.parse(line));
}

exports.readFromFile = readFromFile;
exports.readJSONLToArray = readJSONLToArray;
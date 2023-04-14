import fs from 'fs';
import path from 'path';
import readline from 'readline';

const csvFileName = 'Coin_Metrics_Network_Data_2023-02-02T14-32.csv';
var csvPath = path.resolve(path.join(process.cwd(), 'data', csvFileName));

export default async (): Promise<any []> => new Promise((resolve) => {
  let jsonData: any[] = [];

  // trying not to use a third party dep here
  // this command <file -I {filename}> got me the encoding (utf8 is default)
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf16le' }),
    crlfDelay: Infinity,
  });
  let firstLine = true;
  let keys: any[] = [];

  rl.on('line', (line) => {
    const data = line.replaceAll('"', '').split('\t');
    // set the keys for ensuing objects while reading the first line
    if (firstLine) {
      keys = data.map((k) => k.trim());
      firstLine = false;
    } else {
      // push result rows using the keys and currently read row
      const jsonRow: {} = keys.reduce((rowObj, key, i) => ({
        ...rowObj,
        [key]: i === 0 ? data[i] : Number(data[i]),
      }), {});
      jsonData.push(jsonRow);
    }
  });

  // don't send the response until the file reading is done
  rl.on('close', () => {
    resolve(jsonData);
  });
});

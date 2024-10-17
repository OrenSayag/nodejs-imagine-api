import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

type Input = {
  urls: string[];
  imagineApiId: string;
  outputDir: string;
};

type Output = Promise<void>;

const downloadImages = async ({ urls, imagineApiId, outputDir }: Input): Output => {
  console.log('Downloading images...');
  await Promise.all(
    urls.map(async (url) => {
      console.log('Downloading image ' + url);
      const downloadDir = outputDir
      const writePath = path.join(downloadDir, imagineApiId, url.split('/').pop());
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
      }
      if (!fs.existsSync(path.dirname(writePath))) {
        fs.mkdirSync(path.dirname(writePath));
      }
      const res = await axios.get(url, { responseType: 'stream' });
      const writer = fs.createWriteStream(writePath);
      res.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Wrote picture to path ${writePath}`);
          resolve('');
        });
        writer.on('error', reject);
      });
    }),
  );
};

export default downloadImages;

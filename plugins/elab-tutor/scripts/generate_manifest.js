
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
const OUTPUT_FILE = path.join(__dirname, 'src', 'assets_manifest.json');
const MATERIALE_DIR = path.join(__dirname, 'public', 'MATERIALE');

const scanDir = (basePath, relativeStart) => {
    let results = [];
    if (!fs.existsSync(basePath)) return results;

    const items = fs.readdirSync(basePath);
    for (const item of items) {
        const fullPath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(scanDir(fullPath, path.join(relativeStart, item)));
        } else if (/\.(png|jpg|jpeg|svg|gif|webp)$/i.test(item)) {
            results.push({
                name: item,
                path: '/' + path.join(relativeStart, item).split(path.sep).join('/'),
                type: path.extname(item).substring(1).toLowerCase(),
            });
        }
    }
    return results;
};

console.log('Scanning...');
const assets = scanDir(ASSETS_DIR, 'assets');
if (fs.existsSync(MATERIALE_DIR)) {
    assets.push(...scanDir(MATERIALE_DIR, 'MATERIALE'));
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(assets, null, 2));
console.log(`Done. ${assets.length} assets found.`);

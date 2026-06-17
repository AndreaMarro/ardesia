import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'public');
const MATERIALE_DIR = path.join(PUBLIC_DIR, 'MATERIALE');
const OUTPUT_FILE = path.join(__dirname, 'src', 'assets_manifest.json');

function scanDirectory(dir, relativePath = '') {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const relPath = path.join(relativePath, file);

        if (stat && stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath, relPath));
        } else {
            // Filter for images/svgs
            if (/\.(svg|png|jpg|jpeg|gif)$/i.test(file)) {
                results.push({
                    name: file,
                    path: '/MATERIALE/' + relPath, // Web-accessible path
                    type: path.extname(file).substring(1)
                });
            }
        }
    });
    return results;
}

console.log('Scanning assets in:', MATERIALE_DIR);

if (!fs.existsSync(MATERIALE_DIR)) {
    console.error('MATERIALE directory not found!');
    process.exit(1);
}

const assets = scanDirectory(MATERIALE_DIR);
console.log(`Found ${assets.length} assets.`);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(assets, null, 2));
console.log('Manifest written to:', OUTPUT_FILE);

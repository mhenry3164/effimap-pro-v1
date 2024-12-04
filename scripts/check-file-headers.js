import { createReadStream } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkFileHeader(filePath) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const stream = createReadStream(filePath, {
            encoding: 'utf8',
            start: 0,
            end: 1000 // Read first 1000 bytes
        });

        stream.on('data', chunk => chunks.push(chunk));
        
        stream.on('end', () => {
            const content = chunks.join('');
            console.log(`\nFile: ${basename(filePath)}`);
            console.log('First 1000 bytes:');
            console.log('----------------------------------------');
            console.log(content);
            console.log('----------------------------------------');
            resolve();
        });

        stream.on('error', reject);
    });
}

async function main() {
    const dataDir = join(__dirname, '..', 'data');
    const files = [
        join(dataDir, 'states.geojson.json'),
        join(dataDir, 'counties.geojson'),
        join(dataDir, 'zipcodes.geojson.json')
    ];

    for (const file of files) {
        try {
            await checkFileHeader(file);
        } catch (error) {
            console.error(`Error checking ${basename(file)}:`, error.message);
        }
    }
}

main().catch(console.error);

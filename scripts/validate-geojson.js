import { createReadStream } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validateGeoJSON(filePath) {
    console.log(`\nValidating ${basename(filePath)}...`);
    
    return new Promise((resolve, reject) => {
        const fileStream = createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
        let buffer = '';
        let featuresCount = 0;
        let hasType = false;
        let hasFeatures = false;
        let featureStart = -1;
        
        fileStream.on('data', chunk => {
            buffer += chunk;
            
            // Check for FeatureCollection type
            if (!hasType && buffer.includes('"type":"FeatureCollection"')) {
                hasType = true;
                console.log(`✓ Found FeatureCollection type`);
            }
            
            // Check for features array
            if (!hasFeatures && buffer.includes('"features":[')) {
                hasFeatures = true;
                console.log(`✓ Found features array`);
            }
            
            // Count complete features
            while (true) {
                if (featureStart === -1) {
                    featureStart = buffer.indexOf('{"type":"Feature"', featureStart + 1);
                    if (featureStart === -1) break;
                }
                
                let braceCount = 0;
                let featureEnd = -1;
                
                // Find the end of this feature by counting braces
                for (let i = featureStart; i < buffer.length; i++) {
                    if (buffer[i] === '{') braceCount++;
                    else if (buffer[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            featureEnd = i + 1;
                            break;
                        }
                    }
                }
                
                if (featureEnd === -1) break;
                
                featuresCount++;
                if (featuresCount % 1000 === 0) {
                    console.log(`  Found ${featuresCount} features...`);
                }
                
                featureStart = featureEnd;
            }
            
            // Keep only the unprocessed part of the buffer
            if (featureStart > 0) {
                buffer = buffer.slice(Math.max(0, featureStart));
                featureStart = 0;
            }
            
            // If buffer gets too large, keep only the last potential feature
            if (buffer.length > 128 * 1024) {
                const lastFeature = buffer.lastIndexOf('{"type":"Feature"');
                if (lastFeature > 0) {
                    buffer = buffer.slice(lastFeature);
                    featureStart = 0;
                }
            }
        });
        
        fileStream.on('end', () => {
            console.log(`✓ Total features found: ${featuresCount}`);
            if (hasType && hasFeatures && featuresCount > 0) {
                console.log(`✓ ${basename(filePath)} is valid`);
                resolve({
                    file: basename(filePath),
                    valid: true,
                    featuresCount
                });
            } else {
                reject(`Invalid GeoJSON structure in ${basename(filePath)}`);
            }
        });
        
        fileStream.on('error', error => {
            reject(`Error reading ${basename(filePath)}: ${error.message}`);
        });
    });
}

async function main() {
    const dataDir = join(__dirname, '..', 'data');
    const files = [
        join(dataDir, 'states.geojson.json'),
        join(dataDir, 'counties.geojson'),
        join(dataDir, 'zipcodes.geojson.json')
    ];
    
    console.log('Starting GeoJSON validation...');
    
    for (const file of files) {
        try {
            const result = await validateGeoJSON(file);
            console.log(`\n✅ ${result.file}: ${result.featuresCount} features\n`);
        } catch (error) {
            console.error(`\n❌ ${error}\n`);
        }
    }
}

main().catch(console.error);

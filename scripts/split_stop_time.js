#!/usr/bin/env node

/**
 * Script to split stop_times.txt into smaller files by stop_id
 * This reduces the amount of data loaded per user interaction
 * 
 * Usage: node scripts/split_stop_times.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/public_data/stop_times.txt');
const OUTPUT_DIR = path.join(__dirname, '../public/public_data/stop_times');

async function splitStopTimes() {
  console.log('🚀 Starting stop_times.txt split...');
  console.log(`Input: ${INPUT_FILE}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fileHandles = new Map();
  const stopCounts = new Map();
  let totalLines = 0;
  let headerLine = '';

  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT_FILE),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (totalLines === 0) {
      headerLine = line;
      totalLines++;
      continue;
    }

    const match = line.match(/^"?([^",]+)"?,/);
    if (!match) continue;

    const tripId = match[1];
    const stopIdMatch = line.match(/,"?(\d+)"?,\d+,/);
    if (!stopIdMatch) continue;

    const stopId = stopIdMatch[1];

    if (!fileHandles.has(stopId)) {
      const outputFile = path.join(OUTPUT_DIR, `${stopId}.txt`);
      const stream = fs.createWriteStream(outputFile);
      stream.write(headerLine + '\n');
      fileHandles.set(stopId, stream);
      stopCounts.set(stopId, 0);
    }

    fileHandles.get(stopId).write(line + '\n');
    stopCounts.set(stopId, stopCounts.get(stopId) + 1);

    totalLines++;
    if (totalLines % 100000 === 0) {
      process.stdout.write(`\rProcessed ${totalLines.toLocaleString()} lines...`);
    }
  }

  console.log(`\n\n✅ Split complete!`);
  console.log(`Total lines: ${totalLines.toLocaleString()}`);
  console.log(`Unique stops: ${fileHandles.size}`);
  console.log(`\nTop 10 busiest stops:`);

  const sorted = Array.from(stopCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([stopId, count], i) => {
    console.log(`  ${i + 1}. Stop ${stopId}: ${count} entries`);
  });

  for (const [stopId, stream] of fileHandles) {
    stream.end();
  }

  console.log(`\n📁 Files created in: ${OUTPUT_DIR}`);
  
  const indexData = {
    totalStops: fileHandles.size,
    totalEntries: totalLines - 1,
    stopCounts: Object.fromEntries(stopCounts)
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(indexData, null, 2)
  );
  
  console.log('📄 Created index.json with metadata');
}

splitStopTimes().catch(console.error);
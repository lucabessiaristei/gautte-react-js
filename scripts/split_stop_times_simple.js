#!/usr/bin/env node

/**
 * Simplified script to split stop_times.txt
 * Usage: node split_stop_times_simple.js [path/to/stop_times.txt]
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const inputFile = process.argv[2] || './public/public_data/stop_times.txt';
const outputDir = path.join(path.dirname(inputFile), 'stop_times');

console.log('🚀 Stop Times Splitter');
console.log('Input file:', inputFile);
console.log('Output dir:', outputDir);

if (!fs.existsSync(inputFile)) {
  console.error('\n❌ ERROR: File not found:', inputFile);
  console.log('\nUsage: node split_stop_times_simple.js [path/to/stop_times.txt]');
  console.log('Example: node split_stop_times_simple.js ./public/public_data/stop_times.txt');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created output directory');
}

const fileHandles = new Map();
const stopCounts = new Map();
let totalLines = 0;
let headerLine = '';

console.log('\n📝 Processing file...\n');

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (totalLines === 0) {
    headerLine = line;
    totalLines++;
    return;
  }

  // Parse CSV line to get stop_id (4th column typically)
  const columns = line.split(',');
  if (columns.length < 4) return;
  
  const stopId = columns[3].replace(/"/g, '').trim();
  if (!stopId) return;

  if (!fileHandles.has(stopId)) {
    const outputFile = path.join(outputDir, `${stopId}.txt`);
    const stream = fs.createWriteStream(outputFile);
    stream.write(headerLine + '\n');
    fileHandles.set(stopId, stream);
    stopCounts.set(stopId, 0);
  }

  fileHandles.get(stopId).write(line + '\n');
  stopCounts.set(stopId, stopCounts.get(stopId) + 1);

  totalLines++;
  if (totalLines % 50000 === 0) {
    process.stdout.write(`\rProcessed ${totalLines.toLocaleString()} lines...`);
  }
});

rl.on('close', () => {
  console.log(`\n\n✅ Split complete!`);
  console.log(`Total lines: ${totalLines.toLocaleString()}`);
  console.log(`Unique stops: ${fileHandles.size}`);
  
  console.log(`\nTop 10 busiest stops:`);
  const sorted = Array.from(stopCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([stopId, count], i) => {
    console.log(`  ${i + 1}. Stop ${stopId}: ${count.toLocaleString()} entries`);
  });

  for (const [stopId, stream] of fileHandles) {
    stream.end();
  }

  const indexData = {
    totalStops: fileHandles.size,
    totalEntries: totalLines - 1,
    stopCounts: Object.fromEntries(stopCounts)
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(indexData, null, 2)
  );
  
  console.log(`\n📁 Files created in: ${outputDir}`);
  console.log('📄 Created index.json with metadata\n');
});
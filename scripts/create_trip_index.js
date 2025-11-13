#!/usr/bin/env node

/**
 * Create an index mapping trip_id -> [stop_ids]
 * This allows quick lookup of which stops belong to a trip
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const INPUT_FILE = process.argv[2] || './public/public_data/stop_times.txt';
const OUTPUT_FILE = path.join(path.dirname(INPUT_FILE), 'trip_stops_index.json');

console.log('🚀 Creating trip→stops index...');
console.log('Input:', INPUT_FILE);
console.log('Output:', OUTPUT_FILE);

const tripStops = new Map();
let totalLines = 0;

const rl = readline.createInterface({
  input: fs.createReadStream(INPUT_FILE),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (totalLines === 0) {
    totalLines++;
    return; // Skip header
  }

  const columns = line.split(',');
  if (columns.length < 4) return;
  
  const tripId = columns[0].replace(/"/g, '').trim();
  const stopId = columns[3].replace(/"/g, '').trim();
  const stopSequence = columns[4].replace(/"/g, '').trim();
  
  if (!tripId || !stopId) return;

  if (!tripStops.has(tripId)) {
    tripStops.set(tripId, []);
  }
  
  tripStops.get(tripId).push({
    stop_id: stopId,
    stop_sequence: parseInt(stopSequence) || 0
  });

  totalLines++;
  if (totalLines % 100000 === 0) {
    process.stdout.write(`\rProcessed ${totalLines.toLocaleString()} lines...`);
  }
});

rl.on('close', () => {
  console.log(`\n\n✅ Index complete!`);
  console.log(`Total lines: ${totalLines.toLocaleString()}`);
  console.log(`Unique trips: ${tripStops.size.toLocaleString()}`);

  // Sort stops by sequence for each trip
  const sortedIndex = {};
  for (const [tripId, stops] of tripStops) {
    sortedIndex[tripId] = stops
      .sort((a, b) => a.stop_sequence - b.stop_sequence)
      .map(s => s.stop_id);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedIndex));
  
  const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
  console.log(`\n📄 Created ${OUTPUT_FILE} (${sizeKB} KB)`);
  console.log('\nUsage in app:');
  console.log('  const index = await fetch("/public_data/trip_stops_index.json").then(r => r.json());');
  console.log('  const stopIds = index[tripId]; // Array of stop_ids for this trip');
});
#!/usr/bin/env python3
import csv
import json
import os
from collections import defaultdict
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
INPUT_FILE = PROJECT_ROOT / 'public' / 'public_data' / 'stop_times.txt'
OUTPUT_DIR = PROJECT_ROOT / 'public' / 'public_data' / 'stop_times'
INDEX_FILE = OUTPUT_DIR / 'index.json'

def split_stop_times():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    stop_data = defaultdict(list)
    header = None
    
    print(f'Reading {INPUT_FILE}...')
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames
        
        for i, row in enumerate(reader):
            stop_id = row['stop_id']
            stop_data[stop_id].append(row)
            
            if (i + 1) % 100000 == 0:
                print(f'  Processed {i + 1} rows...')
    
    print(f'\nWriting split files for {len(stop_data)} stops...')
    index = {}
    
    for stop_id, rows in stop_data.items():
        filename = f'{stop_id}.txt'
        filepath = OUTPUT_DIR / filename
        
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=header, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            writer.writerows(rows)
        
        index[stop_id] = filename
        
        if len(index) % 100 == 0:
            print(f'  Written {len(index)} files...')
    
    print(f'\nWriting index file...')
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)
    
    print(f'\n✓ Done!')
    print(f'  Total stops: {len(stop_data)}')
    print(f'  Output directory: {OUTPUT_DIR}')
    print(f'  Index file: {INDEX_FILE}')
    
    total_rows = sum(len(rows) for rows in stop_data.values())
    print(f'  Total rows split: {total_rows}')

if __name__ == '__main__':
    split_stop_times()
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const program = new Command();

// CLI definition
program
  .name('rename-frames')
  .description('Rename all image files in a folder to frame_####.png format')
  .option('-d, --dir <path>', 'Directory containing images', '.')
  .option('-s, --start <number>', 'Starting number for frame index', '0')
  .option('-r, --reverse', 'Reverse the file order before renaming')
  .parse(process.argv);

const options = program.opts();
const dir = options.dir;
const start = parseInt(options.start);
const reverse = options.reverse;

// Supported image extensions
const imageExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

// Get and filter image files
let files = fs.readdirSync(dir)
  .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
  .sort();

if (reverse) files.reverse();

// Rename to temporary names to avoid conflicts
files.forEach((file, index) => {
  const oldPath = path.join(dir, file);
  const tempPath = path.join(dir, `.__temp__${index}`);
  fs.renameSync(oldPath, tempPath);
});

// Rename temp files to final format
fs.readdirSync(dir)
  .filter(file => file.startsWith('.__temp__'))
  .sort()
  .forEach((file, index) => {
    const newIndex = start + index;
    const padded = String(newIndex).padStart(4, '0');
    const finalName = `frame_${padded}.png`;
    const tempPath = path.join(dir, file);
    const finalPath = path.join(dir, finalName);
    fs.renameSync(tempPath, finalPath);
  });

console.log(`✅ Renamed ${files.length} files in '${dir}' starting from ${start}${reverse ? ' in reverse order' : ''}.`);

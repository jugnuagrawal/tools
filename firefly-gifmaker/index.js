#!/usr/bin/env node

const { Command } = require('commander');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const program = new Command();

program
  .name('firefly-gifmaker')
  .description('Convert frame_####.png files into a GIF or MP4 video using ffmpeg')
  .requiredOption('-o, --output <filename>', 'Output file name (e.g., output.mp4 or output.gif)')
  .option('-d, --dir <path>', 'Directory containing frames', '.')
  .option('-f, --fps <number>', 'Frame rate (default: 10)', '10')
  .parse(process.argv);

const opts = program.opts();
const dir = path.resolve(opts.dir || process.cwd());;
const output = opts.output;
const fps = parseInt(opts.fps);

// Detect format from output extension
const ext = path.extname(output).toLowerCase();
const format = ext === '.gif' ? 'gif' : ext === '.mp4' ? 'mp4' : null;

if (!format) {
  console.error("❌ Output filename must end with .gif or .mp4 to determine format.");
  process.exit(1);
}

// Ensure frames exist
const firstFrame = path.join(dir, 'frame_0000.png');
if (!fs.existsSync(firstFrame)) {
  console.error(`❌ Cannot find ${firstFrame}. Ensure your frames are named as frame_####.png`);
  process.exit(1);
}

// ffmpeg command
let cmd = `ffmpeg -y -framerate ${fps} -i ${path.join(dir, 'frame_%04d.png')}`;

if (format === 'gif') {
  cmd += ` -vf "scale=640:-1:flags=lanczos" ${output}`;
} else {
  cmd += ` -c:v libx264 -pix_fmt yuv420p ${output}`;
}

try {
  console.log(`🚀 Creating ${format.toUpperCase()} at ${fps} fps: ${output}`);
  execSync(cmd, { stdio: 'inherit' });
  console.log(`✅ Done: ${output}`);
} catch (err) {
  console.error(`❌ ffmpeg failed:`, err.message);
}

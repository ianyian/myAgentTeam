// Take screenshots of BMW page and report using Chrome headless
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const shots = [
  { url: `file:///${root.replace(/\\/g,'/')}/output/index.html`, out: 'output/screenshot-index.png', size: '1280,800' },
  { url: `file:///${root.replace(/\\/g,'/')}/output/report.html`, out: 'output/screenshot-report.png', size: '1280,800' },
  { url: `file:///${root.replace(/\\/g,'/')}/output/index.html`, out: 'output/screenshot-index-full.png', size: '1280,2400' },
];

for (const shot of shots) {
  const { url, out } = shot;
  const abs = path.resolve(root, out);
  const dir = path.dirname(abs);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const cmd = `"${chrome}" --headless=new --disable-gpu --screenshot="${abs}" --window-size=${shot.size} --hide-scrollbars "${url}"`;
  console.log('Capturing:', out);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 30000 });
    console.log('  -> saved:', abs);
  } catch (e) {
    console.error('  ERROR:', e.message?.slice(0, 200));
  }
}
console.log('Done.');

const { spawn, execSync } = require('child_process');
const fs = require('fs');

try {
    console.log('[SYSTEM] Syncing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('[SYSTEM] Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('[SYSTEM] Compiling TypeScript to production JavaScript...');
    execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
    console.error('[SYSTEM WARNING] Pre-start build step encountered an error:', error);
}

const hasBuiltJs = fs.existsSync('./dist/index.js');

if (hasBuiltJs) {
    console.log('[SYSTEM] Starting bot in Lightweight Production Mode (dist/index.js)...');
    const child = spawn('node', ['--max-old-space-size=256', './dist/index.js'], { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code));
} else {
    console.log('[SYSTEM] Starting bot in TypeScript Mode (src/index.ts)...');
    const child = spawn('npx', ['ts-node', '--transpile-only', 'src/index.ts'], { stdio: 'inherit', shell: true });
    child.on('exit', (code) => process.exit(code));
}

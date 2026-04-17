#!/usr/bin/env node

/**
 * TwinMind Pro - Setup Validator
 * Checks your environment before running the app
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const CHECKS = [
  {
    name: 'Node.js',
    cmd: 'node -v',
    minVersion: '16.0.0',
    required: true,
  },
  {
    name: 'npm',
    cmd: 'npm -v',
    minVersion: '7.0.0',
    required: true,
  },
];

const FILE_CHECKS = [
  { path: 'backend/package.json', required: true },
  { path: 'frontend/package.json', required: true },
  { path: 'README.md', required: false },
];

const logSuccess = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const logError = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const logWarn = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
const logInfo = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);

async function compareVersions(v1, v2) {
  const parts1 = v1.replace(/v/g, '').split('.');
  const parts2 = v2.replace(/v/g, '').split('.');

  for (let i = 0; i < 3; i++) {
    const p1 = parseInt(parts1[i]) || 0;
    const p2 = parseInt(parts2[i]) || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err);
      resolve(stdout.trim());
    });
  });
}

async function validateTools() {
  console.log(`\n${colors.blue}🔍 Checking Tools...${colors.reset}\n`);

  let allPass = true;

  for (const check of CHECKS) {
    try {
      const version = await runCommand(check.cmd);
      const comparison = await compareVersions(version, check.minVersion);

      if (comparison >= 0) {
        logSuccess(`${check.name} ${version} (required: ${check.minVersion}+)`);
      } else {
        logError(
          `${check.name} ${version} is below minimum ${check.minVersion}`
        );
        allPass = false;
      }
    } catch (err) {
      if (check.required) {
        logError(`${check.name} not found - install from https://nodejs.org`);
        allPass = false;
      } else {
        logWarn(`${check.name} not found (optional)`);
      }
    }
  }

  return allPass;
}

async function validateFiles() {
  console.log(`\n${colors.blue}📁 Checking Files...${colors.reset}\n`);

  let allPass = true;

  for (const check of FILE_CHECKS) {
    if (fs.existsSync(check.path)) {
      logSuccess(`${check.path} exists`);
    } else {
      if (check.required) {
        logError(`${check.path} not found`);
        allPass = false;
      } else {
        logWarn(`${check.path} not found (optional)`);
      }
    }
  }

  return allPass;
}

async function validateEnv() {
  console.log(`\n${colors.blue}⚙️  Checking Configuration...${colors.reset}\n`);

  if (fs.existsSync('backend/.env')) {
    const env = fs.readFileSync('backend/.env', 'utf8');
    if (env.includes('GROQ_API_KEY') && !env.includes('gsk_')) {
      logWarn('backend/.env exists but GROQ_API_KEY not set');
      return false;
    }
    logSuccess('backend/.env configured');
    return true;
  } else {
    logWarn('backend/.env not found - you can create it after install');
    return false;
  }
}

async function validateDependencies() {
  console.log(
    `\n${colors.blue}📦 Checking Dependencies...${colors.reset}\n`
  );

  let backendPass = true;
  let frontendPass = true;

  if (fs.existsSync('backend/node_modules')) {
    logSuccess('Backend dependencies installed');
  } else {
    logWarn('Backend dependencies not installed - run: cd backend && npm install');
    backendPass = false;
  }

  if (fs.existsSync('frontend/node_modules')) {
    logSuccess('Frontend dependencies installed');
  } else {
    logWarn('Frontend dependencies not installed - run: cd frontend && npm install');
    frontendPass = false;
  }

  return backendPass && frontendPass;
}

async function main() {
  console.log(`\n${colors.blue}${'='.repeat(50)}`);
  console.log('🎙️  TwinMind Pro - Setup Validator');
  console.log(`${'='.repeat(50)}${colors.reset}\n`);

  const toolsPass = await validateTools();
  const filesPass = await validateFiles();
  const envPass = await validateEnv();
  const depsPass = await validateDependencies();

  console.log(
    `\n${colors.blue}${'='.repeat(50)}${colors.reset}`
  );

  if (toolsPass && filesPass) {
    logSuccess('All checks passed!');
    console.log(`
${colors.green}Next steps:${colors.reset}
1. cd backend && npm install
2. cp backend/.env.example backend/.env
3. Edit backend/.env with your GROQ_API_KEY
4. cd ../frontend && npm install
5. npm run dev:all (from root) or:
   - Terminal 1: cd backend && npm run dev
   - Terminal 2: cd frontend && npm run dev
    `);
  } else {
    logError('Some checks failed - see above for details');
    process.exit(1);
  }
}

main().catch((err) => {
  logError(`Setup validation failed: ${err.message}`);
  process.exit(1);
});

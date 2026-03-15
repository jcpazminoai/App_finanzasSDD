const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  const envContents = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const line of envContents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const repoRoot = path.resolve(__dirname, '../../../..');
const backendRoot = path.resolve(__dirname, '..', '..');
const envPath = path.join(repoRoot, '.env.test');
const env = {
  ...process.env,
  ...loadEnvFile(envPath)
};

const testDatabaseName = env.POSTGRES_DB;

try {
  execFileSync(
    'docker',
    [
      'exec',
      'finanzas_postgres',
      'psql',
      '-U',
      env.POSTGRES_USER,
      '-d',
      'postgres',
      '-c',
      `CREATE DATABASE ${testDatabaseName};`
    ],
    {
      stdio: 'pipe',
      env
    }
  );
} catch (error) {
  const output = String(error.stderr || error.message || '');

  if (!output.includes('already exists')) {
    throw error;
  }
}

execSync('npx prisma migrate deploy --schema ../../prisma/schema.prisma', {
  cwd: backendRoot,
  stdio: 'inherit',
  env
});

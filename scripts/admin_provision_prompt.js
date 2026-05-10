import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const rl = readline.createInterface({ input, output });

const ask = async (question, fallback = '') => {
  const answer = await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `);
  return answer.trim() || fallback;
};

try {
  const email = await ask('Admin email', process.env.TEST_EMAIL || '');
  const password = await ask('Admin password', process.env.TEST_PASSWORD || 'TempPass!2345');
  const username = await ask('Admin username', process.env.TEST_USERNAME || `admin_${Date.now()}`);
  const fullName = await ask('Full name', process.env.TEST_FULL_NAME || 'Brighten Admin');

  rl.close();

  const scriptPath = path.resolve('scripts/create_admin_with_service_role.js');
  const result = spawnSync(process.execPath, [scriptPath, email, password], {
    stdio: 'inherit',
    env: {
      ...process.env,
      TEST_EMAIL: email,
      TEST_PASSWORD: password,
      TEST_USERNAME: username,
      TEST_FULL_NAME: fullName,
    },
  });

  process.exit(result.status ?? 1);
} catch (error) {
  rl.close();
  console.error(error);
  process.exit(1);
}

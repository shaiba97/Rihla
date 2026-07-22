const fs = require('fs');
const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.log('[set-env] No API_URL set, using existing environment.prod.ts');
  process.exit(0);
}

const base = apiUrl.replace(/\/api$/, '');
const env = `export const environment = {
  production: true,
  apiUrl: {
    company:  '${base}/api-company',
    customer: '${base}/api-customer',
  },
  wsUrl: '${base}',
};
`;

fs.writeFileSync('src/environments/environment.prod.ts', env);
console.log(`[set-env] API_URL=${apiUrl}`);

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const allowedPaths = ['src/utils/supabaseClient.ts'];

const files = fs.readdirSync(projectRoot)
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
  .map(file => path.join(projectRoot, file));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@supabase/supabase-js') && !allowedPaths.some(p => file.includes(p))) {
    console.log(`Invalid Supabase import in ${file}`);
  }
});

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'schema.sql');
process.stdout.write(fs.readFileSync(schemaPath, 'utf8'));


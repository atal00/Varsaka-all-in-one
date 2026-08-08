const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

content = content.replace(/provider = "mongodb"/, 'provider = "postgresql"\n  url      = env("DATABASE_URL")');
content = content.replace(/@id @default\(auto\(\)\) @map\("_id"\) @db\.ObjectId/g, '@id @default(uuid())');
content = content.replace(/@db\.ObjectId/g, '');

fs.writeFileSync('prisma/schema.prisma', content);
console.log('Schema updated');

# Steps for Handling Migrations

### When making changes to your database schema, edit the schema.prisma file

npx prisma migrate dev --name <migration-name>
npx prisma migrate deploy
npx prisma generate

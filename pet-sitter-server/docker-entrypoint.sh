#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Database is ready"

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx ts-node scripts/seed.ts

echo "🚀 Starting server..."
exec node dist/src/main.js

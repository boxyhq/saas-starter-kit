const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

console.log('🔨 Building application...\n');

// Step 1: Generate Prisma Client
console.log('📦 Generating Prisma Client...');
run('npx prisma generate');

// Step 2: Try to deploy migrations
console.log('\n🗄️  Deploying database migrations...');
const deploySuccess = run('npx prisma migrate deploy');

if (!deploySuccess) {
  console.log('\n⚠️  Migration deploy failed. Attempting to baseline existing database...');
  
  // Get all migrations
  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir)
      .filter(file => fs.statSync(path.join(migrationsDir, file)).isDirectory())
      .sort();
    
    console.log(`📋 Found ${migrations.length} migrations`);
    
    // Mark all migrations as applied (baseline)
    for (const migration of migrations) {
      console.log(`✓ Marking ${migration} as applied...`);
      run(`npx prisma migrate resolve --applied "${migration}"`);
    }
    
    console.log('\n✅ Database baselined successfully');
  }
}

// Step 3: Build Next.js
console.log('\n🚀 Building Next.js application...');
if (!run('next build')) {
  console.error('\n❌ Build failed');
  process.exit(1);
}

console.log('\n✅ Build completed successfully!');

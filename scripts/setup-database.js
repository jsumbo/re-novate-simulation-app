#!/usr/bin/env node

/**
 * RE-Novate Database Setup Script
 * 
 * This script helps set up the Supabase database for the RE-Novate platform.
 * Run this after setting up your Supabase project.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 RE-Novate Database Setup');
console.log('============================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create .env.local with your Supabase credentials:\n');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n');
  process.exit(1);
}

console.log('✅ Environment file found');

// Check migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.log('❌ Migrations directory not found!');
  process.exit(1);
}

const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
console.log(`✅ Found ${migrationFiles.length} migration files:`);
migrationFiles.forEach(file => {
  console.log(`   - ${file}`);
});

console.log('\n📋 Database Setup Instructions:');
console.log('================================\n');

console.log('1. Install Supabase CLI if you haven\'t already:');
console.log('   pnpm add -g supabase\n');

console.log('2. Login to Supabase:');
console.log('   supabase login\n');

console.log('3. Link your project (replace YOUR_PROJECT_ID):');
console.log('   supabase link --project-ref YOUR_PROJECT_ID\n');

console.log('4. Run the migrations:');
console.log('   supabase db push\n');

console.log('5. Or manually run each migration in your Supabase dashboard:');
migrationFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. Run: supabase/migrations/${file}`);
});

console.log('\n🎯 What these migrations will create:');
console.log('=====================================\n');

console.log('📊 Core Tables:');
console.log('   - schools: Educational institutions');
console.log('   - users: Students, teachers, and admins');
console.log('   - student_profiles: Extended student information');

console.log('\n🎮 Learning Content:');
console.log('   - scenarios: Learning simulations');
console.log('   - scenario_options: Multiple choice options');
console.log('   - sessions: Learning sessions');
console.log('   - decisions: User choices and outcomes');

console.log('\n📈 Progress Tracking:');
console.log('   - progress: Skill development tracking');
console.log('   - quiz_results: Assessment results');
console.log('   - learning_goals: User objectives');

console.log('\n🤖 AI & Gamification:');
console.log('   - ai_interactions: AI mentor conversations');
console.log('   - achievements: Gamification rewards');
console.log('   - user_achievements: Earned achievements');
console.log('   - notifications: In-app messages');
console.log('   - learning_paths: Personalized learning journeys');

console.log('\n🔒 Security Features:');
console.log('   - Row Level Security (RLS) enabled on all tables');
console.log('   - Students can only access their own data');
console.log('   - Teachers can view their school\'s student data');
console.log('   - Proper authentication and authorization');

console.log('\n📝 Sample Data:');
console.log('   - 5 sample schools in Liberia');
console.log('   - 15 gamification achievements');
console.log('   - Sample scenarios for different interest areas');
console.log('   - Scenario options with AI feedback');

console.log('\n🚀 After Setup:');
console.log('===============\n');
console.log('1. Update your .env.local with the correct Supabase credentials');
console.log('2. Test the connection by running: pnpm dev');
console.log('3. Try the onboarding flow to create your first user');
console.log('4. Check the Supabase dashboard to see data being created');

console.log('\n💡 Pro Tips:');
console.log('=============\n');
console.log('- Use the Supabase dashboard to monitor your database');
console.log('- Check the logs for any RLS policy issues');
console.log('- The database.ts service handles all database operations');
console.log('- All tables have proper indexes for performance');

console.log('\n✨ Happy coding with RE-Novate! ✨\n');

// Check if package.json has the required dependencies
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['@supabase/supabase-js', '@supabase/ssr'];
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length > 0) {
    console.log('⚠️  Missing dependencies:');
    missingDeps.forEach(dep => {
      console.log(`   pnpm add ${dep}`);
    });
    console.log('');
  }
}
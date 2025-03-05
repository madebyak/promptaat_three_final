#!/usr/bin/env node

/**
 * Test Production Build Script
 * 
 * This script helps test a production build locally before deploying to Vercel.
 * It builds the project in production mode and starts the server.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t, cyan: (t) => t };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(chalk.blue('🏗️ Preparing to test production build locally'));
console.log(chalk.yellow('This will:'));
console.log('1. Generate Prisma client');
console.log('2. Build the Next.js application in production mode');
console.log('3. Start the production server locally');
console.log(chalk.yellow('\nNote: This is meant to simulate a Vercel production environment as closely as possible.'));

rl.question(chalk.cyan('\nDo you want to proceed? (y/n) '), (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log(chalk.blue('\n🚀 Starting production build process...'));
    
    try {
      // Step 1: Generate Prisma client
      console.log(chalk.blue('\n📦 Generating Prisma client...'));
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Step 2: Build the Next.js application
      console.log(chalk.blue('\n🔨 Building Next.js application...'));
      execSync('next build', { stdio: 'inherit' });
      
      // Step 3: Start the production server
      console.log(chalk.green('\n✅ Build completed successfully!'));
      console.log(chalk.blue('\n🌐 Starting production server...'));
      console.log(chalk.yellow('The server will start on http://localhost:3000'));
      console.log(chalk.yellow('Press Ctrl+C to stop the server when done testing.'));
      
      execSync('next start', { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('\n❌ Error during production build process:'));
      console.error(error.message);
      process.exit(1);
    }
  } else {
    console.log(chalk.yellow('\nProduction build test cancelled.'));
    process.exit(0);
  }
  
  rl.close();
});

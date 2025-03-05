#!/usr/bin/env node

/**
 * Pre-deployment check script for Promptaat
 * 
 * This script runs a series of checks to ensure the codebase is ready for deployment.
 * It checks for common issues that might cause deployment failures on Vercel.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const APP_DIR = path.join(SRC_DIR, 'app');
const LIB_DIR = path.join(SRC_DIR, 'lib');

console.log(chalk.blue('🔍 Running pre-deployment checks for Promptaat...'));

// Check for TypeScript errors
function checkTypeScript() {
  console.log(chalk.blue('\n📝 Checking TypeScript types...'));
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log(chalk.green('✅ TypeScript check passed!'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ TypeScript errors found:'));
    console.log(error.stdout.toString());
    return false;
  }
}

// Check for ESLint errors
function checkESLint() {
  console.log(chalk.blue('\n🧹 Checking ESLint rules...'));
  try {
    execSync('npx next lint', { stdio: 'pipe' });
    console.log(chalk.green('✅ ESLint check passed!'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ ESLint errors found:'));
    console.log(error.stdout.toString());
    return false;
  }
}

// Check for missing Link imports
function checkLinkImports() {
  console.log(chalk.blue('\n🔗 Checking for proper Link imports...'));
  let issues = 0;

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file uses Link component but doesn't import it
        if (content.includes('<Link') && !content.includes("from 'next/link'") && !content.includes('from "next/link"')) {
          console.log(chalk.red(`❌ Missing Link import in: ${filePath}`));
          issues++;
        }
      }
    }
  }

  try {
    scanDirectory(COMPONENTS_DIR);
    scanDirectory(APP_DIR);
    
    if (issues === 0) {
      console.log(chalk.green('✅ All Link components have proper imports!'));
      return true;
    }
    return false;
  } catch (error) {
    console.log(chalk.red(`❌ Error checking Link imports: ${error.message}`));
    return false;
  }
}

// Check for mixed exports (both default and named exports)
function checkMixedExports() {
  console.log(chalk.blue('\n📦 Checking for mixed exports...'));
  let issues = 0;

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts'))) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for mixed exports
        const hasDefaultExport = content.includes('export default');
        const hasNamedExport = /export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g.test(content);
        const hasNamedExportBrackets = /export\s+\{\s*(\w+)(?:\s+as\s+\w+)?\s*(?:,\s*\w+(?:\s+as\s+\w+)?\s*)*\}/g.test(content);
        
        if (hasDefaultExport && (hasNamedExport || hasNamedExportBrackets)) {
          // Check if it's a legitimate case (e.g., exporting a component both ways)
          const componentName = file.replace(/\.(tsx|jsx|ts)$/, '');
          const reExportPattern = new RegExp(`export\\s+\\{\\s*${componentName}\\s*\\}`);
          
          if (!reExportPattern.test(content)) {
            console.log(chalk.yellow(`⚠️ Mixed exports in: ${filePath}`));
            issues++;
          }
        }
      }
    }
  }

  try {
    scanDirectory(COMPONENTS_DIR);
    scanDirectory(LIB_DIR);
    
    if (issues === 0) {
      console.log(chalk.green('✅ No problematic mixed exports found!'));
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ Found ${issues} files with potentially problematic mixed exports.`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error checking mixed exports: ${error.message}`));
    return false;
  }
}

// Run a test build
function runTestBuild() {
  console.log(chalk.blue('\n🏗️ Running a test build...'));
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('✅ Build successful!'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Build failed!'));
    return false;
  }
}

// Main function
async function main() {
  const results = {
    typescript: checkTypeScript(),
    eslint: checkESLint(),
    linkImports: checkLinkImports(),
    mixedExports: checkMixedExports(),
  };
  
  console.log(chalk.blue('\n📊 Pre-deployment check summary:'));
  for (const [check, passed] of Object.entries(results)) {
    console.log(`${passed ? chalk.green('✅') : chalk.red('❌')} ${check}`);
  }
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log(chalk.green('\n🚀 All checks passed! Ready for deployment.'));
    console.log(chalk.blue('Next steps:'));
    console.log('1. Run `npm run vercel:local` to test in a production-like environment');
    console.log('2. Complete the pre-deployment checklist in pre-deployment-checklist.md');
  } else {
    console.log(chalk.red('\n⚠️ Some checks failed. Please fix the issues before deploying.'));
    console.log(chalk.blue('Recommendation:'));
    console.log('1. Fix the reported issues');
    console.log('2. Run this script again to verify all issues are resolved');
    console.log('3. Complete the pre-deployment checklist before pushing to GitHub');
  }
}

main().catch(error => {
  console.error('Error running pre-deployment checks:', error);
  process.exit(1);
});

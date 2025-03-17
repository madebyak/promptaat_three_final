/**
 * Subscription Reconciliation Scheduler
 * 
 * This script schedules the subscription reconciliation job to run periodically.
 * It uses node-cron to schedule the job and can be run as a long-running process
 * or as a one-time job in a CI/CD pipeline.
 * 
 * Usage: node scripts/schedule-reconciliation.js [--once] [--fix] [--verbose]
 * Options:
 *   --once     Run once and exit (default: run on schedule)
 *   --fix      Apply fixes to the database (default: dry run only)
 *   --verbose  Show detailed logs
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import required dependencies
import cron from 'node-cron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const runOnce = args.includes('--once');
const shouldFix = args.includes('--fix');
const isVerbose = args.includes('--verbose');

// Build the command to run the reconciliation script
const scriptPath = path.join(__dirname, 'reconcile-subscriptions.js');
let command = `node ${scriptPath}`;

if (shouldFix) {
  command += ' --fix';
}

if (isVerbose) {
  command += ' --verbose';
}

// Helper function for logging
function log(message, data = null, level = 'info') {
  const timestamp = new Date().toISOString();
  
  if (level === 'info' && !isVerbose && data) {
    console.log(`[${timestamp}] ${message}`);
    return;
  }
  
  if (level === 'verbose' && !isVerbose) {
    return;
  }
  
  if (data) {
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Run the reconciliation script
 */
function runReconciliation() {
  log('Running subscription reconciliation job...');
  
  spawn(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      log('Error running reconciliation job', error, 'error');
      return;
    }
    
    if (stderr) {
      log('Reconciliation job stderr', stderr, 'error');
    }
    
    log('Reconciliation job completed', null, 'verbose');
    
    if (isVerbose) {
      log('Reconciliation job output', stdout.toString(), 'verbose');
    } else {
      // Print a summary of the output
      const lines = stdout.toString().split('\n');
      const summaryLines = lines.filter(line => 
        !line.includes('[VERBOSE]') && line.trim() !== ''
      );
      
      if (summaryLines.length > 0) {
        console.log(summaryLines.join('\n'));
      }
    }
  });
}

// If running once, run the job and exit
if (runOnce) {
  log('Running reconciliation job once and exiting');
  runReconciliation();
} else {
  // Schedule the job to run daily at 3:00 AM
  // This can be adjusted based on your needs
  log('Scheduling reconciliation job to run daily at 3:00 AM');
  cron.schedule('0 3 * * *', () => {
    log('Running scheduled reconciliation job');
    runReconciliation();
  });
  
  log('Scheduler started. Press Ctrl+C to exit.');
}

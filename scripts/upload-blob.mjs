#!/usr/bin/env node
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const VIDEO_PATH = path.join(__dirname, '../public/web-login-02.webm');
const FILE_NAME = 'web-login-02.webm';

async function uploadToBlobStorage() {
  try {
    console.log('Reading video file...');
    const fileBuffer = fs.readFileSync(VIDEO_PATH);
    
    console.log('Uploading to Vercel Blob...');
    const blob = await put(FILE_NAME, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('✅ Video uploaded successfully to Vercel Blob!');
    console.log('URL:', blob.url);
    
    // Save the URL to a file for reference
    fs.writeFileSync(
      path.join(__dirname, '../.blob-url.json'), 
      JSON.stringify({ url: blob.url }, null, 2)
    );
    
    console.log('URL saved to .blob-url.json');
    console.log('\nUpdate your .env file with:');
    console.log(`NEXT_PUBLIC_AUTH_VIDEO_URL=${blob.url}`);
  } catch (error) {
    console.error('❌ Error uploading video:', error);
  }
}

uploadToBlobStorage();

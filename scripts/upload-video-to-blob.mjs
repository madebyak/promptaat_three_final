#!/usr/bin/env node
// Script to upload video to Vercel Blob
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const VIDEO_PATH = path.join(__dirname, '../public/web-login-02.webm');
const API_ENDPOINT = 'http://localhost:3000/api/upload?filename=web-login-02.webm';

async function uploadVideo() {
  try {
    console.log('Reading video file...');
    const videoBuffer = fs.readFileSync(VIDEO_PATH);
    
    console.log('Creating form data...');
    const form = new FormData();
    form.append('file', new Blob([videoBuffer]), 'web-login-02.webm');
    
    console.log('Uploading to Vercel Blob...');
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: form,
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Video uploaded successfully to Vercel Blob!');
      console.log('URL:', result.url);
      
      // Save the URL to a file for reference
      fs.writeFileSync(
        path.join(__dirname, '../.blob-url.json'), 
        JSON.stringify(result, null, 2)
      );
      
      console.log('URL saved to .blob-url.json');
      console.log('\nUpdate your video source in src/components/auth/auth-layout.tsx with this URL');
    } else {
      console.error('❌ Failed to upload video:', result.error);
    }
  } catch (error) {
    console.error('❌ Error uploading video:', error);
  }
}

uploadVideo();

import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'quality.spec.ts',workers:1,timeout:180000,
 reporter:'list',outputDir:'../../../../evidence/s04-playwright',
 use:{baseURL:'http://127.0.0.1:5454',browserName:'chromium',launchOptions:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'},trace:'off'}});

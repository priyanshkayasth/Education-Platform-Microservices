// tests/global-setup.ts
import { request } from '@playwright/test'; 

const testUsers = [
  { name: 'Test Chromium', email: 'test-chromium@example.com', password: 'Test@123456' },
  { name: 'Test Firefox',  email: 'test-firefox@example.com',  password: 'Test@123456' },
  { name: 'Test WebKit',   email: 'test-webkit@example.com',   password: 'Test@123456' },
  { name: 'Student Test',  email: 'student-flow-test1@example.com', password: 'Test@123456' }, 
  { name: 'Test Instructor', email: 'instructor-test@example.com', password: 'Test@123456' },


];

export default async function globalSetup() {
  const api = await request.newContext();

  for (const user of testUsers) {
    const res = await api.post('http://localhost:3000/api/auth/register', {
      data: user
    });
    console.log(`Setup [${user.email}]:`, res.status());
  }

  await api.dispose();
}
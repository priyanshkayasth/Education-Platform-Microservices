import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';
import router from '../routes/auth.routes';

let mongoServer: MongoMemoryServer;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', router);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth Routes Integration', () => {

  // ---------------------------
  // POST /auth/register
  // ---------------------------
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user).toBeDefined();
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com' }); // missing name and password

      expect(res.status).toBe(400);
    });

    it('should return 409 if user already exists', async () => {
      await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(409);
    });

    it('should be case insensitive for email', async () => {
      await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'TEST@TEST.COM', password: 'password123' });

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(409); // same email different case
    });
  });

  // ---------------------------
  // POST /auth/login
  // ---------------------------
  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@test.com', password: 'password123' });
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user).toBeDefined();
    });

    it('should set access_token cookie on login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('access_token');
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com' }); // missing password

      expect(res.status).toBe(400);
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  // ---------------------------
  // POST /auth/logout
  // ---------------------------
  describe('POST /auth/logout', () => {
    it('should logout and clear cookie', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
      expect(res.headers['set-cookie'][0]).toContain('access_token=;');
    });
  });

  // ---------------------------
  // POST /auth/oauth-login
  // ---------------------------
  describe('POST /auth/oauth-login', () => {
    it('should set cookie from oauth token', async () => {
      const res = await request(app)
        .post('/auth/oauth-login')
        .send({ token: 'mock-oauth-token' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('OAuth login success');
      expect(res.headers['set-cookie'][0]).toContain('access_token');
    });

    it('should return 400 if token is missing', async () => {
      const res = await request(app)
        .post('/auth/oauth-login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------
  // GET /auth/me
  // ---------------------------
  describe('GET /auth/me', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return user if authenticated', async () => {
      // Register and login first
      await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      const login = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      const cookie = login.headers['set-cookie'][0];

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from '../../src/courses/courses.module';

jest.setTimeout(30000);

describe('Course Service Integration', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(mongoServer.getUri()),
      CoursesModule
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});


 afterAll(async () => {
  await app.close();
  await mongoServer.stop();
});


  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  // ------------------------
  // Create Course (Instructor)
  // ------------------------
  it('should create course as instructor', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'Nest Course',
        description: 'Integration testing',
        lessons: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Nest Course');
  });

  // ------------------------
  // Student Cannot Create
  // ------------------------
  it('should reject student creating course', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', 'student1')
      .set('x-user-role', 'STUDENT')
      .send({
        title: 'Invalid',
        description: 'Should fail',
        lessons: [],
      });

    expect(res.status).toBe(403);
  });
});

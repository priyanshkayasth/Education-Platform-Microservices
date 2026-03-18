import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from '../../src/courses/courses.module';

jest.setTimeout(30000);

describe('Courses Integration Test', () => {
  let app!: INestApplication;
  let mongoServer!: MongoMemoryServer;
  let dbConnection: mongoose.Connection; // 

  beforeEach(async () => {
  if (!dbConnection) return; // skip if not connected yet
  const collections = dbConnection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});


  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create(); 


    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: process.env.MONGO_URI!, 
          }),
        }),
        CoursesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); 

    await app.init();
    dbConnection = moduleFixture.get(getConnectionToken()); 

    

  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongoServer) await mongoServer.stop();
  });

// afterEach(async () => {
//     const collections = dbConnection.collections; // 
//     for (const key in collections) {
//       await collections[key].deleteMany({});
//     }
  // });
  // ---------------------------
  // Create Course
  // ---------------------------
  it('should create course as instructor', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'NestJS Course',
        description: 'Integration testing',
        instructorId: '123',
        lessons: [],
      });


    expect(res.status).toBe(201);
    expect(res.body.title).toBe('NestJS Course');


  });

  // ---------------------------
  // Student cannot create
  // ---------------------------
  it('should reject student creating course', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', 'student1')
      .set('x-user-role', 'STUDENT')
      .send({
        title: 'Invalid Course',
        description: 'Should fail',
        instructorId: 'student1',
        lessons: [],
      });


    expect(res.status).toBe(403);


  });

  // ---------------------------
  // Get all courses
  // ---------------------------

  it('should return all courses', async () => {
    // Step 1: Create as draft
    const created = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'Course 1',
        description: 'Test',
        instructorId: '123',
        lessons: [],
      });

    // Step 2: Publish it (simulating button click)
    await request(app.getHttpServer())
      .patch(`/courses/${created.body._id}`)
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({ isPublished: true });

    // Step 3: Now it should appear in public listing
    const res = await request(app.getHttpServer()).get('/courses');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Course 1');
  });

  // ---------------------------
  // Get course by ID
  // ---------------------------
  it('should return course by id', async () => {
    const create = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'Course Detail',
        description: 'Testing',
        instructorId: '123',
        lessons: [],
      });


    const courseId = create.body._id;

    const res = await request(app.getHttpServer())
      .get(`/courses/${courseId}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Course Detail');


  });

  // ---------------------------
  // Update course
  // ---------------------------
  it('should update course title', async () => {
    const create = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'Old Title',
        description: 'Testing',
        instructorId: '123',
        lessons: [],
      });


    const courseId = create.body._id;

    const res = await request(app.getHttpServer())
      .patch(`/courses/${courseId}`)
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'New Title',
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');


  });

  // ---------------------------
  // Delete course
  // ---------------------------
  it('should delete course', async () => {
    const create = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        title: 'Delete Me',
        description: 'Testing',
        instructorId: '123',
        lessons: [],
      });


    const courseId = create.body._id;

    const res = await request(app.getHttpServer())
      .delete(`/courses/${courseId}`)
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR');

    expect(res.status).toBe(200);


  });

  // ---------------------------
  // Validation test
  // ---------------------------
  it('should fail when title is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({
        description: 'Invalid course',
        instructorId: '123',
        lessons: [],
      });


    expect(res.status).toBeGreaterThanOrEqual(400);


  });

  // ---------------------------
  // Course not found
  // ---------------------------
  it('should return 404 when course does not exist', async () => {
    const res = await request(app.getHttpServer())
      .get('/courses/64b000000000000000000000');


    expect(res.status).toBe(404);


  });

 it('should not return unpublished courses in findAll', async () => {
  await request(app.getHttpServer())
    .post('/courses')
    .set('x-user-id', '123')
    .set('x-user-role', 'INSTRUCTOR')
    .send({ title: 'Draft', description: 'Test', instructorId: '123', lessons: [] });

  const res = await request(app.getHttpServer()).get('/courses');
  console.log('courses returned:', res.body); 
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(0);
});

  it('should forbid updating another instructor course', async () => {
    const created = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({ title: 'Course', description: 'Test', instructorId: '123', lessons: [] });

    const res = await request(app.getHttpServer())
      .patch(`/courses/${created.body._id}`)
      .set('x-user-id', 'other-instructor')
      .set('x-user-role', 'INSTRUCTOR')
      .send({ title: 'Hacked' });

    expect(res.status).toBe(403);
  });

  it('should forbid deleting another instructor course', async () => {
    const created = await request(app.getHttpServer())
      .post('/courses')
      .set('x-user-id', '123')
      .set('x-user-role', 'INSTRUCTOR')
      .send({ title: 'Course', description: 'Test', instructorId: '123', lessons: [] });

    const res = await request(app.getHttpServer())
      .delete(`/courses/${created.body._id}`)
      .set('x-user-id', 'other-instructor')
      .set('x-user-role', 'INSTRUCTOR');

    expect(res.status).toBe(403);
  });

 it('should return courses by instructor', async () => {
  await request(app.getHttpServer())
    .post('/courses')
    .set('x-user-id', '123')
    .set('x-user-role', 'INSTRUCTOR')
    .send({ title: 'My Course', description: 'Test', instructorId: '123', lessons: [] });

  const res = await request(app.getHttpServer())
    .get('/courses/instructor')  // ← no ID in URL, uses x-user-id header
    .set('x-user-id', '123')
    .set('x-user-role', 'INSTRUCTOR');

  expect(res.status).toBe(200);
  expect(res.body.length).toBe(1);
});
});

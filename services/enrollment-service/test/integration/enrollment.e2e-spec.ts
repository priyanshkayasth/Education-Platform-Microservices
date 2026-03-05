import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { EnrollmentModule } from '../../src/modules/enrollment/enrollment.module';

jest.setTimeout(30000);

const COURSE_ID = '64b000000000000000000001';
const LESSON_ID = '64b000000000000000000002';
const ASSIGNMENT_ID = '64b000000000000000000003';

describe('Enrollment Integration Test', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let dbConnection: mongoose.Connection;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({ uri: mongoServer.getUri() }),
        }),
        EnrollmentModule,
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

  afterEach(async () => {
    const collections = dbConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  // ---------------------------
  // Enroll Student
  // ---------------------------
  it('should enroll a student in a course', async () => {
    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe('student1');
    expect(res.body.courseId).toBe(COURSE_ID);
  });

  it('should not enroll same student twice in same course', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    expect(res.status).toBe(409);
  });

  it('should return 400 if student ID is missing on enroll', async () => {
    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .send({ courseId: COURSE_ID });

    expect(res.status).toBe(400);
  });

  // ---------------------------
  // Get Enrollments
  // ---------------------------
  it('should return enrollments for a student', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .get('/enrollments/me')
      .set('x-user-id', 'student1');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].courseId).toBe(COURSE_ID);
  });

  it('should return empty array if student has no enrollments', async () => {
    const res = await request(app.getHttpServer())
      .get('/enrollments/me')
      .set('x-user-id', 'student-no-courses');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  // ---------------------------
  // Video Progress
  // ---------------------------
  it('should update video progress for enrolled student', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/video')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        watchedSeconds: 90,
        duration: 100,
        totalLessons: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.lessonsProgress[0].lessonId).toBe(LESSON_ID);
    expect(res.body.lessonsProgress[0].percentage).toBe(90);
  });

  it('should mark lesson as completed when watched >= 90%', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/video')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        watchedSeconds: 95,
        duration: 100,
        totalLessons: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.lessonsProgress[0].completed).toBe(true);
  });

  it('should update overall percentage after completing lessons', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/video')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        watchedSeconds: 95,
        duration: 100,
        totalLessons: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.overallPercentage).toBe(50);
  });

  it('should not decrease video progress if rewatched less', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    // Watch 80 seconds first
    await request(app.getHttpServer())
      .post('/enrollments/progress/video')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        watchedSeconds: 80,
        duration: 100,
        totalLessons: 2,
      });

    // Rewatch only 30 seconds
    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/video')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        watchedSeconds: 30,
        duration: 100,
        totalLessons: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.lessonsProgress[0].watchedSeconds).toBe(80);
  });

  it('should return 404 for video progress if not enrolled', async () => {
    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/video')
      .set('x-user-id', 'student-not-enrolled')
      .send({
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        watchedSeconds: 50,
        duration: 100,
        totalLessons: 2,
      });

    expect(res.status).toBe(404);
  });

  // ---------------------------
  // Assignment Progress
  // ---------------------------
  it('should update assignment progress for enrolled student', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/assignment')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: ASSIGNMENT_ID,
        totalLessons: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.lessonsProgress[0].submitted).toBe(true);
    expect(res.body.lessonsProgress[0].completed).toBe(true);
  });

  it('should update overall percentage after assignment submission', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('x-user-id', 'student1')
      .send({ courseId: COURSE_ID });

    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/assignment')
      .set('x-user-id', 'student1')
      .send({
        courseId: COURSE_ID,
        lessonId: ASSIGNMENT_ID,
        totalLessons: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.overallPercentage).toBe(25);
  });

  it('should return 404 for assignment progress if not enrolled', async () => {
    const res = await request(app.getHttpServer())
      .post('/enrollments/progress/assignment')
      .set('x-user-id', 'student-not-enrolled')
      .send({
        courseId: COURSE_ID,
        lessonId: ASSIGNMENT_ID,
        totalLessons: 2,
      });

    expect(res.status).toBe(404);
  });
});
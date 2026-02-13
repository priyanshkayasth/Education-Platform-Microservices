// import { Test } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import request from 'supertest';
// import { AppModule } from 'src/app.module';

// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//   let mongod: MongoMemoryServer;

//   beforeAll(async () => {
//     mongod = await MongoMemoryServer.create();
//     const mongoUri = mongod.getUri();

//     const moduleFixture = await Test.createTestingModule({
//       imports: [
//         MongooseModule.forRoot(mongoUri), 
//         AppModule,
//       ],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   }, 30000); 

//   afterAll(async () => {
//     await app.close();
//     await mongod.stop();
//   });

//   it('/ (GET)', async () => {
//     await request(app.getHttpServer())
//       .get('/')
//       .expect(200);
//   });
// });

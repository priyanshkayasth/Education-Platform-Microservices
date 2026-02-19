// import { Test, TestingModule } from '@nestjs/testing';
// import { CoursesController } from './courses.controller';
// import { CoursesService } from './courses.service';

// describe('CoursesController', () => {
//   let controller: CoursesController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [CoursesController],
//       providers: [CoursesService],
//     }).compile();

//     controller = module.get<CoursesController>(CoursesController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });


//


import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { BadRequestException } from '@nestjs/common';

describe('CoursesController (unit)', () => {
  let controller: CoursesController;
  let service: jest.Mocked<CoursesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByInstructor: jest.fn(),
            countCourses: jest.fn(),
            getRecentCourses: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CoursesController);
    service = module.get(CoursesService);
  });

  // ========================
  // CREATE
  // ========================
  describe('create', () => {
    it('throws if instructor id missing', async () => {
      const req = { headers: {} };

      await expect(
        controller.create({ title: 'NestJS' } as any, req as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('calls service.create with correct params', async () => {
      service.create.mockResolvedValue({ title: 'NestJS' } as any);

      const req = {
        headers: {
          'x-user-id': 'instructor123',
          'x-user-role': 'INSTRUCTOR',
        },
      };

      const result = await controller.create(
        { title: 'NestJS' } as any,
        req,
      );

      expect(service.create).toHaveBeenCalledWith(
        { title: 'NestJS' },
        'instructor123',
      );

      expect(result!.title).toBe('NestJS');
    });

    it('should throw ForbiddenException for non-instructor', async () => {
      const req = {
        headers: {
          'x-user-id': 'student123',
          'x-user-role': 'STUDENT', // 
        },
      };

      await expect(
        controller.create({ title: 'NestJS' } as any, req),
      ).rejects.toThrow('Only instructors or admins can create courses');
    });

    it('should allow ADMIN to create course', async () => {
      service.create.mockResolvedValue({ title: 'Admin Course' } as any);

      const req = {
        headers: {
          'x-user-id': 'admin123',
          'x-user-role': 'ADMIN',
        },
      };

      const result = await controller.create(
        { title: 'Admin Course' } as any,
        req as any,
      );

      expect(service.create).toHaveBeenCalledWith(
        { title: 'Admin Course' },
        'admin123',
      );

      expect(result.title).toBe('Admin Course');
    });



  });

  // ========================
  // FIND ALL
  // ========================
  it('findAll calls service.findAll', async () => {
    service.findAll.mockResolvedValue([{ title: 'Course' }] as any);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result.length).toBe(1);
  });

  // ========================
  // FIND BY INSTRUCTOR
  // ========================
  it('findByInstructor uses instructor header', async () => {
    service.findByInstructor.mockResolvedValue([{ title: 'Course' }] as any);

    const req = { headers: { 'x-user-id': 'inst1' } };

    const result = await controller.findByInstructor(req as any);

    expect(service.findByInstructor).toHaveBeenCalledWith('inst1');
    expect(result.length).toBe(1);
  });

  // ========================
  // ADMIN STATS
  // ========================
  it('getAdminStats returns stats object', async () => {
    service.countCourses.mockResolvedValue(10);
    service.getRecentCourses.mockResolvedValue([{ title: 'Recent' }] as any);

    const result = await controller.getAdminStats();

    expect(service.countCourses).toHaveBeenCalled();
    expect(service.getRecentCourses).toHaveBeenCalledWith(5);

    expect(result).toEqual({
      totalCourses: 10,
      recentCourses: [{ title: 'Recent' }],
    });
  });

  // ========================
  // UPDATE
  // ========================
  it('update calls service.update with id, dto and instructor', async () => {
    service.update.mockResolvedValue({ title: 'Updated' } as any);

    const req = { headers: { 'x-user-id': 'inst1' } };

    const result = await controller.update(
      '123',
      { title: 'Updated' } as any,
      req,
    );

    expect(service.update).toHaveBeenCalledWith(
      '123',
      { title: 'Updated' },
      'inst1',
    );
    expect(result.title).toBe('Updated');
  });

  it('update should pass undefined instructorId when header missing', async () => {
    service.update.mockResolvedValue({ title: 'Updated' } as any);

    const req = { headers: {} }; // no x-user-id

    const result = await controller.update(
      '123',
      { title: 'Updated' } as any,
      req as any,
    );

    expect(service.update).toHaveBeenCalledWith(
      '123',
      { title: 'Updated' },
      undefined, //  important
    );

    expect(result.title).toBe('Updated');
  });


  // ========================
  // REMOVE
  // ========================
  it('remove calls service.remove', async () => {
    const course = { _id: '123', title: 'NestJS' } as any;

    service.remove.mockResolvedValue(course);

    const req = { headers: { 'x-user-id': 'inst1' } };

    const result = await controller.remove('123', req as any);

    expect(service.remove).toHaveBeenCalledWith('123', 'inst1');
    expect(result).toBeDefined();
    expect(result!._id).toBe('123');
  });

  it('remove should pass undefined instructorId when header missing', async () => {
    service.remove.mockResolvedValue({ _id: '123' } as any);

    const req = { headers: {} }; // no x-user-id

    const result = await controller.remove('123', req as any);

    expect(service.remove).toHaveBeenCalledWith('123', undefined);
    expect(result._id).toBe('123');
  });

  //findOne

  it('should return a course by id', async () => {
    const course = { _id: 'courseId', title: 'NestJS Course' };

    jest.spyOn(service, 'findOne').mockResolvedValue(course as any);

    const result = await controller.findOne('courseId');

    expect(service.findOne).toHaveBeenCalledWith('courseId');
    expect(result).toEqual(course);
  });





  // /findOne → error case

  it('should throw when course not found', async () => {
    service.findOne.mockRejectedValue(new BadRequestException());

    await expect(controller.findOne('bad-id')).rejects.toThrow();
  });


  // 4. getRecentCourses endpoint test

  // it('should return recent courses from controller', async () => {
  //   service.getRecentCourses.mockResolvedValue([
  //     { title: 'Recent Course' },
  //   ] as any);

  //   const result = await controller.getRecentCourses(3);

  //   expect(service.getRecentCourses).toHaveBeenCalledWith(3);
  //   expect(result[0].title).toBe('Recent Course');
  // });





});

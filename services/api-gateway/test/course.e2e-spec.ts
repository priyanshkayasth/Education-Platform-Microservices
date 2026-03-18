// import request from "supertest";

// jest.setTimeout(30000);

// const BASE_URL = process.env.BASE_URL;

// if (!BASE_URL) {
//   throw new Error("BASE_URL is not defined");
// }

// describe("SYSTEM TEST - Course Flow", () => {
//   let instructorCookies: string[] | undefined;
//   let studentCookies: string[] | undefined;
//   let createdCourseId: string;

//   // ----------------------------------
//   // 1️⃣ Login Instructor
//   // ----------------------------------
//   it("should login instructor", async () => {
//     const res = await request(BASE_URL)
//       .post("/api/auth/login")
//       .send({
//         email: "jay@gmail.com",
//         password: "12345",
//       });

//     expect([200, 201]).toContain(res.status);

// instructorCookies = res.headers["set-cookie"] as unknown as string[];
//     expect(instructorCookies).toBeDefined();
//   });

//   // ----------------------------------
//   // 2️⃣ Create Course
//   // ----------------------------------
//   it("should create course", async () => {
//   const res = await request(BASE_URL)
//     .post("/api/courses")
//     .set("Cookie", instructorCookies!)
//     .send({
//       title: "System Test Course",
//       description: "Testing course creation",
//       lessons: [
//         {
//           title: "Introduction",
//           type: "video",
//           video: {
//             provider: "youtube",
//             videoId: "abc123",
//             duration: 300
//           },
//           summary: "Intro lesson",
//           order: 1
//         }
//       ]
//     });

//   console.log("Create response:", res.status, res.body);

//   expect(res.status).toBe(201);

//   createdCourseId = res.body._id;
//   expect(createdCourseId).toBeDefined();
// });


//   // ----------------------------------
//   // 3️⃣ Course Appears In List
//   // ----------------------------------
//  it("should fetch created course by id", async () => {
//   const res = await request(BASE_URL)
//     .get(`/api/courses/${createdCourseId}`)
//     .set("Cookie", instructorCookies!);

//   expect(res.status).toBe(200);
//   expect(res.body._id).toBe(createdCourseId);
// });

//   // ----------------------------------
//   // 4️⃣ Login Student
//   // ----------------------------------
//   it("should login student", async () => {
//     const res = await request(BASE_URL)
//       .post("/api/auth/login")
//       .send({
//         email: "priyanshkayastha0803@gmail.com",
//         password: "12345",
//       });

//     expect([200, 201]).toContain(res.status);

// studentCookies = res.headers["set-cookie"] as unknown as string[];
//     expect(studentCookies).toBeDefined();
//   });

//   // ----------------------------------
//   // 5️⃣ Student Cannot Create Course
//   // ----------------------------------
//   it("should reject student creating course", async () => {
//     const res = await request(BASE_URL)
//       .post("/api/courses")
//       .set("Cookie", studentCookies!)
//       .send({
//         title: "Unauthorized Course",
//         description: "Should fail",
//       });

//     expect(res.status).toBe(403);
//   });

//   // ----------------------------------
//   // 6️⃣ Unauthorized Rejected
//   // ----------------------------------
//   it("should reject without cookie", async () => {
//     const res = await request(BASE_URL)
//       .post("/api/courses")
//       .send({
//         title: "No Auth",
//         description: "Should fail",
//         price: 50,
//       });

//     expect(res.status).toBe(401);
//   });

//   // ----------------------------------
//   // 7️⃣ Cleanup
//   // ----------------------------------
//   it("should delete created course", async () => {
//     const res = await request(BASE_URL)
//       .delete(`/api/courses/${createdCourseId}`)
//       .set("Cookie", instructorCookies!);

//     expect([200, 204]).toContain(res.status);
//   });
// });


//


import request from "supertest";

jest.setTimeout(30000);

const BASE_URL = process.env.BASE_URL!;
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD!;

if (!BASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Missing required env variables");
}
 
describe("SYSTEM TEST - Course Flow With Admin Promotion", () => {
    let adminCookies: string[];
    let instructorCookies: string[];
    let studentCookies: string[];

    let instructorUserId: string;
    let createdCourseId: string;

    const unique = Date.now();
    const instructorEmail = `instructor${unique}@test.com`;
    const studentEmail = `student${unique}@test.com`;
    const password = "Password123!";

    // ----------------------------------
    // 1️⃣ Register Instructor (default STUDENT)
    // ----------------------------------
    it("should register instructor (default student)", async () => {
        const res = await request(BASE_URL)
            .post("/api/auth/register")
            .send({
                name: "Instructor Test",

                email: instructorEmail,
                password,
            });
        console.log("Register response:", res.status, res.body);

        expect([200, 201]).toContain(res.status);

        instructorUserId =res.body.user.user;
        
        expect(instructorUserId).toBeDefined();
    });

    // ----------------------------------
    // 2️⃣ Login Admin
    // ----------------------------------
    it("should login admin", async () => {
        const res = await request(BASE_URL)
            .post("/api/auth/login")
            .send({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            });

        expect([200, 201]).toContain(res.status);

        adminCookies = res.headers["set-cookie"] as unknown as string[];
        expect(adminCookies).toBeDefined();
    });

    // ----------------------------------
    // 3️⃣ Promote Instructor
    // ----------------------------------
    it("should promote user to instructor", async () => {
        const res = await request(BASE_URL)
            .patch(`/api/admin/users/${instructorUserId}/role`)
            .set("Cookie", adminCookies)
            .send({
                role: "INSTRUCTOR",
            });

        expect([200, 204]).toContain(res.status);
    });


    // ----------------------------------
    // 4️⃣ Login Instructor
    // ----------------------------------
    it("should login instructor after promotion", async () => {
        const res = await request(BASE_URL)
            .post("/api/auth/login")
            .send({
                email: instructorEmail,
                password,
            });

        expect([200, 201]).toContain(res.status);

        instructorCookies = res.headers["set-cookie"] as unknown as string[];
        expect(instructorCookies).toBeDefined();
    });

    // ----------------------------------
    // 5️⃣ Create Course
    // ----------------------------------
    it("should create course as instructor", async () => {
        const res = await request(BASE_URL)
            .post("/api/courses")
            .set("Cookie", instructorCookies)
            .send({
                title: "System Test Course",
                description: "Testing course creation",
                lessons: [
                    {
                        title: "Intro",
                        type: "video",
                        video: {
                            provider: "youtube",
                            videoId: "abc123",
                            duration: 300,
                        },
                        summary: "Intro lesson",
                        order: 1,
                    },
                ],
            });

        expect(res.status).toBe(201);

        createdCourseId = res.body._id;
        expect(createdCourseId).toBeDefined();
    });

    // ----------------------------------
    // 6️⃣ Register Student
    // ----------------------------------
    it("should register student", async () => {
        const res = await request(BASE_URL)
            .post("/api/auth/register")
            .send({
                name:"Jay",
                email: studentEmail,
                password,
            });

        expect([200, 201]).toContain(res.status);
    });

    // ----------------------------------
    // 7️⃣ Login Student
    // ----------------------------------
    it("should login student", async () => {
        const res = await request(BASE_URL)
            .post("/api/auth/login")
            .send({
                email: studentEmail,
                password,
            });

        expect([200, 201]).toContain(res.status);

        studentCookies = res.headers["set-cookie"] as unknown as string[];
        expect(studentCookies).toBeDefined();
    });

    // ----------------------------------
    // 8️⃣ Student Cannot Create Course
    // ----------------------------------
    it("should reject student creating course", async () => {
        const res = await request(BASE_URL)
            .post("/api/courses")
            .set("Cookie", studentCookies)
            .send({
                title: "Unauthorized",
                description: "Should fail",
                price: 50,
                lessons: [],
            });

        expect(res.status).toBe(403);
    });

    // ----------------------------------
    // 9️⃣ Delete Course
    // ----------------------------------
    it("should delete created course", async () => {
        const res = await request(BASE_URL)
            .delete(`/api/courses/${createdCourseId}`)
            .set("Cookie", instructorCookies);

        expect([200, 204]).toContain(res.status);
    });
});


/**
 * ✅ Authentication

Login

Cookies

Session handling

✅ Authorization

Role-based access

403 Forbidden for students

✅ CRUD

Create course

Delete course

✅ Admin Privileges

Promote role
 */
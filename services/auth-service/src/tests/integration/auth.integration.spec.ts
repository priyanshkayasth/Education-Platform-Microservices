import { jest } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

/* ---------- Only mock infrastructure ---------- */

jest.unstable_mockModule("../../config/passport.js", () => ({
  default: {
    use: jest.fn(),
    initialize: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    authenticate: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
  },
}));

jest.unstable_mockModule("../../config/db.js", () => ({
  default: jest.fn(), // prevent real DB connection
}));

/* ---------- Import app AFTER mocks ---------- */
const { default: app } = await import("../../app.js");

/* ---------- In-memory MongoDB ---------- */
let mongo: MongoMemoryServer;

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!); // ← real integration DB
});

// afterEach(async () => {
//   // clean all collections between tests so they don't bleed into each other
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany({});
//   }
// });

afterAll(async () => {
  await mongoose.disconnect();
});

/* ================================================================== */
/*  POST /auth/register                                                */
/* ================================================================== */

describe("POST /auth/register", () => {
  it("returns 400 if name is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test", password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test", email: "test@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("returns 201 and creates user successfully", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test User", email: "test@test.com", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
    expect(res.body.user).toMatchObject({
      email: "test@test.com", // normalized to lowercase
    });
  });

 it("returns 201 and normalizes email to lowercase", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({ name: "Test User", email: "Upper@TEST.com", password: "123456" }); // ← different email

  expect(res.status).toBe(201);
  expect(res.body.user.email).toBe("upper@test.com");
});

  it("returns 409 if email already registered", async () => {
    // first registration
    await request(app)
      .post("/auth/register")
      .send({ name: "Test User", email: "test@test.com", password: "123456" });

    // duplicate
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test User", email: "test@test.com", password: "123456" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("User already exists with this email");
  });

  it("does not store plain text password", async () => {
    await request(app)
      .post("/auth/register")
      .send({ name: "Test User", email: "test@test.com", password: "123456" });

    const User = (await import("../../models/User.model.js")).default;
    const user = await User.findOne({ email: "test@test.com" });

    expect(user).not.toBeNull();
    expect(user!.password).not.toBe("123456");
    expect(user!.password).toMatch(/^\$2[ab]\$/); // bcrypt hash pattern
  });
});

/* ================================================================== */
/*  POST /auth/login                                                   */
/* ================================================================== */

describe("POST /auth/login", () => {
  // seed a user before login tests
  beforeEach(async () => {
    await request(app)
      .post("/auth/register")
      .send({ name: "Test User", email: "test@test.com", password: "123456" });
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("returns 401 if user not found", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@test.com", password: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("returns 401 if password is wrong", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("returns 200, sets cookie and returns user on success", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user).toMatchObject({
      email: "test@test.com",
      name: "Test User",
      role: "student",
    });

    // verify httpOnly cookie is set
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/access_token=/);
    expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/);
  });

  it("returns 200 with email in any case (normalization)", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "TEST@TEST.COM", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@test.com");
  });
});
import { jest } from '@jest/globals';

const findOneMock  = jest.fn() as jest.MockedFunction<(query: object) => Promise<unknown>>;
const compareMock  = jest.fn() as jest.MockedFunction<() => Promise<boolean>>;
const signMock     = jest.fn() as jest.MockedFunction<() => string>;

jest.unstable_mockModule("../../models/User.model", () => ({
  default: { findOne: findOneMock },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: { compare: compareMock },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: signMock },
}));

// jwt config doesn't need mocking — just needs to export valid values
jest.unstable_mockModule("../../config/jwt", () => ({
  JWT_SECRET: "test_secret",
  JWT_SIGN_OPTIONS: { expiresIn: "1h" },
}));

const { loginUser } = await import("../../services/auth.service.js");

const mockUser = {
  _id: { toString: () => "user123" },
  name: "Test User",
  email: "test@test.com",
  password: "hashedPassword",
  role: "student",
};

describe("loginUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws 401 if user not found", async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      loginUser("notfound@test.com", "password")
    ).rejects.toMatchObject({ message: "Invalid email or password", statusCode: 401 });
  });

  it("throws 401 if password does not match", async () => {
    findOneMock.mockResolvedValue(mockUser);
    compareMock.mockResolvedValue(false);

    await expect(
      loginUser("test@test.com", "wrongpassword")
    ).rejects.toMatchObject({ message: "Invalid email or password", statusCode: 401 });
  });

  it("normalizes email before querying", async () => {
    findOneMock.mockResolvedValue(null);

    await expect(loginUser("Test@TEST.com", "pass")).rejects.toThrow();

    expect(findOneMock).toHaveBeenCalledWith({ email: "test@test.com" }); // lowercased + trimmed
  });

  it("returns token and user on success", async () => {
    findOneMock.mockResolvedValue(mockUser);
    compareMock.mockResolvedValue(true);
    signMock.mockReturnValue("jwt_token");

    const result = await loginUser("Test@test.com", "123456");

    expect(signMock).toHaveBeenCalledWith(
      { userId: "user123", role: "student", email: "test@test.com" },
      "test_secret",
      { expiresIn: "1h" }
    );
    expect(result).toEqual({
      token: "jwt_token",
      user: { id: "user123", name: "Test User", email: "test@test.com", role: "student" },
    });
  });
});
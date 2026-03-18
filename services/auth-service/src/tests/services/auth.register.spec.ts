import { jest } from '@jest/globals';

// Type mock functions explicitly to avoid 'never' inference
const findOneMock = jest.fn<() => Promise<unknown>>() as jest.MockedFunction<(query: object) => Promise<unknown>>;
const createMock   = jest.fn<() => Promise<unknown>>() as jest.MockedFunction<(data: object) => Promise<unknown>>;
const hashMock     = jest.fn<() => Promise<string>>()  as jest.MockedFunction<() => Promise<string>>;

jest.unstable_mockModule("../../models/User.model", () => ({
  default: {
    findOne: findOneMock,
    create:  createMock,
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: hashMock,
  },
}));

// Top-level await requires isolatedModules: true (now set in tsconfig)
const { default: registerUser } = await import("../../services/auth.service.js");

describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers user successfully", async () => {
    findOneMock.mockResolvedValue(null);
    hashMock.mockResolvedValue("hashedPassword");
    createMock.mockResolvedValue({ _id: "user123", email: "test@test.com" });

    const result = await registerUser({
      name: "TEST",
      email: "Test@test.com",
      password: "123456",
    });

    expect(findOneMock).toHaveBeenCalledWith({ email: "Test@test.com" });
    expect(createMock).toHaveBeenCalled();
    expect(result.email).toBe("test@test.com");
  });
});
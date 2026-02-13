import { jest } from '@jest/globals';

// 🔥 DEFINE MOCK FUNCTIONS FIRST
const findOneMock = jest.fn();
const createMock = jest.fn();

// 🔥 MOCK MODULE
jest.mock("../../models/User.model", () => ({
  __esModule: true,
  default: {
    findOne: findOneMock,
    create: createMock,
  },
}));

jest.mock("bcryptjs", () => ({
  default: {
    hash: jest.fn(),
  },
}));

import bcrypt from "bcryptjs";
import registerUser from "../../services/auth.service";

describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers user successfully", async () => {
    findOneMock.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    createMock.mockResolvedValue({
      _id: "user123",
      email: "test@test.com",
    });

    const result = await registerUser({
      name: "TEST",
      email: "Test@test.com",
      password: "123456",
    });

    expect(findOneMock).toHaveBeenCalledWith({
      email: "Test@test.com",
    });

    expect(createMock).toHaveBeenCalled();
    expect(result.email).toBe("test@test.com");
  });
});

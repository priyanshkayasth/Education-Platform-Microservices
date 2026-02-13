import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

//  mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

//  mock auth service
vi.mock("../../services/auth.service", () => ({
  authService: {
    login: vi.fn(),
  },
}));

//  mock auth context
const mockRefetchUser = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    refetchUser: mockRefetchUser,
  }),
}));

//    import mocked service
import { authService } from "../../services/auth.service";
import toast from "react-hot-toast";

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Login Page", () => {
  it("logs in successfully with valid credentials", async () => {
    (authService.login as any).mockResolvedValueOnce({});

    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText(/john@example.com/i),
      "test@test.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      "password123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(authService.login).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
    });

    expect(mockRefetchUser).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Login successful");
  });

  it("shows error if fields are empty", async () => {
    renderLogin();

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "All fields are required"
    );

    expect(authService.login).not.toHaveBeenCalled();
  });

  it("shows API error message on invalid credentials", async () => {
    (authService.login as any).mockRejectedValueOnce({
      response: {
        data: {
          message: "Invalid email or password",
        },
      },
      isAxiosError: true,
    });

    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText(/john@example.com/i),
      "wrong@test.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      "wrongpassword"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Invalid email or password"
    );
  });

  it("disables button while loading", async () => {
    (authService.login as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText(/john@example.com/i),
      "test@test.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      "password"
    );

    const button = screen.getByRole("button", { name: /login/i });
    await userEvent.click(button);

    expect(button).toBeDisabled();
  });
});

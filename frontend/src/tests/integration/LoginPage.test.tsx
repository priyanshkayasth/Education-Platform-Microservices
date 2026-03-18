import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// mock auth service
vi.mock("../../services/auth.service", () => ({
  authService: {
    login: vi.fn(),
  },
}));

// mock navigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock auth context

const mockRefetchUser = vi.fn();

let mockUser: any = null;
let mockLoading = false;

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    refetchUser: mockRefetchUser,
    user: mockUser,
    loading: mockLoading,
  }),
}));

import { authService } from "../../services/auth.service";
import toast from "react-hot-toast";
import Login from "../../pages/auth/Login";

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
  mockLoading = false;
});

describe("Login Page Integration", () => {

  it("renders login form", () => {
    renderLogin();

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/john@example.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/••••••••/i)
    ).toBeInTheDocument();
  });

  it("logs in successfully with valid credentials", async () => {
    (authService.login as any).mockResolvedValueOnce({
      user: { id: 1 },
    });

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
      screen.getByRole("button", { name: /^login$/i })
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
      screen.getByRole("button", { name: /^login$/i })
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
      screen.getByRole("button", { name: /^login$/i })
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

    const button = screen.getByRole("button", { name: /^login$/i });

    await userEvent.click(button);

    expect(button).toBeDisabled();
  });

  it("redirects if user already logged in", () => {
  mockUser = { id: 1 };

  renderLogin();

  expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
});

  it("redirects to Google OAuth when clicking Google login", async () => {
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    renderLogin();

    await userEvent.click(
      screen.getByRole("button", { name: /login with google/i })
    );

    expect(window.location.href).toContain("/auth/google");
  });
});
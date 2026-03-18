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
    register: vi.fn(),
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

import toast from "react-hot-toast";
import { authService } from "../../services/auth.service";
import Register from "../../pages/auth/Register";

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Register Page Integration", () => {

  it("renders register form", () => {
    renderRegister();

    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it("registers successfully with valid credentials", async () => {
    (authService.register as any).mockResolvedValueOnce({});

    renderRegister();

    await userEvent.type(
      screen.getByPlaceholderText(/john doe/i),
      "John Doe"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/john@example.com/i),
      "john@test.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      "password123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /register/i })
    );

    expect(authService.register).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@test.com",
      password: "password123",
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Registration Successfull"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows error if fields are empty", async () => {
    renderRegister();

    await userEvent.click(
      screen.getByRole("button", { name: /register/i })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "All fields are required"
    );

    expect(authService.register).not.toHaveBeenCalled();
  });

  it("shows API error message when registration fails", async () => {
    (authService.register as any).mockRejectedValueOnce({
      response: {
        data: {
          message: "Email already exists",
        },
      },
      isAxiosError: true,
    });

    renderRegister();

    await userEvent.type(
      screen.getByPlaceholderText(/john doe/i),
      "John Doe"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/john@example.com/i),
      "john@test.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      "password123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /register/i })
    );

    expect(toast.error).toHaveBeenCalledWith("Email already exists");
  });

  it("disables register button while loading", async () => {
    (authService.register as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderRegister();

    await userEvent.type(
      screen.getByPlaceholderText(/john doe/i),
      "John Doe"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/john@example.com/i),
      "john@test.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      "password123"
    );

    const button = screen.getByRole("button", { name: /register/i });

    await userEvent.click(button);

    expect(button).toBeDisabled();
  });

});
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AuthProvider, { useAuth } from "./AuthContext";
import api from "../api/axios";
import { MemoryRouter } from "react-router-dom";

//  Mock axios instance

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),

  },
}));


//  Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});



//  Test consumer component
const TestComponent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user</div>;

  return <div>User role: {user.role}</div>;
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });



  it("fetches and sets user on mount (success)", async () => {
    // Arrange: mock API response
    (api.get as any).mockResolvedValueOnce({
      data: {
        user: {
          id: "1",
          name: "Test User",
          role: "student",
        },
      },
    });

    // Act: render provider
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Assert: loading shown first
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Assert: user appears after fetch
    await waitFor(() => {
      expect(
        screen.getByText("User role: student")
      ).toBeInTheDocument();
    });

    // Assert: API called correctly
    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("logs out user and clears state + navigates to login", async () => {
    // Arrange: mock API logout success
    (api.post as any).mockResolvedValueOnce({});

    // put token in storage
    localStorage.setItem("access_token", "fake-token");

    // helper component to trigger logout
    const LogoutComponent = () => {
      const { logout } = useAuth();

      return <button onClick={logout}>Logout</button>;
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <LogoutComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Act
    screen.getByText("Logout").click();

    // Assert
    await waitFor(() => {
      // API called
      expect(api.post).toHaveBeenCalledWith("/auth/logout");

      // token removed
      expect(localStorage.getItem("access_token")).toBeNull();

      // navigation happened
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    // suppress React error boundary logs in test output
    const spy = vi.spyOn(console, "error").mockImplementation(() => { });

    const BadComponent = () => {
      useAuth(); //  used outside provider
      return <div>Bad</div>;
    };

    expect(() => render(<BadComponent />)).toThrow(
      "useAuth must be used inside AuthProvider"
    );

    spy.mockRestore();
  });

});

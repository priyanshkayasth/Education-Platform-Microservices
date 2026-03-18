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
});

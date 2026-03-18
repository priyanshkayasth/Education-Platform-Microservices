import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

//  Mock useAuth
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext";
import RoleRoute from "./RoleBasedRoutes";

//  Helper to render with routes
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={ui}
        />
        <Route
          path="/unauthorized"
          element={<div>Unauthorized Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("RoleRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while auth is loading", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: true,
    });

    renderWithRouter(
      <RoleRoute allowedRoles={["admin"]}>
        <div>Protected Content</div>
      </RoleRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /login if user is not logged in", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
    });

    renderWithRouter(
      <RoleRoute allowedRoles={["admin"]}>
        <div>Protected Content</div>
      </RoleRoute>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to /unauthorized if user role is not allowed", () => {
    (useAuth as any).mockReturnValue({
      user: { id: "1", name: "Test", role: "student" },
      loading: false,
    });

    renderWithRouter(
      <RoleRoute allowedRoles={["admin"]}>
        <div>Protected Content</div>
      </RoleRoute>
    );

    expect(
      screen.getByText("Unauthorized Page")
    ).toBeInTheDocument();
  });

  it("renders children if user role is allowed", () => {
    (useAuth as any).mockReturnValue({
      user: { id: "1", name: "Test", role: "admin" },
      loading: false,
    });

    renderWithRouter(
      <RoleRoute allowedRoles={["admin"]}>
        <div>Protected Content</div>
      </RoleRoute>
    );

    expect(
      screen.getByText("Protected Content")
    ).toBeInTheDocument();
  });
});

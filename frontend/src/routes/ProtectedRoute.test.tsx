import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";

//  mock auth context
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoutes";

const renderWithRouter = (authState: {
  user: any;
  loading: boolean;
}) => {
  (useAuth as any).mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<ProtectedRoute/>}>
          <Route
            path="/dashboard"
            element={<div>Dashboard Page</div>}
          />
        </Route>

        <Route
          path="/login"
          element={<div>Login Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  it("shows loading state while auth is loading", () => {
    renderWithRouter({
      user: null,
      loading: true,
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("redirects to login if user is not authenticated", async () => {
    renderWithRouter({
      user: null,
      loading: false,
    });

    expect(
      await screen.findByText(/login page/i)
    ).toBeInTheDocument();
  });

  it("renders protected content if user is authenticated", () => {
    renderWithRouter({
      user: {
        id: "1",
        name: "John",
        role: "student",
      },
      loading: false,
    });

    expect(
      screen.getByText(/dashboard page/i)
    ).toBeInTheDocument();
  });
});

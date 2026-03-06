import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Navbar from "../../components/common/NavBar";
import { notificationService } from "../../services/notification.service";

/* -----------------------
Mock lucide icons
----------------------- */

vi.mock("lucide-react", () => ({
    PlusCircle: () => <span>icon</span>,
    Menu: () => <span>menu</span>,
    Sun: () => <span>sun</span>,
    Moon: () => <span>moon</span>,
}));

/* -----------------------
Mock ThemeToggle
----------------------- */

vi.mock("../../components/common/ThemeToggle", () => ({
    default: () => <div>ThemeToggle</div>,
}));

/* -----------------------
Mock Notification Service
----------------------- */

vi.mock("../../services/notification.service", () => ({
    notificationService: {
        success: vi.fn(),
    },
}));

/* -----------------------
Mock Auth Context
----------------------- */

let mockUser: any = null;
let mockLoading = false;
const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock("../../context/AuthContext", () => ({
    useAuth: () => ({
        user: mockUser,
        loading: mockLoading,
        logout: mockLogout,
    }),
}));

/* -----------------------
Helper
----------------------- */

const renderNavbar = () =>
    render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockLoading = false;
});

/* -----------------------
Tests
----------------------- */

describe("Navbar Integration", () => {

    it("renders navbar brand and courses link", () => {
        renderNavbar();

        expect(screen.getByText(/eduplatform/i)).toBeInTheDocument();

        expect(screen.getAllByText(/courses/i).length).toBeGreaterThan(0);
    });

    it("shows Add Course link for instructor", () => {
        mockUser = { role: "instructor" };

        renderNavbar();

        expect(screen.getAllByText(/add course/i).length).toBeGreaterThan(0);
    });

    it("does not show Add Course for student", () => {
        mockUser = { role: "student" };

        renderNavbar();

        expect(screen.queryByText(/add course/i)).not.toBeInTheDocument();
    });

    it("calls logout when logout button clicked", async () => {
        mockUser = { role: "student" };

        renderNavbar();

        await userEvent.click(
            screen.getByRole("button", { name: /logout/i })
        );

        expect(mockLogout).toHaveBeenCalled();
    });

    it("shows success notification after logout", async () => {
        mockUser = { role: "student" };

        renderNavbar();

        await userEvent.click(
            screen.getByRole("button", { name: /logout/i })
        );

        expect(mockLogout).toHaveBeenCalled();

        expect(notificationService.success).toHaveBeenCalledWith(
            "Logged out successfully"
        );
    });

    it("renders nothing while auth loading", () => {
        mockLoading = true;

        const { container } = renderNavbar();

        expect(container.firstChild).toBeNull();
    });

});
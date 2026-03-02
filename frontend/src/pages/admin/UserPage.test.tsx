import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminService } from "../../services/admin.service";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import UsersPage from "./UserPage";

//  mocks
vi.mock("../../services/admin.service", () => ({
    adminService: {
        getAllUsers: vi.fn(),
        changeUserRole: vi.fn(),
    },
}));

vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

describe("UsersPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    //  loading state
    it("shows loading spinner initially", () => {
        (adminService.getAllUsers as any).mockReturnValue(new Promise(() => { }));

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        expect(document.querySelector(".loading-spinner")).toBeInTheDocument();
    });

    // success fetch
    it("renders users list", async () => {
        (adminService.getAllUsers as any).mockResolvedValueOnce([
            {
                _id: "2",
                name: "John",
                email: "john@mail.com",
                role: "student",
            },
        ]);

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        expect(await screen.findByText("John")).toBeInTheDocument();
        expect(screen.getByText("student")).toBeInTheDocument();
    });

    //  empty state
    it("shows empty message when no users", async () => {
        (adminService.getAllUsers as any).mockResolvedValueOnce([]);

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        expect(await screen.findByText("No users found")).toBeInTheDocument();
    });

    //  fetch error
    it("shows toast when fetch fails", async () => {
        (adminService.getAllUsers as any).mockRejectedValueOnce(new Error("fail"));

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to load users");
        });
    });

    // change role success
    it("changes user role successfully", async () => {
        (adminService.getAllUsers as any).mockResolvedValueOnce([
            {
                _id: "2",
                name: "John",
                email: "john@mail.com",
                role: "student",
            },
        ]);

        (adminService.changeUserRole as any).mockResolvedValueOnce({});

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        const select = await screen.findByRole("combobox");
        fireEvent.change(select, { target: { value: "instructor" } });

        await waitFor(() => {
            expect(adminService.changeUserRole).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith(
                "Role updated. User must re-login."
            );
        });
    });

    //  change role error
    it("shows error toast if role update fails", async () => {
        (adminService.getAllUsers as any).mockResolvedValueOnce([
            {
                _id: "2",
                name: "John",
                email: "john@mail.com",
                role: "student",
            },
        ]);

        (adminService.changeUserRole as any).mockRejectedValueOnce(new Error("fail"));

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        const select = await screen.findByRole("combobox");

        fireEvent.change(select, { target: { value: "instructor" } });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to update role");
        });
    });

    //  disable select for self user
    it("disables role change for current user", async () => {
        (adminService.getAllUsers as any).mockResolvedValueOnce([
            {
                _id: "1",
                name: "Me",
                email: "me@mail.com",
                role: "admin",
            },
        ]);

        (useAuth as any).mockReturnValue({
            user: { id: "1", role: "admin" },
        });

        render(<UsersPage />);

        const select = await screen.findByRole("combobox");
        expect(select).toBeDisabled();
    });

    it("updates only the selected user and keeps others unchanged", async () => {
        (adminService.getAllUsers as any).mockResolvedValueOnce([
            {
                _id: "1",
                name: "User1",
                email: "u1@mail.com",
                role: "student",
            },
            {
                _id: "2",
                name: "User2",
                email: "u2@mail.com",
                role: "student",
            },
        ]);

        (adminService.changeUserRole as any).mockResolvedValueOnce({});

        (useAuth as any).mockReturnValue({
            user: { id: "admin", role: "admin" },
        });

        render(<UsersPage />);

        // wait for users to load
        const selects = await screen.findAllByRole("combobox");

        // change role for second user only
        fireEvent.change(selects[1], { target: { value: "instructor" } });

        await waitFor(() => {
            expect(adminService.changeUserRole).toHaveBeenCalled();
        });

        // ensure first user still shows "student"
        expect(screen.getAllByText("student")[0]).toBeInTheDocument();

        // ensure second user updated to "instructor"
        expect(screen.getByText("instructor")).toBeInTheDocument();
    });

    
});
import { vi } from "vitest";
import { fetchAdminDashboard } from "../../api/admin.api";
import { render, screen, waitFor } from "@testing-library/react";
import AdminHome from "./AdminHome";

vi.mock("../../api/admin.api", () => ({
    fetchAdminDashboard: vi.fn(),
}))

describe('Admin Home', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("shows loading spinner initially", () => {
        (fetchAdminDashboard as any).mockReturnValue(new Promise(() => { }))
        render(<AdminHome />)
        expect(document.querySelector('.loading-spinner')).toBeInTheDocument()

    })

    it("shows error message API fails", async () => {
        (fetchAdminDashboard as any).mockRejectedValueOnce(new Error("fail"))
        render(<AdminHome />)

        await waitFor(() => {
            expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument()
        })
    })

    it("renders dashboard data correctly", async () => {
        (fetchAdminDashboard as any).mockResolvedValueOnce({
            stats: {
                totalUsers: 100,
                students: 70,
                instructors: 20,
                courses: 10,
            },
            recentUsers: [
                {
                    name: "John",
                    role: "student",
                    createdAt: "2024-01-01",
                },
            ],
            recentCourses: [
                {
                    title: "React Course",
                    instructor: "Jane",
                },
            ],
        });

        render(<AdminHome />);

        await waitFor(() => {
            // header
            expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();

            // stats
            expect(screen.getByText("100")).toBeInTheDocument();
            expect(screen.getByText("70")).toBeInTheDocument();
            expect(screen.getByText("20")).toBeInTheDocument();
            expect(screen.getByText("10")).toBeInTheDocument();

            // recent user
            expect(screen.getByText("John")).toBeInTheDocument();
            expect(screen.getByText("student")).toBeInTheDocument();

            // recent course
            expect(screen.getByText("React Course")).toBeInTheDocument();
            expect(screen.getByText("Jane")).toBeInTheDocument();
        });
    });



    it("shows empty messages when no users or courses", async () => {
        (fetchAdminDashboard as any).mockResolvedValueOnce({
            stats: {
                totalUsers: 0,
                students: 0,
                instructors: 0,
                courses: 0
            },
            recentUsers: [],
            recentCourses: [],

        })
        render(<AdminHome />)
        await waitFor(() => {
            expect(screen.getByText("No recent users")).toBeInTheDocument();
            expect(screen.getByText("No recent courses")).toBeInTheDocument();
        })

    })


})
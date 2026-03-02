import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

/* ---------------- MOCKS FIRST ---------------- */

// correct paths (relative to test file)
vi.mock("../../components/common/NavBar", () => ({
    default: () => <div>Navbar</div>,
}));

vi.mock("../../components/common/Footer", () => ({
    Footer: () => <div>Footer</div>,
}));

vi.mock("react-router-dom", () => ({
    Link: ({ children }: any) => <a>{children}</a>,
}));

vi.mock("../../context/AuthContext", () => ({
    useAuth: () => ({
        user: { id: "user1" },
        isLoggingOut: false,
    }),
}));

vi.mock("../../services/course.service", () => ({
    courseService: {
        getCourses: vi.fn(),
    },
}));

vi.mock("../../services/enrollment.service", () => ({
    EnrollmentService: {
        getMyEnrollments: vi.fn(),
        doEnrollment: vi.fn(),
    },
}));

vi.mock("../../services/notification.service", () => ({
    notificationService: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

/*  IMPORT AFTER MOCKING */

import StudentDashboard from "../../pages/StudentDashboard";
import { courseService } from "../../services/course.service";
import { EnrollmentService } from "../../services/enrollment.service";
import { notificationService } from "../../services/notification.service";

/* typed mocks */
const mockedCourseService = vi.mocked(courseService);
const mockedEnrollmentService = vi.mocked(EnrollmentService);
const mockedNotification = vi.mocked(notificationService);

/* ---------------- TEST DATA ---------------- */

const mockCourses = [
    {
        _id: "c1",
        title: "React Course",
        description: "Learn React",
        lessons: [
            {
                _id: "l1",
                title: "Intro",
                type: "video",
                video: { provider: "youtube", videoId: "abc123" },
            },
        ],
    },
];


const mockCourseWithAssignment = [
    {
        _id: "c2",
        title: "JS Course",
        description: "JS",
        lessons: [
            {
                _id: "a1",
                title: "Assignment 1",
                type: "assignment",
                assignment: { instructions: "Do it" },
            },
        ],
    },
];

const mockAssignmentEnrollment = [
    {
        courseId: "c2",
        overallPercentage: 100,
        lessonsProgress: [
            { lessonId: "a1", percentage: 100, completed: true },
        ],
    },
];


const mockEnrollments = [
    {
        courseId: "c1",
        overallPercentage: 50,
        lessonsProgress: [{ lessonId: "l1", percentage: 50, completed: false }],
    },
];

/* ---------------- TEST SUITE ---------------- */

describe("StudentDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading initially", () => {
        mockedCourseService.getCourses.mockImplementation(() => new Promise(() => { }));
        mockedEnrollmentService.getMyEnrollments.mockImplementation(() => new Promise(() => { }));

        render(<StudentDashboard />);

        expect(screen.getByText(/loading courses/i)).toBeInTheDocument();
    });

    it("renders enrolled courses", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue(mockEnrollments);

        render(<StudentDashboard />);

        expect(await screen.findByText("React Course")).toBeInTheDocument();
        expect(screen.getByText(/course progress/i)).toBeInTheDocument();
    });

    it("shows empty enrolled state", async () => {
        mockedCourseService.getCourses.mockResolvedValue([]);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue([]);

        render(<StudentDashboard />);

        expect(await screen.findByText(/no enrolled courses yet/i)).toBeInTheDocument();
    });

    it("switches to browse tab", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue([]);

        render(<StudentDashboard />);

        // click browse tab
        fireEvent.click(
            await screen.findByRole("button", { name: /browse courses \(/i })
        );

        // now course should be visible
        expect(await screen.findByText("React Course")).toBeInTheDocument();
    });

    it("enrolls in course successfully", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue([]);
        mockedEnrollmentService.doEnrollment.mockResolvedValue({});

        render(<StudentDashboard />);

        //  switch to browse tab first
        fireEvent.click(
            await screen.findByRole("button", { name: /browse courses \(/i })
        );

        //  now click enroll
        fireEvent.click(
            await screen.findByRole("button", { name: /enroll to unlock/i })
        );

        await waitFor(() => {
            expect(mockedEnrollmentService.doEnrollment).toHaveBeenCalledWith("c1");
            expect(mockedNotification.success).toHaveBeenCalledWith("Enrolled successfully");
        });
    });

    it("shows info toast if already enrolled (409)", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue([]);
        mockedEnrollmentService.doEnrollment.mockRejectedValue({
            response: { status: 409 },
        });

        render(<StudentDashboard />);

        fireEvent.click(
            await screen.findByRole("button", { name: /browse courses \(/i })
        );

        fireEvent.click(
            await screen.findByRole("button", { name: /enroll to unlock/i })
        );

        await waitFor(() => {
            expect(mockedNotification.info).toHaveBeenCalledWith("You are already enrolled");
        });
    });

    it("shows error toast if enrollment fails", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue([]);
        mockedEnrollmentService.doEnrollment.mockRejectedValue(new Error());

        render(<StudentDashboard />);

        fireEvent.click(
            await screen.findByRole("button", { name: /browse courses \(/i })
        );

        fireEvent.click(
            await screen.findByRole("button", { name: /enroll to unlock/i })
        );

        await waitFor(() => {
            expect(mockedNotification.error).toHaveBeenCalledWith("Enrollment failed");
        });
    });

    it("shows error message if fetch fails", async () => {
        mockedCourseService.getCourses.mockRejectedValue(new Error());
        mockedEnrollmentService.getMyEnrollments.mockRejectedValue(new Error());

        render(<StudentDashboard />);

        expect(await screen.findByText(/failed to load courses/i)).toBeInTheDocument();
    });

    it("renders lesson link when enrolled", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue(mockEnrollments);

        render(<StudentDashboard />);

        expect(await screen.findByText("Intro")).toBeInTheDocument();
    });

    it("switches back to enrolled tab", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourses);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue(mockEnrollments);

        render(<StudentDashboard />);

        // switch to browse first
        fireEvent.click(
            await screen.findByRole("button", { name: /browse courses \(/i })
        );

        // now switch back to enrolled
        fireEvent.click(
            await screen.findByRole("button", { name: /my courses \(/i })
        );

        expect(await screen.findByText("React Course")).toBeInTheDocument();
    });


    it("renders completed assignment with completed badge", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourseWithAssignment);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue(mockAssignmentEnrollment);

        render(<StudentDashboard />);

        expect(await screen.findByText("Assignment 1")).toBeInTheDocument();
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });


    it("renders incomplete assignment with start button", async () => {
        mockedCourseService.getCourses.mockResolvedValue(mockCourseWithAssignment);
        mockedEnrollmentService.getMyEnrollments.mockResolvedValue([
            {
                courseId: "c2",
                overallPercentage: 0,
                lessonsProgress: [{ lessonId: "a1", percentage: 0, completed: false }],
            },
        ]);

        render(<StudentDashboard />);

        expect(await screen.findByText("Assignment 1")).toBeInTheDocument();
        expect(screen.getByText(/start →/i)).toBeInTheDocument();
    });

});
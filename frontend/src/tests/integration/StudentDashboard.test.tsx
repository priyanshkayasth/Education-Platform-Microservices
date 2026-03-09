import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "../../pages/StudentDashboard";

/* -----------------------
   Mocks
------------------------ */
vi.mock("../../components/common/NavBar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("../../components/common/Footer", () => ({
  Footer: () => <div>Footer</div>,
}));

const mockGetCourses = vi.fn();
const mockGetMyEnrollments = vi.fn();
const mockDoEnrollment = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockInfo = vi.fn();

vi.mock("../../services/course.service", () => ({
  courseService: { getCourses: () => mockGetCourses() },
}));

vi.mock("../../services/enrollment.service", () => ({
  EnrollmentService: {
    getMyEnrollments: () => mockGetMyEnrollments(),
    doEnrollment: (id: string) => mockDoEnrollment(id),
  },
}));

vi.mock("../../services/notification.service", () => ({
  notificationService: {
    success: (...args: any[]) => mockSuccess(...args),
    error: (...args: any[]) => mockError(...args),
    info: (...args: any[]) => mockInfo(...args),
  },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { role: "student", id: "student1" },
    isLoggingOut: false,
  }),
}));

/* -----------------------
   Mock Data
------------------------ */
const mockCourses = [
  {
    _id: "course1",
    title: "NestJS Course",
    description: "Learn NestJS",
    lessons: [
      {
        _id: "lesson1",
        title: "Intro Video",
        type: "video",
        video: { provider: "youtube", videoId: "abc123" },
      },
      {
        _id: "lesson2",
        title: "Assignment 1",
        type: "assignment",
        assignment: { instructions: "Do this" },
      },
    ],
  },
  {
    _id: "course2",
    title: "React Course",
    description: "Learn React",
    lessons: [],
  },
];

const mockEnrollments = [
  {
    courseId: "course1",
    overallPercentage: 50,
    lessonsProgress: [
      { lessonId: "lesson1", percentage: 50, completed: false },
    ],
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <StudentDashboard />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCourses.mockResolvedValue(mockCourses);
  mockGetMyEnrollments.mockResolvedValue(mockEnrollments);
});

/* -----------------------
   Tests
------------------------ */
describe("StudentDashboard Integration", () => {

  // ---------------------------
  // Loading & Display
  // ---------------------------
  it("shows loading state initially", () => {
    mockGetCourses.mockReturnValue(new Promise(() => {})); // never resolves
    renderDashboard();
    expect(screen.getByText(/loading courses/i)).toBeInTheDocument();
  });

  it("shows error if courses fail to load", async () => {
    mockGetCourses.mockRejectedValue(new Error("Network error"));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/failed to load courses/i)).toBeInTheDocument();
    });
  });

  it("displays enrolled and available courses after load", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("NestJS Course")).toBeInTheDocument();
    });
  });

  // ---------------------------
  // Tabs
  // ---------------------------
  it("shows enrolled courses tab by default", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/my courses/i)).toBeInTheDocument();
    });

    // NestJS is enrolled, React is not
    expect(screen.getByText("NestJS Course")).toBeInTheDocument();
    expect(screen.queryByText("React Course")).not.toBeInTheDocument();
  });

  it("switches to browse tab and shows available courses", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/browse courses/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /browse courses/i }));

    expect(screen.getByText("React Course")).toBeInTheDocument();
    expect(screen.queryByText("NestJS Course")).not.toBeInTheDocument();
  });

  // ---------------------------
  // Progress
  // ---------------------------
  it("shows course progress for enrolled course", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/course progress/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  // ---------------------------
  // Enroll
  // ---------------------------
  it("shows enroll button for non-enrolled course", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/browse courses/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /browse courses/i }));

    expect(
      screen.getByRole("button", { name: /enroll to unlock/i })
    ).toBeInTheDocument();
  });

  it("calls enroll and shows success notification", async () => {
    mockDoEnrollment.mockResolvedValue({});
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/browse courses/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /browse courses/i }));
    await userEvent.click(screen.getByRole("button", { name: /enroll to unlock/i }));

    await waitFor(() => {
      expect(mockDoEnrollment).toHaveBeenCalledWith("course2");
      expect(mockSuccess).toHaveBeenCalledWith("Enrolled successfully");
    });
  });

  it("shows info notification if already enrolled", async () => {
    mockDoEnrollment.mockRejectedValue({ response: { status: 409 } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/browse courses/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /browse courses/i }));
    await userEvent.click(screen.getByRole("button", { name: /enroll to unlock/i }));

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalledWith("You are already enrolled");
    });
  });

  it("shows error notification if enrollment fails", async () => {
    mockDoEnrollment.mockRejectedValue({ response: { status: 500 } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/browse courses/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /browse courses/i }));
    await userEvent.click(screen.getByRole("button", { name: /enroll to unlock/i }));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith("Enrollment failed");
    });
  });

  // ---------------------------
  // Enrolled State
  // ---------------------------
  it("shows enrolled button (disabled) for enrolled course", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /enrolled/i })
      ).toBeDisabled();
    });
  });

  // ---------------------------
  // Empty States
  // ---------------------------
  it("shows empty state when no enrolled courses", async () => {
    mockGetMyEnrollments.mockResolvedValue([]); // no enrollments
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/no enrolled courses yet/i)).toBeInTheDocument();
    });
  });
});
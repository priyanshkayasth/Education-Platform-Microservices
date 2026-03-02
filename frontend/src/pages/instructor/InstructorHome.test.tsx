import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import InstructorHome from "./InstructorHome";

// ---------------- MOCKS ----------------

// mock navigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

// mock toast

vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// mock course service
vi.mock("../../services/course.service", () => ({
    courseService: {
        getInstructorCourses: vi.fn(),
        updateCourse: vi.fn(),
        deleteCourse: vi.fn(),
    },
}));

// import mocked service AFTER vi.mock
import { courseService } from "../../services/course.service";

// create typed mock helper
const mockedCourseService = vi.mocked(courseService);

// ---------------- TEST DATA ----------------

const mockCourses = [
    {
        _id: "1",
        title: "React Course",
        description: "Learn React from scratch",
        isPublished: false,
    },
    {
        _id: "2",
        title: "Node Course",
        description: "Backend with Node",
        isPublished: true,
    },
];

// ---------------- TESTS ----------------

describe("InstructorHome", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading spinner initially", () => {
        // never resolve → stays loading
        mockedCourseService.getInstructorCourses.mockReturnValue(
            new Promise(() => { })
        );

        render(<InstructorHome />);

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders courses after fetch", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);

        render(<InstructorHome />);

        expect(await screen.findByText("React Course")).toBeInTheDocument();
        expect(screen.getByText("Node Course")).toBeInTheDocument();
    });

    it("shows empty state if no courses", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue([]);

        render(<InstructorHome />);

        expect(await screen.findByText(/no courses created/i)).toBeInTheDocument();
    });

    it("navigates to create course page", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue([]);

        render(<InstructorHome />);

        fireEvent.click(await screen.findByText("+ Create Course"));

        expect(mockNavigate).toHaveBeenCalledWith("/instructor/add-course");
    });

    it("navigates to edit course page", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);

        render(<InstructorHome />);

        const editButtons = await screen.findAllByText("Edit");
        fireEvent.click(editButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith("/instructor/edit-course/1");
    });

    it("toggles publish state", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);
        mockedCourseService.updateCourse.mockResolvedValue({});

        render(<InstructorHome />);

        fireEvent.click(await screen.findByText("Publish"));

        await waitFor(() => {
            expect(mockedCourseService.updateCourse).toHaveBeenCalledWith("1", {
                isPublished: true,
            });
        });
    });

    it("shows error toast if publish toggle fails", async () => {
        const toast = (await import("react-hot-toast")).default;

        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);
        mockedCourseService.updateCourse.mockRejectedValue(new Error("fail"));

        render(<InstructorHome />);

        fireEvent.click(await screen.findByText("Publish"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Failed to update publish status"
            );
        });
    });

    it("deletes a course after confirmation", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);
        mockedCourseService.deleteCourse.mockResolvedValue({});

        vi.spyOn(window, "confirm").mockReturnValue(true);

        render(<InstructorHome />);

        const deleteButtons = await screen.findAllByText("Delete");
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(mockedCourseService.deleteCourse).toHaveBeenCalledWith("1");
        });
    });

    it("shows error toast if delete fails", async () => {
        const toast = (await import("react-hot-toast")).default;

        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);
        mockedCourseService.deleteCourse.mockRejectedValue(new Error("fail"));

        vi.spyOn(window, "confirm").mockReturnValue(true);

        render(<InstructorHome />);

        const deleteButtons = await screen.findAllByText("Delete");
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to delete course");
        });
    });

    it("does not delete if confirm is cancelled", async () => {
        mockedCourseService.getInstructorCourses.mockResolvedValue(mockCourses);

        vi.spyOn(window, "confirm").mockReturnValue(false);

        render(<InstructorHome />);

        const deleteButtons = await screen.findAllByText("Delete");
        fireEvent.click(deleteButtons[0]);

        expect(mockedCourseService.deleteCourse).not.toHaveBeenCalled();
    });

    it("shows error toast if fetch fails", async () => {
        const toast = (await import("react-hot-toast")).default;

        mockedCourseService.getInstructorCourses.mockRejectedValue(new Error());

        render(<InstructorHome />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to load courses");
        });
    });

    it("shows success toast when course is unpublished", async () => {
        const toast = (await import("react-hot-toast")).default;

        // mock course already published
        mockedCourseService.getInstructorCourses.mockResolvedValue([
            {
                _id: "2",
                title: "Node Course",
                description: "Backend with Node",
                isPublished: true, //  already published
            },
        ]);

        mockedCourseService.updateCourse.mockResolvedValue({});

        render(<InstructorHome />);

        // button will show "Unpublish"
        fireEvent.click(await screen.findByText("Unpublish"));

        await waitFor(() => {
            expect(mockedCourseService.updateCourse).toHaveBeenCalledWith("2", {
                isPublished: false,
            });

            expect(toast.success).toHaveBeenCalledWith("Course unpublished");
        });
    });
});
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LessonPlayer from "../../pages/LessonPlayer";

/* -----------------------
   Mocks
------------------------ */
vi.mock("../../components/common/NavBar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("react-youtube", () => ({
  default: ({ onReady, onEnd }: any) => (
    <div
      data-testid="youtube-player"
      onClick={() =>
        onReady?.({
          target: {
            getCurrentTime: () => 50,
            getDuration: () => 100,
          },
        })
      }
      onDoubleClick={() => onEnd?.()}
    >
      YouTube Player
    </div>
  ),
}));

const mockGetCourseById = vi.fn();
const mockUpdateVideoProgress = vi.fn();
const mockUpdateAssignmentProgress = vi.fn();

vi.mock("../../services/course.service", () => ({
  courseService: {
    getCourseById: (id: string) => mockGetCourseById(id),
  },
}));

vi.mock("../../services/enrollment.service", () => ({
  EnrollmentService: {
    updateVideoProgress: (data: any) => mockUpdateVideoProgress(data),
    updateAssignmentProgress: (data: any) =>
      mockUpdateAssignmentProgress(data),
  },
}));

/* -----------------------
   Mock Data
------------------------ */
const mockCourseWithVideo = {
  _id: "course1",
  title: "NestJS Course",
  lessons: [
    {
      _id: "lesson1",
      title: "Intro Video",
      type: "video",
      video: { provider: "youtube", videoId: "abc123" },
    },
    {
      _id: "lesson2",
      title: "Advanced Video",
      type: "video",
      video: { provider: "youtube", videoId: "def456" },
    },
  ],
};

const mockCourseWithAssignment = {
  _id: "course1",
  title: "NestJS Course",
  lessons: [
    {
      _id: "lesson1",
      title: "Assignment 1",
      type: "assignment",
      assignment: {
        instructions: "Complete this task",
        maxScore: 100,
      },
    },
  ],
};

const mockCourseWithS3Video = {
  _id: "course1",
  title: "NestJS Course",
  lessons: [
    {
      _id: "lesson1",
      title: "S3 Video",
      type: "video",
      video: { provider: "s3", url: "https://s3.example.com/video.mp4" },
    },
  ],
};

/* -----------------------
   Helper
------------------------ */
const renderLessonPlayer = (
  courseId = "course1",
  lessonId = "lesson1"
) =>
  render(
    <MemoryRouter
      initialEntries={[`/courses/${courseId}/lessons/${lessonId}`]}
    >
      <Routes>
        <Route
          path="/courses/:courseId/lessons/:lessonId"
          element={<LessonPlayer />}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

/* -----------------------
   Tests
------------------------ */
describe("LessonPlayer Integration", () => {
  // ---------------------------
  // Loading & Error States
  // ---------------------------
  it("shows loading state initially", () => {
    mockGetCourseById.mockReturnValue(new Promise(() => {}));
    renderLessonPlayer();

    expect(screen.getByText(/loading lesson/i)).toBeInTheDocument();
  });

  it("shows lesson not found if lesson missing", async () => {
    mockGetCourseById.mockResolvedValue({
      lessons: [], // no lessons
    });

    renderLessonPlayer();

    await waitFor(() => {
      expect(screen.getByText(/lesson not found/i)).toBeInTheDocument();
    });
  });

  // ---------------------------
  // Video Lesson (YouTube)
  // ---------------------------
  it("renders youtube video lesson", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(screen.getByText("Intro Video")).toBeInTheDocument();
      expect(screen.getByTestId("youtube-player")).toBeInTheDocument();
    });
  });

  it("renders lesson sidebar with all lessons", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(screen.getByText(/1. Intro Video/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Advanced Video/i)).toBeInTheDocument();
    });
  });

  // ---------------------------
  // S3 Video
  // ---------------------------
  it("renders S3 video player", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithS3Video);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(screen.getByText("S3 Video")).toBeInTheDocument();
      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video?.src).toContain("s3.example.com");
    });
  });

  it("calls updateVideoProgress when S3 video ends", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithS3Video);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(document.querySelector("video")).toBeInTheDocument();
    });

    fireEvent.ended(document.querySelector("video")!);

    expect(mockUpdateVideoProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: "course1",
        lessonId: "lesson1",
        watchedSeconds: Number.MAX_SAFE_INTEGER,
        duration: Number.MAX_SAFE_INTEGER,
      })
    );
  });

  // ---------------------------
  // Assignment Lesson
  // ---------------------------
  it("renders assignment lesson with instructions", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithAssignment);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(screen.getByText("Assignment 1")).toBeInTheDocument();
      expect(screen.getByText("Complete this task")).toBeInTheDocument();
      expect(screen.getByText(/maximum score: 100/i)).toBeInTheDocument();
    });
  });

  it("calls updateAssignmentProgress on mark complete", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithAssignment);
    mockUpdateAssignmentProgress.mockResolvedValue({});

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mark as complete/i })
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /mark as complete/i })
    );

    await waitFor(() => {
      expect(mockUpdateAssignmentProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: "course1",
          lessonId: "lesson1",
          score: 100,
          totalLessons: 1,
        })
      );
      expect(alertMock).toHaveBeenCalledWith(
        "Assignment marked as complete!"
      );
    });

    alertMock.mockRestore();
  });

  it("shows error alert if assignment completion fails", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithAssignment);
    mockUpdateAssignmentProgress.mockRejectedValue(new Error("Failed"));

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mark as complete/i })
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /mark as complete/i })
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Failed to mark assignment as complete"
      );
    });

    alertMock.mockRestore();
  });

  // ---------------------------
  // Navigation
  // ---------------------------
  it("disables previous button on first lesson", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /← previous/i })
      ).toBeDisabled();
    });
  });

  it("disables next button on last lesson", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson2"); // last lesson

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /next →/i })
      ).toBeDisabled();
    });
  });

  it("navigates to next lesson on next button click", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /next →/i })
      ).not.toBeDisabled();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /next →/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Advanced Video")).toBeInTheDocument();
    });
  });

  it("navigates to previous lesson on previous button click", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson2"); // start on second lesson

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /← previous/i })
      ).not.toBeDisabled();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /← previous/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Intro Video")).toBeInTheDocument();
    });
  });

  it("navigates to lesson from sidebar", async () => {
    mockGetCourseById.mockResolvedValue(mockCourseWithVideo);
    renderLessonPlayer("course1", "lesson1");

    await waitFor(() => {
      expect(screen.getByText(/2. Advanced Video/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/2. Advanced Video/i));

    await waitFor(() => {
      expect(screen.getByText("Advanced Video")).toBeInTheDocument();
    });
  });
});
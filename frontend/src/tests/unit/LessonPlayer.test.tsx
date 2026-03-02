import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/* ---------------- MOCKS ---------------- */

// Navbar
vi.mock("../../components/common/NavBar", () => ({
    default: () => <div>Navbar</div>,
}));

// 🔹 dynamic params mock
let mockParams = {
    courseId: "c1",
    lessonId: "l1",
};

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
}));

// mock YouTube component
vi.mock("react-youtube", () => ({
    default: ({ videoId, onReady, onEnd }: any) => {
        setTimeout(() => {
            onReady({
                target: {
                    getCurrentTime: () => 10,
                    getDuration: () => 100,
                },
            });
        }, 0);

        return (
            <button data-testid="youtube-player" onClick={onEnd}>
                YouTube: {videoId}
            </button>
        );
    },
}));

// services
vi.mock("../../services/course.service", () => ({
    courseService: {
        getCourseById: vi.fn(),
    },
}));

vi.mock("../../services/enrollment.service", () => ({
    EnrollmentService: {
        updateVideoProgress: vi.fn(),
        updateAssignmentProgress: vi.fn(),
    },
}));

/* ---------------- IMPORT AFTER MOCK ---------------- */

import LessonPlayer from "../../pages/LessonPlayer";
import { courseService } from "../../services/course.service";
import { EnrollmentService } from "../../services/enrollment.service";
import { act } from "react";

/* typed mocks */
const mockedCourseService = vi.mocked(courseService);
const mockedEnrollmentService = vi.mocked(EnrollmentService);

/* ---------------- TEST DATA ---------------- */

const mockCourse = {
    lessons: [
        {
            _id: "l1",
            title: "Intro Video",
            type: "video",
            video: { provider: "youtube", videoId: "abc123" },
        },
        {
            _id: "l2",
            title: "Assignment 1",
            type: "assignment",
            assignment: { instructions: "Do it", maxScore: 100 },
        },
    ],
};

/* ---------------- TEST SUITE ---------------- */

describe("LessonPlayer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockParams = { courseId: "c1", lessonId: "l1" };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /* ---------- loading ---------- */

    it("shows loading initially", () => {
        mockedCourseService.getCourseById.mockImplementation(
            () => new Promise(() => { })
        );

        render(<LessonPlayer />);
        expect(screen.getByText(/loading lesson/i)).toBeInTheDocument();
    });

    /* ---------- lesson not found ---------- */

    it("shows lesson not found", async () => {
        mockedCourseService.getCourseById.mockResolvedValue({ lessons: [] });

        render(<LessonPlayer />);
        expect(await screen.findByText(/lesson not found/i)).toBeInTheDocument();
    });

    /* ---------- youtube video render ---------- */

    it("renders youtube video lesson", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        expect(await screen.findByText("Intro Video")).toBeInTheDocument();
        expect(screen.getByTestId("youtube-player")).toBeInTheDocument();
    });

    /* ---------- youtube interval tracking ---------- */


    it("starts YouTube interval tracking and sends progress", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        await screen.findByTestId("youtube-player");

        // flush onReady setTimeout (not runAllTimers — that runs interval forever)
        await act(async () => {
            vi.advanceTimersByTime(100); // just enough to trigger the 0ms setTimeout in mock
        });

        // now advance to trigger the 5000ms interval
        await act(async () => {
            vi.advanceTimersByTime(6000);
        });

        expect(mockedEnrollmentService.updateVideoProgress).toHaveBeenCalled();

        vi.useRealTimers();
    });
    /* ---------- youtube end ---------- */

    it("marks video complete on YouTube end", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        const player = await screen.findByTestId("youtube-player");

        fireEvent.click(player);

        await waitFor(() => {
            expect(
                mockedEnrollmentService.updateVideoProgress
            ).toHaveBeenCalled();
        });
    });

    /* ---------- S3 video ---------- */


    it("tracks S3 video progress on time update", async () => {
        mockedCourseService.getCourseById.mockResolvedValue({
            lessons: [
                {
                    _id: "l1",
                    title: "S3 Video",
                    type: "video",
                    video: { provider: "s3", url: "video.mp4" },
                },
            ],
        });

        const { container } = render(<LessonPlayer />);
        await screen.findByText("S3 Video");

        const video = container.querySelector("video") as HTMLVideoElement;
        expect(video).toBeTruthy();

        // ← Fix: define read-only properties before firing event
        Object.defineProperty(video, "currentTime", { value: 10, configurable: true });
        Object.defineProperty(video, "duration", { value: 100, configurable: true });

        fireEvent.timeUpdate(video);

        await waitFor(() => {
            expect(mockedEnrollmentService.updateVideoProgress).toHaveBeenCalled();
        });
    });

    it("does not send progress when duration is 0", async () => {
        mockedCourseService.getCourseById.mockResolvedValue({
            lessons: [
                {
                    _id: "l1",
                    title: "S3 Video",
                    type: "video",
                    video: { provider: "s3", url: "video.mp4" },
                },
            ],
        });

        const { container } = render(<LessonPlayer />);
        await screen.findByText("S3 Video");

        const video = container.querySelector("video") as HTMLVideoElement;

        // duration is read-only on HTMLMediaElement — must use defineProperty
        Object.defineProperty(video, "currentTime", { value: 10, configurable: true });
        Object.defineProperty(video, "duration", { value: 0, configurable: true });

        fireEvent.timeUpdate(video); // no target override needed

        await waitFor(() => {
            expect(mockedEnrollmentService.updateVideoProgress).not.toHaveBeenCalled();
        });
    });

    it("marks S3 video complete on end", async () => {
        mockedCourseService.getCourseById.mockResolvedValue({
            lessons: [
                {
                    _id: "l1",
                    title: "S3 Video",
                    type: "video",
                    video: { provider: "s3", url: "video.mp4" },
                },
            ],
        });

        const { container } = render(<LessonPlayer />);

        await screen.findByText("S3 Video");

        const video = container.querySelector("video") as HTMLVideoElement;

        fireEvent.ended(video);

        await waitFor(() => {
            expect(
                mockedEnrollmentService.updateVideoProgress
            ).toHaveBeenCalled();
        });
    });

    it("does not send progress when duration is 0", async () => {
        mockedCourseService.getCourseById.mockResolvedValue({
            lessons: [
                {
                    _id: "l1",
                    title: "S3 Video",
                    type: "video",
                    video: { provider: "s3", url: "video.mp4" },
                },
            ],
        });

        const { container } = render(<LessonPlayer />);

        await screen.findByText("S3 Video");

        const video = container.querySelector("video") as HTMLVideoElement;

        Object.defineProperty(video, "currentTime", { value: 10, configurable: true });
        Object.defineProperty(video, "duration", { value: 0, configurable: true });

        fireEvent.timeUpdate(video);

        await waitFor(() => {
            expect(
                mockedEnrollmentService.updateVideoProgress
            ).not.toHaveBeenCalled();
        });
    });
    /* ---------- assignment ---------- */

    it("renders assignment lesson content", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        mockParams = { courseId: "c1", lessonId: "l2" };

        render(<LessonPlayer />);

        expect(await screen.findByText(/instructions/i)).toBeInTheDocument();
        expect(screen.getByText(/maximum score/i)).toBeInTheDocument();
        expect(screen.getByText(/mark as complete/i)).toBeInTheDocument();
    });

    it("marks assignment as complete", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);
        mockedEnrollmentService.updateAssignmentProgress.mockResolvedValue({} as any);

        vi.spyOn(window, "alert").mockImplementation(() => { });

        mockParams = { courseId: "c1", lessonId: "l2" };

        render(<LessonPlayer />);

        fireEvent.click(await screen.findByText(/mark as complete/i));

        await waitFor(() => {
            expect(
                mockedEnrollmentService.updateAssignmentProgress
            ).toHaveBeenCalled();
        });
    });

    /* ---------- navigation ---------- */

    it("navigates to next lesson", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        fireEvent.click(await screen.findByText(/next →/i));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/courses/c1/lessons/l2"
            );
        });
    });

    it("disables previous button on first lesson", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        const prevBtn = await screen.findByText(/previous/i);
        expect(prevBtn).toBeDisabled();
    });

    it("disables next button on last lesson", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        mockParams = { courseId: "c1", lessonId: "l2" };

        render(<LessonPlayer />);

        const nextBtn = await screen.findByText(/next/i);
        expect(nextBtn).toBeDisabled();
    });

    it("navigates from sidebar click", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        fireEvent.click(await screen.findByText("2. Assignment 1"));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/courses/c1/lessons/l2"
            );
        });
    });

    /* ---------- error handling ---------- */

    it("handles course load failure", async () => {
        mockedCourseService.getCourseById.mockRejectedValue(
            new Error("API error")
        );

        render(<LessonPlayer />);

        await waitFor(() => {
            expect(screen.getByText(/lesson not found/i)).toBeInTheDocument();
        });
    });

    /* ---------- cleanup ---------- */

    it("cleans interval on unmount", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        const { unmount } = render(<LessonPlayer />);

        await screen.findByTestId("youtube-player");

        unmount(); // should not crash
    });

    // Line 73: covers clearInterval guard when startYoutubeTracking called twice
    it("clears existing interval before starting a new one", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        // Override YouTube mock to call onReady twice
        vi.doMock("react-youtube", () => ({
            default: ({ videoId, onReady }: any) => {
                setTimeout(() => {
                    const fakePlayer = {
                        getCurrentTime: () => 10,
                        getDuration: () => 100,
                    };
                    onReady({ target: fakePlayer });
                    onReady({ target: fakePlayer }); // second call hits the clearInterval guard
                }, 0);
                return <div data-testid="youtube-player">YouTube: {videoId}</div>;
            },
        }));

        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        render(<LessonPlayer />);

        await screen.findByTestId("youtube-player");

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        await act(async () => {
            vi.advanceTimersByTime(6000);
        });

        expect(mockedEnrollmentService.updateVideoProgress).toHaveBeenCalled();

        vi.useRealTimers();
        vi.doUnmock("react-youtube");
    });
    // Lines 222-224: alert on assignment complete failure
    it("shows alert when assignment completion fails", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);
        mockedEnrollmentService.updateAssignmentProgress.mockRejectedValue(
            new Error("Network error")
        );

        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => { });

        mockParams = { courseId: "c1", lessonId: "l2" };

        render(<LessonPlayer />);

        fireEvent.click(await screen.findByText(/mark as complete/i));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith("Failed to mark assignment as complete");
        });

        alertSpy.mockRestore();
    });

    // Lines 229-238: Previous button onClick navigation
    it("navigates to previous lesson", async () => {
        mockedCourseService.getCourseById.mockResolvedValue(mockCourse);

        // Start on second lesson so Previous is enabled
        mockParams = { courseId: "c1", lessonId: "l2" };

        render(<LessonPlayer />);

        fireEvent.click(await screen.findByText(/← previous/i));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/courses/c1/lessons/l1");
        });
    });


});
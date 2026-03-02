import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseForm from "./CourseForm";
import toast from "react-hot-toast";

// mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("CourseForm", () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =====================
     BASIC RENDER + INPUT
  ===================== */

  it("renders form fields", () => {
    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    expect(screen.getByPlaceholderText("Course Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Course Description")).toBeInTheDocument();
    expect(screen.getByText("+ Add Lesson")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("updates title input when typing", () => {
    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    const input = screen.getByPlaceholderText("Course Title");
    fireEvent.change(input, { target: { value: "React Course" } });

    expect(input).toHaveValue("React Course");
  });

  /* =====================
     VALIDATION
  ===================== */

  it("shows error if title or description missing", async () => {
    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Title and description are required"
      );
    });
  });

  it("shows error if no lessons added", async () => {
    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    fireEvent.change(screen.getByPlaceholderText("Course Title"), {
      target: { value: "Course" },
    });

    fireEvent.change(screen.getByPlaceholderText("Course Description"), {
      target: { value: "Desc" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Add at least one lesson");
    });
  });

  /* =====================
     LESSON CRUD
  ===================== */

  it("adds a lesson", () => {
    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    expect(screen.getByPlaceholderText("Lesson title")).toBeInTheDocument();
  });

  it("removes lesson", () => {
    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    fireEvent.click(screen.getByText("Remove Lesson"));
    expect(screen.queryByPlaceholderText("Lesson title")).not.toBeInTheDocument();
  });

  it("removes only one lesson when multiple exist", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    fireEvent.click(screen.getByText("+ Add Lesson"));
    fireEvent.click(screen.getAllByText("Remove Lesson")[0]);
    expect(screen.getAllByPlaceholderText("Lesson title").length).toBe(1);
  });

  /* =====================
     LESSON TYPE + PROVIDER
  ===================== */

  it("switches lesson type to assignment", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "assignment" },
    });
    expect(
      screen.getByPlaceholderText("Assignment instructions")
    ).toBeInTheDocument();
  });

  it("switches lesson type back to video", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "assignment" } });
    fireEvent.change(selects[0], { target: { value: "video" } });
    expect(screen.getByPlaceholderText("YouTube Video ID")).toBeInTheDocument();
  });

  it("switches provider to s3 and back to youtube", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    const provider = screen.getAllByRole("combobox")[1];
    fireEvent.change(provider, { target: { value: "s3" } });
    expect(screen.getByPlaceholderText("Video URL")).toBeInTheDocument();
    fireEvent.change(provider, { target: { value: "youtube" } });
    expect(screen.getByPlaceholderText("YouTube Video ID")).toBeInTheDocument();
  });

  /* =====================
     FIELD UPDATES
  ===================== */

  it("updates youtube videoId", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    const input = screen.getByPlaceholderText("YouTube Video ID");
    fireEvent.change(input, { target: { value: "abc123" } });
    expect(input).toHaveValue("abc123");
  });

  it("updates s3 video url", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: "s3" },
    });
    const input = screen.getByPlaceholderText("Video URL");
    fireEvent.change(input, { target: { value: "https://video.mp4" } });
    expect(input).toHaveValue("https://video.mp4");
  });

  it("updates assignment fields", () => {
    render(<CourseForm onSubmit={vi.fn()} submitText="Save" />);
    fireEvent.click(screen.getByText("+ Add Lesson"));
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "assignment" },
    });

    fireEvent.change(screen.getByPlaceholderText("Assignment instructions"), {
      target: { value: "Do homework" },
    });

    fireEvent.change(screen.getByPlaceholderText("Max Score"), {
      target: { value: "250" },
    });

    expect(screen.getByPlaceholderText("Assignment instructions")).toHaveValue(
      "Do homework"
    );
    expect(screen.getByPlaceholderText("Max Score")).toHaveValue(250);
  });

  /* =====================
     SUBMIT FLOWS
  ===================== */

  it("submits successfully", async () => {
    mockSubmit.mockResolvedValueOnce({});

    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    fireEvent.change(screen.getByPlaceholderText("Course Title"), {
      target: { value: "Course" },
    });

    fireEvent.change(screen.getByPlaceholderText("Course Description"), {
      target: { value: "Desc" },
    });

    fireEvent.click(screen.getByText("+ Add Lesson"));

    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "Lesson 1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Course saved successfully"
      );
    });
  });

  it("handles submit error and resets loading", async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error("fail"));

    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    fireEvent.change(screen.getByPlaceholderText("Course Title"), {
      target: { value: "Course" },
    });

    fireEvent.change(screen.getByPlaceholderText("Course Description"), {
      target: { value: "Desc" },
    });

    fireEvent.click(screen.getByText("+ Add Lesson"));

    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "Lesson 1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to save course");
  });

  it("disables submit while saving", async () => {
    let resolveFn: any;

    const mockSubmit = vi.fn().mockReturnValue(
      new Promise((res) => {
        resolveFn = res;
      })
    );

    render(<CourseForm onSubmit={mockSubmit} submitText="Save" />);

    fireEvent.change(screen.getByPlaceholderText("Course Title"), {
      target: { value: "Course" },
    });

    fireEvent.change(screen.getByPlaceholderText("Course Description"), {
      target: { value: "Desc" },
    });

    fireEvent.click(screen.getByText("+ Add Lesson"));

    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "Lesson 1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByRole("button", { name: "Saving..." })
    ).toBeDisabled();

    resolveFn();
  });

  /* =====================
     PREFILL + FALLBACKS
  ===================== */

  it("prefills form", () => {
    render(
      <CourseForm
        initialData={{
          title: "Existing Course",
          description: "Existing Desc",
          lessons: [],
        }}
        onSubmit={vi.fn()}
        submitText="Update"
      />
    );

    expect(screen.getByDisplayValue("Existing Course")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Desc")).toBeInTheDocument();
  });

  it("handles all fallback branches", () => {
    render(
      <CourseForm
        onSubmit={vi.fn()}
        submitText="Save"
        initialData={{
          title: "Course",
          description: "Desc",
          lessons: [
            {
              title: "Lesson 1",
              type: "assignment",
              assignment: {
                instructions: null as any,
                maxScore: undefined as any,
              },
            },
          ],
        }}
      />
    );

    expect(
      screen.getByPlaceholderText("Assignment instructions")
    ).toHaveValue("");

    expect(screen.getByPlaceholderText("Max Score")).toHaveValue(100);
  });
});
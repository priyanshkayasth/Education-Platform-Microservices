import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddCourse from "./AddCourse";
import { courseService } from "../../services/course.service";
import toast from "react-hot-toast";

// mock service
vi.mock("../../services/course.service", () => ({
  courseService: {
    addCourses: vi.fn(),
  },
}));

// mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
  },
}));

describe("AddCourse Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //  1. render
  it("renders Add Course page with form", () => {
    render(<AddCourse />);

expect(
  screen.getByRole("heading", { name: "Add Course" })
).toBeInTheDocument();    expect(screen.getByPlaceholderText("Course Title")).toBeInTheDocument();
  });

  //  2. submits form and calls API
  it("calls API when form is submitted", async () => {
    (courseService.addCourses as any).mockResolvedValueOnce({});

    render(<AddCourse />);

    // fill form
    fireEvent.change(screen.getByPlaceholderText("Course Title"), {
      target: { value: "React Course" },
    });

    fireEvent.change(screen.getByPlaceholderText("Course Description"), {
      target: { value: "Learn React" },
    });

    fireEvent.click(screen.getByText("+ Add Lesson"));
   
    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "Lesson 1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Course" }));

    await waitFor(() => {
      expect(courseService.addCourses).toHaveBeenCalled();
    });
  });

  // 3. shows success toast
  it("shows success toast after course added", async () => {
    (courseService.addCourses as any).mockResolvedValueOnce({});

    render(<AddCourse />);

    fireEvent.change(screen.getByPlaceholderText("Course Title"), {
      target: { value: "React Course" },
    });

    fireEvent.change(screen.getByPlaceholderText("Course Description"), {
      target: { value: "Learn React" },
    });

    fireEvent.click(screen.getByText("+ Add Lesson"));

    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "Lesson 1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Course" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Course added successfully"
      );
    });
  });
});
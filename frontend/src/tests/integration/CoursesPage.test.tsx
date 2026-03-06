import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import toast from "react-hot-toast";
import CourseForm from "../../pages/course/CourseForm";

/* --------------------
Mock toast
-------------------- */

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

/* --------------------
Helpers
-------------------- */

const mockSubmit = vi.fn();

const renderForm = () =>
  render(
    <CourseForm
      onSubmit={mockSubmit}
      submitText="Save Course"
    />
  );

beforeEach(() => {
  vi.clearAllMocks();
});

/* --------------------
Tests
-------------------- */

describe("CourseForm Integration", () => {

  it("renders course form fields", () => {
    renderForm();

    expect(
      screen.getByPlaceholderText(/course title/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/course description/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /\+ add lesson/i })
    ).toBeInTheDocument();
  });

  it("shows validation error if title or description missing", async () => {
    renderForm();

    await userEvent.click(
      screen.getByRole("button", { name: /save course/i })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Title and description are required"
    );
  });

  it("shows validation error if no lessons added", async () => {
    renderForm();

    await userEvent.type(
      screen.getByPlaceholderText(/course title/i),
      "React Course"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/course description/i),
      "Learn React basics"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /save course/i })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Add at least one lesson"
    );
  });

  it("adds a lesson dynamically", async () => {
    renderForm();

    await userEvent.click(
      screen.getByRole("button", { name: /\+ add lesson/i })
    );

    expect(
      screen.getByPlaceholderText(/lesson title/i)
    ).toBeInTheDocument();
  });

  it("removes a lesson", async () => {
    renderForm();

    await userEvent.click(
      screen.getByRole("button", { name: /\+ add lesson/i })
    );

    const removeButton = screen.getByRole("button", {
      name: /remove lesson/i,
    });

    await userEvent.click(removeButton);

    expect(
      screen.queryByPlaceholderText(/lesson title/i)
    ).not.toBeInTheDocument();
  });

  it("submits course successfully", async () => {
    mockSubmit.mockResolvedValueOnce({});

    renderForm();

    await userEvent.type(
      screen.getByPlaceholderText(/course title/i),
      "React Course"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/course description/i),
      "Learn React basics"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /\+ add lesson/i })
    );

    await userEvent.type(
      screen.getByPlaceholderText(/lesson title/i),
      "Intro Lesson"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /save course/i })
    );

    expect(mockSubmit).toHaveBeenCalled();

    expect(toast.success).toHaveBeenCalledWith(
      "Course saved successfully"
    );
  });

});
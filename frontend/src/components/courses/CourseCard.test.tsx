import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CourseCard from "./CourseCard";

describe("CourseCard", () => {
  it("renders course title and description", () => {
    const course = {
      title: "React Basics",
      description: "Learn React from scratch",
    };

    render(
      <CourseCard
        course={course}
        enrolled={false}
      />
    );

    expect(
      screen.getByText("React Basics")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Learn React from scratch")
    ).toBeInTheDocument();

    
  });
});

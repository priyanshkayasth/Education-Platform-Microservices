import api from "./axios";

// Enroll
export const enrollInCourse = (courseId: string) =>
  api.post("/enrollments", { courseId });

// Get my enrollments
export const getMyEnrollments = () =>
  api.get("/enrollments/me");

//  Update VIDEO progress
export const updateVideoProgressApi = (data: {
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
  duration: number;
  totalLessons: number;
}) =>
  api.post("/enrollments/progress/video", data);


export const updateAssignmentProgressApi = (data: {
  courseId: string;
  lessonId: string;
  score?: number;
  totalLessons: number;
}) =>
  api.post("/enrollments/progress/assignment", data);

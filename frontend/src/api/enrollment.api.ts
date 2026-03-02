import api from "./axios";

// Enroll
export const enrollInCourse = (courseId: string,referralCode?:string) =>
  api.post("/enrollments", { courseId,...(referralCode && { referralCode }) });

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

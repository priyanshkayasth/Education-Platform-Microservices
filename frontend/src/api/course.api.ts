import api from "./axios";

/* =====================
   Lesson Types
===================== */

export type LessonType = "video" | "assignment";

export interface LessonPayload {
  title: string;
  type: LessonType;

  video?: {
    provider: "youtube" | "vimeo" | "s3";
    videoId?: string;
    url?: string;
    duration?: number;
  };

  assignment?: {
    instructions: string;
    maxScore?: number;
  };
}

/* =====================
   Course Payloads
===================== */

export interface AddCoursePayload {
  title: string;
  description: string;
  lessons: LessonPayload[];
   isPublished?: boolean;
   price?: number;    
  isFree?: boolean;  
}

export interface UpdateCoursePayload
  extends Partial<AddCoursePayload> {}

/* =====================
   API Calls
===================== */

// PUBLIC – students
export const getAllCourses = () => api.get("/courses");

// INSTRUCTOR
export const getInstructorCoursesApi = () =>
  api.get("/courses/instructor");

export const addCourseApi = async (data: AddCoursePayload) => {
  const response = await api.post("/courses", data);
  return response.data;
};

export const updateCourseApi = async (
  courseId: string,
  data: UpdateCoursePayload
) => {
  const response = await api.patch(`/courses/${courseId}`, data);
  return response.data;
};

export const deleteCourseApi = async (courseId: string) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

export const getCourseByIdApi=async(courseId:string)=>{
  const response=await api.get(`/courses/${courseId}`)
  return response.data
}

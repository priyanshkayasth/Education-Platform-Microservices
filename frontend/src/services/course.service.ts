import {
 
  addCourseApi,
  deleteCourseApi,
  getAllCourses,
  getCourseByIdApi,
  getInstructorCoursesApi,
  updateCourseApi,
  type AddCoursePayload,
  type UpdateCoursePayload,
} from "../api/course.api";

export const courseService = {
  async getCourses() {
    const response = await getAllCourses();
    return response.data;
  },

  async getInstructorCourses() {
    const response = await getInstructorCoursesApi();
    return response.data;
  },

  async addCourses(data: AddCoursePayload) {
    return await addCourseApi(data);
  },

  async updateCourse(courseId: string, data: UpdateCoursePayload) {
    return await updateCourseApi(courseId, data);
  },

  async deleteCourse(courseId: string) {
    return await deleteCourseApi(courseId);
  },


async getCourseById(courseId:string){
  return await getCourseByIdApi(courseId)
}

};

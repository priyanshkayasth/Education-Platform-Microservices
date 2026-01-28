import {
  updateVideoProgressApi,
  updateAssignmentProgressApi,
  enrollInCourse,
  getMyEnrollments,
} from "../api/enrollment.api";

export const EnrollmentService = {
  async doEnrollment(courseId: string) {
    const res = await enrollInCourse(courseId);
    return res.data;
  },

  async getMyEnrollments() {
    const res = await getMyEnrollments();
    return res.data;
  },

 async updateVideoProgress(data: {
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
  duration: number;
}) {
  return updateVideoProgressApi(data);
},

async updateAssignmentProgress(data: {
  courseId: string;
  lessonId: string;
  score?: number;
}) {
  return updateAssignmentProgressApi(data);
}


};

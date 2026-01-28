import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../../services/course.service";
import toast from "react-hot-toast";
import CourseForm from "../course/CourseForm";

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    courseService.getInstructorCourses().then((courses) => {
      const found = courses.find((c: any) => c._id === courseId);
      setCourse(found);
    });
  }, [courseId]);

  const handleUpdate = async (data: any) => {
    await courseService.updateCourse(courseId!, data);
    toast.success("Course updated");
    navigate("/instructor/view-course");
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Edit Course</h2>
      <CourseForm
        initialData={course}
        onSubmit={handleUpdate}
        submitText="Update Course"
      />
    </div>
  );
}

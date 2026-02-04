import { courseService } from "../../services/course.service";
import toast from "react-hot-toast";
import CourseForm from "../course/CourseForm";
import { useNavigate } from "react-router-dom";

const navigate=useNavigate()
export default function AddCourse() {
  const handleAdd = async (data: any) => {
    await courseService.addCourses(data);
    toast.success("Course added successfully");
    navigate("/instructor");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Course</h2>
      <CourseForm onSubmit={handleAdd} submitText="Add Course" />
    </div>
  );
}

import { useEffect, useState } from "react";
import { courseService } from "../../services/course.service";
import { Link } from "react-router-dom";

export default function InstructorCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getInstructorCourses().then(setCourses).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Courses</h2>

      {courses.map(course => (
        <div key={course.id} className="card bg-base-100 shadow">
          <div className="card-body card-body flex flex-row gap-4 items-center">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm opacity-70">{course.description}</p>

            <div className="flex gap-3 mt-3">
              <Link
                to={`/instructor/edit-course/${course._id}`}
                className="btn btn-sm btn-outline"
              >
                Edit
              </Link>

              <button
                className="btn btn-sm btn-error"
                onClick={() => handleDelete(course._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  async function handleDelete(id: string) {
    if (!confirm("Delete this course?")) return;

    await courseService.deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  }
}

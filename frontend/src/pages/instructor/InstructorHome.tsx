import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { courseService } from "../../services/course.service";

export default function InstructorHome() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const data = await courseService.getInstructorCourses();
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const togglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      console.log("Sending:", { isPublished: !isPublished });

      await courseService.updateCourse(courseId, {
        isPublished: !isPublished,
      });
      toast.success(
        isPublished ? "Course unpublished" : "Course published"
      );
      fetchCourses();
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted");
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span  role="status"
  aria-label="Loading courses" className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Instructor Dashboard</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/instructor/add-course")}
          >
            + Create Course
          </button>
        </div>

        {/* Courses */}
        {courses.length === 0 ? (
          <div className="alert alert-info">
            <span>No courses created yet.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">{course.title}</h3>

                  <p className="text-sm text-base-content/70 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Status */}
                  <div className="mt-2">
                    <span
                      className={`badge ${course.isPublished
                          ? "badge-success"
                          : "badge-warning"
                        }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="card-actions justify-end mt-4">
                   
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() =>
                        navigate(`/instructor/edit-course/${course._id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-error"
                      disabled={course.isPublished}
                      onClick={() => handleDelete(course._id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`btn btn-sm ${course.isPublished
                          ? "btn-error"
                          : "btn-success"
                        }`}
                      onClick={() =>
                        togglePublish(course._id, course.isPublished)
                      }
                    >
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

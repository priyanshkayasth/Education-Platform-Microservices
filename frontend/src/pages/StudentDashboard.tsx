import { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import { courseService } from "../services/course.service";
import { EnrollmentService } from "../services/enrollment.service";
import { notificationService } from "../services/notification.service";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Footer } from "../components/common/Footer";

/* =====================
   Types
===================== */

type Lesson = {
  _id: string;
  title: string;
  type: "video" | "assignment";
  video?: {
    provider: "youtube" | "vimeo" | "s3";
    videoId?: string;
    url?: string;
  };
  assignment?: {
    instructions: string;
    maxScore?: number;
  };
};

type LessonProgress = {
  lessonId: string;
  percentage?: number;
  completed: boolean;
};

type CourseProgress = {
  overallPercentage: number;
  lessonsProgress: LessonProgress[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isEnrolled: boolean;
  progress?: CourseProgress;
};

/* =====================
   Helpers
===================== */

const getYoutubeThumbnail = (videoId?: string) =>
  videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

/* =====================
   Component
===================== */

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"enrolled" | "browse">("enrolled");

  const { user, isLoggingOut } = useAuth();

  // Filter courses based on active tab
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const availableCourses = courses.filter((c) => !c.isEnrolled);
  const displayedCourses = activeTab === "enrolled" ? enrolledCourses : availableCourses;

  /* =====================
     Enroll
  ===================== */

  const handleEnroll = async (courseId: string) => {
    try {
      await EnrollmentService.doEnrollment(courseId);

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, isEnrolled: true }
            : course
        )
      );

      notificationService.success("Enrolled successfully");
    } catch (error: any) {
      if (error.response?.status === 409) {
        notificationService.info("You are already enrolled");
      } else {
        notificationService.error("Enrollment failed");
      }
    }
  };

  /* =====================
     Load Data
  ===================== */

  useEffect(() => {
    if (!user || isLoggingOut) return;

    const loadData = async () => {
      try {
        const [coursesData, enrollments] = await Promise.all([
          courseService.getCourses(),
          EnrollmentService.getMyEnrollments(),
        ]);

        const normalizedCourses: Course[] = coursesData.map(
          (course: any) => {
            const enrollment = enrollments.find(
              (e: any) => e.courseId === course._id
            );

            return {
              id: course._id,
              title: course.title,
              description: course.description,
              lessons: Array.isArray(course.lessons)
                ? course.lessons
                : [],
              isEnrolled: !!enrollment,
              progress: enrollment
                ? {
                  overallPercentage:
                    enrollment.overallPercentage ?? 0,
                  lessonsProgress:
                    enrollment.lessonsProgress ?? [],
                }
                : undefined,
            };
          }
        );

        setCourses(normalizedCourses);
      } catch {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isLoggingOut]);

  /* =====================
     Render States
  ===================== */

  if (loading) return <div className="p-6">Loading courses...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  /* =====================
     Render UI
  ===================== */

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 p-6">
        {/* Tabs Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Learning</h1>
        </div>

        <div className="tabs tabs-boxed mb-6 w-fit">
          <button
            className={`tab ${activeTab === "enrolled" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("enrolled")}
          >
            My Courses ({enrolledCourses.length})
          </button>
          <button
            className={`tab ${activeTab === "browse" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            Browse Courses ({availableCourses.length})
          </button>
        </div>

        {/* Empty States */}
        {displayedCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === "enrolled" ? "📚" : "🔍"}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === "enrolled"
                ? "No Enrolled Courses Yet"
                : "No Available Courses"}
            </h3>
            <p className="text-base-content/70">
              {activeTab === "enrolled"
                ? "Browse courses and enroll to start learning!"
                : "Check back later for new courses."}
            </p>
            {activeTab === "enrolled" && availableCourses.length > 0 && (
              <button
                className="btn btn-primary mt-4"
                onClick={() => setActiveTab("browse")}
              >
                Browse Courses
              </button>
            )}
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course) => {
            const lessons = course.lessons ?? [];
            const progressMap = new Map(
              course.progress?.lessonsProgress.map((p) => [
                p.lessonId,
                p,
              ]) || []
            );

            const videoLessons = lessons.filter(
              (l) => l.type === "video"
            );
            const assignmentLessons = lessons.filter(
              (l) => l.type === "assignment"
            );

            return (
              <div key={course.id} className="card bg-base-100 shadow border border-base">
                <div className="card-body">
                  <h2 className="card-title">{course.title}</h2>

                  <p className="text-sm text-base-content/70">
                    {course.description}
                  </p>

                  {/* Course Progress */}
                  {course.isEnrolled && course.progress && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">
                        Course Progress:{" "}
                        {course.progress.overallPercentage}%
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={course.progress.overallPercentage}
                        max={100}
                      />
                    </div>
                  )}

                  {/* 🎥 Videos */}
                  {videoLessons.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 gap-3">
                        {videoLessons.slice(0, 1).map((lesson) => {
                          const progress = progressMap.get(lesson._id);
                          const thumbnail = getYoutubeThumbnail(
                            lesson.video?.videoId
                          );

                          return (
                            <Link
                              key={lesson._id}
                              to={
                                course.isEnrolled
                                  ? `/courses/${course.id}/lessons/${lesson._id}`
                                  : "#"
                              }
                              className="group"
                            >
                              <div className="relative rounded overflow-hidden">
                                {thumbnail ? (
                                  <img
                                    src={thumbnail}
                                    alt={lesson.title}
                                    className="w-full h-32 object-cover"
                                  />
                                ) : (
                                  <div className="h-32 flex items-center justify-center bg-base-200">
                                    Video
                                  </div>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black/60 text-white rounded-full p-2 text-xl">
                                    ▶
                                  </div>
                                </div>
                              </div>

                              <p className="text-sm mt-1 text-center">
                                {lesson.title}
                              </p>

                              {course.isEnrolled && progress && (
                                <div className="flex items-center justify-center gap-1 text-xs mt-1">
                                  <progress
                                    className="progress progress-success w-20"
                                    value={progress.percentage ?? 0}
                                    max={100}
                                  />
                                  {progress.completed ? "✅" : "⏳"}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      {/* View All Indicator */}
                      {videoLessons.length > 1 && (
                        <div className="text-center mt-3">
                          <Link
                            to={
                              course.isEnrolled && videoLessons[1]
                                ? `/courses/${course.id}/lessons/${videoLessons[1]._id}`
                                : "#"
                            }
                            className="text-sm text-primary hover:underline cursor-pointer"
                          >
                            +{videoLessons.length - 1} more lesson{videoLessons.length - 1 !== 1 ? 's' : ''}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}


                  {/* 📝 Assignments */}
                  {assignmentLessons.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <span>📝</span>
                        <span>Assignments</span>
                      </h4>
                      <div className="space-y-2">
                        {assignmentLessons.slice(0, 2).map((lesson) => {
                          const progress = progressMap.get(lesson._id);
                          const completed = progress?.completed;

                          return (
                            <Link
                              key={lesson._id}
                              to={
                                course.isEnrolled
                                  ? `/courses/${course.id}/lessons/${lesson._id}`
                                  : "#"
                              }
                              className={`block p-3 rounded-lg border transition-all ${completed
                                ? "bg-success/10 border-success/30"
                                : "bg-base-200 border-base-300 hover:border-primary"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {completed ? (
                                    <span className="text-success text-xl">✓</span>
                                  ) : (
                                    <span className="text-base-content/50 text-xl">📄</span>
                                  )}
                                  <span
                                    className={`text-sm font-medium ${completed ? "text-success" : ""
                                      }`}
                                  >
                                    {lesson.title}
                                  </span>
                                </div>
                                {!completed && course.isEnrolled && (
                                  <span className="text-xs text-primary">
                                    Start →
                                  </span>
                                )}
                                {completed && (
                                  <span className="text-xs text-success font-medium">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* View All Indicator */}
                      {assignmentLessons.length > 2 && (
                        <div className="text-center mt-3">
                          <Link
                            to={
                              course.isEnrolled && assignmentLessons[2]
                                ? `/courses/${course.id}/lessons/${assignmentLessons[2]._id}`
                                : "#"
                            }
                            className="text-sm text-primary hover:underline cursor-pointer"
                          >
                            +{assignmentLessons.length - 2} more assignment{assignmentLessons.length - 2 !== 1 ? 's' : ''}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!course.isEnrolled ? (
                  <button
                    className="btn btn-primary btn-sm m-4"
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll to Unlock
                  </button>
                ) : (
                  <button
                    className="btn btn-success btn-sm m-4"
                    disabled
                  >
                    Enrolled
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

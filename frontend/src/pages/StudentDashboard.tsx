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

const getYoutubeUrl = (videoId?: string) =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : "#";

/* =====================
   Component
===================== */

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoggingOut } = useAuth();

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
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All Courses</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
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

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {videoLessons.map((lesson) => {
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


                  {/* 📝 Assignments */}
                  <ul className="list-disc ml-5 space-y-2">
                    {assignmentLessons.map((lesson) => {
                      const progress = progressMap.get(lesson._id);
                      const completed = progress?.completed;

                      return (
                        <li
                          key={lesson._id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-success"
                            checked={!!completed}
                            disabled={!course.isEnrolled || completed}
                            onChange={async () => {
                              await EnrollmentService.updateAssignmentProgress({
                                courseId: course.id,
                                lessonId: lesson._id,
                                score: lesson.assignment?.maxScore ?? 100,
                              });

                              setCourses((prev) =>
                                prev.map((c) => {
                                  if (c.id !== course.id) return c;

                                  const existingProgress =
                                    c.progress?.lessonsProgress || [];

                                  const lessonAlreadyExists = existingProgress.find(
                                    (p) => p.lessonId === lesson._id
                                  );

                                  const updatedLessonsProgress = lessonAlreadyExists
                                    ? existingProgress.map((p) =>
                                      p.lessonId === lesson._id
                                        ? { ...p, completed: true }
                                        : p
                                    )
                                    : [
                                      ...existingProgress,
                                      { lessonId: lesson._id, completed: true },
                                    ];

                                  const completedCount =
                                    updatedLessonsProgress.filter(
                                      (p) => p.completed
                                    ).length;

                                  const totalLessons = c.lessons.length;

                                  return {
                                    ...c,
                                    progress: {
                                      lessonsProgress: updatedLessonsProgress,
                                      overallPercentage: Math.round(
                                        (completedCount / totalLessons) * 100
                                      ),
                                    },
                                  };
                                })
                              );
                            }}

                          />


                          <span
                            className={
                              completed ? "line-through text-success" : ""
                            }
                          >
                            {lesson.title}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

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
      <Footer/>
    </>
  );
}

import { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import { courseService } from "../services/course.service";
import { EnrollmentService } from "../services/enrollment.service";
import { notificationService } from "../services/notification.service";
import { useAuth } from "../context/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import { Footer } from "../components/common/Footer";
import { useRazorpay } from "../hooks/useRazorpay";

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
  price: number;
  isFree: boolean;
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

  const [searchQuery, setSearchQuery] = useState("");

  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);

  const getSuggestedCourses = (enrolledCourse: Course, allCourses: Course[]) => {
    const keywords = enrolledCourse.title.toLowerCase().split(' ').filter(w => w.length > 3);
    return allCourses
      .filter(c => !c.isEnrolled && c.id !== enrolledCourse.id)
      .filter(c => keywords.some(keyword => c.title.toLowerCase().includes(keyword)))
      .slice(0, 3);
  };


  const [highlightedCourseId, setHighlightedCourseId] = useState<string | null>(null);

  // Filter courses based on active tab
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const availableCourses = courses.filter((c) => !c.isEnrolled);
  const displayedCourses = activeTab === "enrolled" ? enrolledCourses : availableCourses;

  const filteredCourses = displayedCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* =====================
    Enroll
  ===================== */

  // const handleEnroll = async (courseId: string) => {
  //   try {
  //     await EnrollmentService.doEnrollment(courseId);

  //     setCourses((prev) =>
  //       prev.map((course) =>
  //         course.id === courseId
  //           ? { ...course, isEnrolled: true }
  //           : course
  //       )
  //     );

  //     notificationService.success("Enrolled successfully");
  //   } catch (error: any) {
  //     if (error.response?.status === 409) {
  //       notificationService.info("You are already enrolled");
  //     } else {
  //       notificationService.error("Enrollment failed");
  //     }
  //   }
  // };


  // Inside component
  const [searchParams] = useSearchParams();
  // const refCode = searchParams.get('ref');
  const refCode = searchParams.get('ref') ?? undefined;

  const refCourseId = searchParams.get('courseId');

  const { initiatePayment } = useRazorpay();
  const [pointsToUse, setPointsToUse] = useState(0);

  // Auto switch to browse tab if referral link
  useEffect(() => {
    if (refCourseId) {
      setActiveTab('browse');
    }
  }, [refCourseId]);

  // Add this helper function inside the component
  const getReferralLink = (courseId: string) => {
    // return `${window.location.origin}/courses?ref=${user?.referralCode}&courseId=${courseId}`;
    return `${window.location.origin}/student?ref=${user?.referralCode}&courseId=${courseId}`;

  };

  const handleCopyReferral = (courseId: string) => {
    const link = getReferralLink(courseId);
    navigator.clipboard.writeText(link);
    notificationService.success("Referral link copied!");
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const referralCode = refCode || undefined;
      await EnrollmentService.doEnrollment(courseId, referralCode);

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, isEnrolled: true }
            : course
        )
      );

      notificationService.success("Enrolled successfully");

      const enrolledCourse = courses.find(c => c.id === courseId);
      if (enrolledCourse) {
        const suggestions = getSuggestedCourses(
          { ...enrolledCourse, isEnrolled: true },
          courses.map(c => c.id === courseId ? { ...c, isEnrolled: true } : c)
        );
        setSuggestedCourses(suggestions);
      }
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
              price: course.price ?? 0,       // 
              isFree: course.isFree ?? true,  // 
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


  useEffect(() => {
    if (highlightedCourseId) {
      const timer = setTimeout(() => setHighlightedCourseId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedCourseId]);

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

        {suggestedCourses.length > 0 && (
          <div className="mb-6 bg-base-100 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h3 className="font-semibold text-lg">You may also like!</h3>
              <button
                className="btn btn-xs btn-ghost ml-auto"
                onClick={() => setSuggestedCourses([])}
              >✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestedCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-3 bg-base-200">
                  <p className="font-medium text-sm">{course.title}</p>
                  <p className="text-xs text-base-content/60 mt-1 line-clamp-2">{course.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">
                      {course.isFree ? 'Free' : `₹${course.price}`}
                    </span>
                    {/* <button
                      className="btn btn-xs btn-primary"
                      onClick={() => {
                        setActiveTab('browse');
                        setSuggestedCourses([]);
                      }}
                    >View</button> */}

                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => {
                        setActiveTab('browse');
                        setSuggestedCourses([]);
                        setHighlightedCourseId(course.id);
                        // Scroll to course after tab switch
                        setTimeout(() => {
                          document.getElementById(`course-${course.id}`)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }, 100);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search courses..."
            className="input input-bordered w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
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
              // <div key={course.id}  className="card bg-base-100 shadow border border-base">
              <div
                key={course.id}
                id={`course-${course.id}`}
                className={`card bg-base-100 shadow border transition-all duration-500 ${highlightedCourseId === course.id
                  ? 'border-primary border-2 shadow-lg shadow-primary/20'
                  : 'border-base'
                  }`}
              >
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

                {/* {!course.isEnrolled ? (
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
                  )} */}

                {/* Enroll / Enrolled Button */}
                {/* {!course.isEnrolled ? (
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
                )} */}



                {!course.isEnrolled ? (
                  <div className="m-4">
                    {course.isFree ? (
                      // FREE COURSE
                      <button
                        className="btn btn-primary btn-sm w-full"
                        onClick={() => handleEnroll(course.id)}
                      >
                        Enroll for Free
                      </button>
                    ) : (
                      // PAID COURSE
                      <div>
                        <div className="text-lg font-bold mb-2">
                          ₹{course.price}
                          {user?.points && user.points >= 100 && (
                            <span className="text-sm text-success ml-2">
                              You have {user.points} points!
                            </span>
                          )}
                        </div>

                        {/* Points discount */}
                        {user?.points && user.points >= 100 && (
                          <div className="mb-2">
                            <label className="text-sm">Use points for discount:</label>
                            <input
                              type="number"
                              className="input input-bordered input-sm w-full mt-1"
                              min={0}
                              max={user.points}
                              step={100}
                              value={pointsToUse}
                              onChange={(e) => setPointsToUse(Number(e.target.value))}
                            />
                            {pointsToUse >= 100 && (
                              <p className="text-xs text-success mt-1">
                                Discount: ₹{Math.round((course.price * Math.min(50, Math.floor(pointsToUse / 100) * 10)) / 100)}
                              </p>
                            )}
                          </div>
                        )}

                        <button
                          className="btn btn-primary btn-sm w-full"
                          onClick={() => initiatePayment(
                            course.id,
                            course.price,
                            pointsToUse,
                            refCode,
                            () => {
                              setCourses(prev =>
                                prev.map(c => c.id === course.id ? { ...c, isEnrolled: true } : c)
                              );
                              notificationService.success('Payment successful! Enrolled in course.');
                            }
                          )}
                        >
                          Buy ₹{course.price}
                        </button>
                      </div>

                      // <div>
                      //   {/* PAID COURSE */}
                      //   <div className="p-4">

                      //     {/* Price Header */}
                      //     <div className="flex items-center justify-between mb-3">
                      //       <div>
                      //         <span className="text-2xl font-bold">₹{course.price}</span>
                      //         {pointsToUse >= 100 && (
                      //           <span className="text-sm line-through text-gray-400 ml-2">
                      //             ₹{course.price}
                      //           </span>
                      //         )}
                      //       </div>
                      //       {pointsToUse >= 100 && (
                      //         <span className="badge badge-success text-white font-bold">
                      //           {Math.min(50, Math.floor(pointsToUse / 100) * 10)}% OFF
                      //         </span>
                      //       )}
                      //     </div>

                      //     {/* Points Banner - Zomato style */}
                      //     {user?.points && user.points >= 100 ? (
                      //       <div className="bg-success/10 border border-success/30 rounded-lg p-3 mb-3">
                      //         <div className="flex items-center gap-2 mb-2">
                      //           <span className="text-lg">⭐</span>
                      //           <span className="text-sm font-semibold text-success">
                      //             You have {user.points} points available!
                      //           </span>
                      //         </div>
                      //         <p className="text-xs text-base-content/60 mb-2">
                      //           100 points = 10% discount (max 50%)
                      //         </p>

                      //         {/* Points Selector */}
                      //         <div className="flex items-center gap-2">
                      //           <button
                      //             className="btn btn-xs btn-outline"
                      //             onClick={() => setPointsToUse(Math.max(0, pointsToUse - 100))}
                      //           >
                      //             −
                      //           </button>
                      //           <div className="flex-1 text-center">
                      //             <span className="font-bold text-primary">{pointsToUse}</span>
                      //             <span className="text-xs text-base-content/60"> points</span>
                      //           </div>
                      //           <button
                      //             className="btn btn-xs btn-outline"
                      //             onClick={() => setPointsToUse(Math.min(user.points!, pointsToUse + 100))}
                      //           >
                      //             +
                      //           </button>
                      //         </div>

                      //         {/* Discount Preview */}
                      //         {pointsToUse >= 100 && (
                      //           <div className="mt-2 flex justify-between text-sm">
                      //             <span className="text-base-content/60">Discount:</span>
                      //             <span className="text-success font-bold">
                      //               -₹{Math.round((course.price * Math.min(50, Math.floor(pointsToUse / 100) * 10)) / 100)}
                      //             </span>
                      //           </div>
                      //         )}

                      //         {pointsToUse >= 100 && (
                      //           <div className="flex justify-between text-sm font-bold mt-1 border-t border-success/20 pt-1">
                      //             <span>Total:</span>
                      //             <span className="text-primary">
                      //               ₹{course.price - Math.round((course.price * Math.min(50, Math.floor(pointsToUse / 100) * 10)) / 100)}
                      //             </span>
                      //           </div>
                      //         )}
                      //       </div>
                      //     ) : user?.points && user.points > 0 ? (
                      //       <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-3 text-xs text-warning">
                      //         ⭐ You have {user.points} points — earn more to unlock discounts! (need 100)
                      //       </div>
                      //     ) : null}

                      //     {/* Buy Button */}
                      //     <button
                      //       className="btn btn-primary w-full"
                      //       onClick={() => initiatePayment(
                      //         course.id,
                      //         course.price,
                      //         pointsToUse,
                      //         () => {
                      //           setCourses(prev =>
                      //             prev.map(c => c.id === course.id ? { ...c, isEnrolled: true } : c)
                      //           );
                      //           setPointsToUse(0);
                      //           notificationService.success('Payment successful! Enrolled in course. 🎉');
                      //         }
                      //       )}
                      //     >
                      //       {pointsToUse >= 100
                      //         ? `Pay ₹${course.price - Math.round((course.price * Math.min(50, Math.floor(pointsToUse / 100) * 10)) / 100)}`
                      //         : `Buy Now ₹${course.price}`
                      //       }
                      //     </button>

                      //   </div>
                      // </div>

                    )}
                  </div>
                ) : (
                  <button className="btn btn-success btn-sm m-4" disabled>
                    Enrolled
                  </button>
                )}

                {/* 🔗 Referral Share Button */}
                {course.isEnrolled && user?.referralCode && (
                  <button
                    className="btn btn-outline btn-sm mx-4 mb-4"
                    onClick={() => handleCopyReferral(course.id)}
                  >
                    🔗 Share & Earn Points
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

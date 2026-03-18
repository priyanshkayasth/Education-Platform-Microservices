import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import Navbar from "../components/common/NavBar";
import { courseService } from "../services/course.service";
import { EnrollmentService } from "../services/enrollment.service";

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

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const ytPlayerRef = useRef<any>(null);
  const lastSentRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Find current lesson index
  const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  /* =====================
     Load Lesson
  ===================== */
  useEffect(() => {
    const loadLesson = async () => {
      try {
        const course = await courseService.getCourseById(courseId!);
        // Include ALL lessons (video + assignment)
        setAllLessons(course.lessons);

        const found = course.lessons.find(
          (l: Lesson) => l._id === lessonId
        );
        setLesson(found || null);
      } catch (err) {
        console.error("Failed to load lesson", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) loadLesson();
  }, [courseId, lessonId]);

  /* =====================
     YouTube Progress Tracking
  ===================== */
  const startYoutubeTracking = () => {
    if (!ytPlayerRef.current || !courseId || !lessonId) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      const player = ytPlayerRef.current;
      const watched = Math.floor(player.getCurrentTime());
      const duration = Math.floor(player.getDuration() || 0);

      if (!duration) return;

      if (watched - lastSentRef.current >= 5) {
        lastSentRef.current = watched;

        EnrollmentService.updateVideoProgress({
          courseId,
          lessonId,
          watchedSeconds: watched,
          duration,
          totalLessons: allLessons.length,
        });
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /* =====================
     Render States
  ===================== */
  if (loading) return <div className="p-6">Loading lesson...</div>;
  if (!lesson) return <div className="p-6">Lesson not found</div>;

  /* =====================
     Render Player
  ===================== */
  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <h1 className="text-xl font-semibold mb-4">{lesson.title}</h1>

            {/* YouTube */}
            {lesson.video?.provider === "youtube" && lesson.video.videoId && (
              <YouTube
                videoId={lesson.video.videoId}
                opts={{
                  width: "100%",
                  height: "480",
                  playerVars: { autoplay: 1 },
                }}
                onReady={(e) => {
                  ytPlayerRef.current = e.target;
                  startYoutubeTracking();
                }}
                onEnd={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);

                  EnrollmentService.updateVideoProgress({
                    courseId: courseId!,
                    lessonId: lessonId!,
                    watchedSeconds: Number.MAX_SAFE_INTEGER,
                    duration: Number.MAX_SAFE_INTEGER,
                    totalLessons: allLessons.length,
                  });
                }}
              />
            )}

            {/* S3 / MP4 */}
            {lesson.video?.provider === "s3" && lesson.video.url && (
              <video
                src={lesson.video.url}
                controls
                autoPlay
                className="w-full rounded"
                onTimeUpdate={(e) => {
                  if (!courseId || !lessonId) return;

                  const video = e.currentTarget;
                  const watched = Math.floor(video.currentTime);
                  const duration = Math.floor(video.duration || 0);

                  if (!duration) return;

                  if (watched - lastSentRef.current >= 5) {
                    lastSentRef.current = watched;

                    EnrollmentService.updateVideoProgress({
                      courseId,
                      lessonId,
                      watchedSeconds: watched,
                      duration,
                      totalLessons: allLessons.length,
                    });
                  }
                }}
                onEnded={() => {
                  EnrollmentService.updateVideoProgress({
                    courseId: courseId!,
                    lessonId: lessonId!,
                    watchedSeconds: Number.MAX_SAFE_INTEGER,
                    duration: Number.MAX_SAFE_INTEGER,
                    totalLessons: allLessons.length,
                  });
                }}
              />
            )}

            {/* Assignment Display */}
            {lesson.type === "assignment" && lesson.assignment && (
              <div className="bg-base-200 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📝</span>
                  <h3 className="text-lg font-semibold">Assignment</h3>
                </div>

                <div className="bg-base-100 p-4 rounded mb-4">
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <p className="whitespace-pre-wrap">{lesson.assignment.instructions}</p>
                </div>

                {lesson.assignment.maxScore && (
                  <div className="text-sm text-base-content/70 mb-4">
                    Maximum Score: {lesson.assignment.maxScore} points
                  </div>
                )}

                <button
                  className="btn btn-success"
                  onClick={async () => {
                    try {
                      await EnrollmentService.updateAssignmentProgress({
                        courseId: courseId!,
                        lessonId: lessonId!,
                        score: lesson.assignment?.maxScore ?? 100,
                        totalLessons: allLessons.length,
                      });
                      alert("Assignment marked as complete!");
                    } catch (error) {
                      alert("Failed to mark assignment as complete");
                    }
                  }}
                >
                  Mark as Complete ✓
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                className="btn btn-outline"
                disabled={!hasPrevious}
                onClick={() => {
                  if (hasPrevious) {
                    navigate(`/courses/${courseId}/lessons/${allLessons[currentIndex - 1]._id}`);
                  }
                }}
              >
                ← Previous
              </button>
              <button
                className="btn btn-primary"
                disabled={!hasNext}
                onClick={() => {
                  if (hasNext) {
                    navigate(`/courses/${courseId}/lessons/${allLessons[currentIndex + 1]._id}`);
                  }
                }}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Lesson List Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Course Lessons</h2>
            <div className="space-y-2">
              {allLessons.map((l, index) => (
                <button
                  key={l._id}
                  className={`w-full text-left p-3 rounded border ${l._id === lessonId
                    ? "bg-primary text-primary-content border-primary"
                    : "bg-base-100 hover:bg-base-200 border-base-300"
                    }`}
                  onClick={() => navigate(`/courses/${courseId}/lessons/${l._id}`)}
                >
                  <div className="text-sm font-medium flex items-center gap-2">
                    <span>{l.type === "video" ? "🎥" : "📝"}</span>
                    <span>{index + 1}. {l.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

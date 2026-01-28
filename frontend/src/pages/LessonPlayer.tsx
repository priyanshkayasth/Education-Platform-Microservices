import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
};

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();

  const ytPlayerRef = useRef<any>(null);
  const lastSentRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  /* =====================
     Load Lesson
  ===================== */
  useEffect(() => {
    const loadLesson = async () => {
      try {
        const course = await courseService.getCourseById(courseId!);
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

      <div className="p-6 max-w-4xl mx-auto">
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
                });
              }
            }}
            onEnded={() => {
              EnrollmentService.updateVideoProgress({
                courseId: courseId!,
                lessonId: lessonId!,
                watchedSeconds: Number.MAX_SAFE_INTEGER,
                duration: Number.MAX_SAFE_INTEGER,
              });
            }}
          />
        )}
      </div>
    </>
  );
}

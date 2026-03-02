// import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import type { AddCoursePayload } from "../../api/course.api";

// type Props = {
//   initialData?: AddCoursePayload;
//   onSubmit: (data: AddCoursePayload) => Promise<void>;
//   submitText: string;
// };

// export default function CourseForm({
//   initialData,
//   onSubmit,
//   submitText,
// }: Props) {
//   const [form, setForm] = useState<AddCoursePayload>({
//     title: "",
//     description: "",
//     videoLinks: [],
//     assignments: [],
//   });

//   const [loading, setLoading] = useState(false);

//   // 🔹 Prefill for edit mode
//   useEffect(() => {
//     if (initialData) {
//       setForm(initialData);
//     }
//   }, [initialData]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleArrayChange = (name: keyof AddCoursePayload, value: string) => {
//     setForm({
//       ...form,
//       [name]: value.split(",").map(v => v.trim()),
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!form.title || !form.description) {
//       toast.error("Title and description are required");
//       return;
//     }

//     setLoading(true);
//     try {
//       await onSubmit(form);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
//       <input
//         name="title"
//         placeholder="Course Title"
//         value={form.title}
//         onChange={handleChange}
//         className="input input-bordered w-full"
//       />

//       <textarea
//         name="description"
//         placeholder="Course Description"
//         value={form.description}
//         onChange={handleChange}
//         className="textarea textarea-bordered w-full"
//       />

//       <input
//         placeholder="Video links (comma separated)"
//         defaultValue={form.videoLinks.join(",")}
//         onChange={(e) => handleArrayChange("videoLinks", e.target.value)}
//         className="input input-bordered w-full"
//       />

//       <input
//         placeholder="Assignments (comma separated)"
//         defaultValue={form.assignments.join(",")}
//         onChange={(e) => handleArrayChange("assignments", e.target.value)}
//         className="input input-bordered w-full"
//       />

//       <button
//         type="submit"
//         className="btn btn-primary w-full"
//         disabled={loading}
//       >
//         {loading ? "Saving..." : submitText}
//       </button>
//     </form>
//   );
// }



import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { AddCoursePayload, LessonPayload } from "../../api/course.api";

/* =====================
   Types
===================== */

type Props = {
  initialData?: AddCoursePayload;
  onSubmit: (data: AddCoursePayload) => Promise<void>;
  submitText: string;
};

/* =====================
   Defaults
===================== */

const emptyLesson: LessonPayload = {
  title: "",
  type: "video",
  video: {
    provider: "youtube",
    videoId: "",
  },
};

/* =====================
   Component
===================== */

export default function CourseForm({
  initialData,
  onSubmit,
  submitText,
}: Props) {
  const [form, setForm] = useState<AddCoursePayload>({
    title: "",
    description: "",
    lessons: [],
  });

  const [loading, setLoading] = useState(false);

  /* =====================
     Prefill (Edit Mode)
  ===================== */

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  /* =====================
     Helpers
  ===================== */

  const updateLesson = (
    index: number,
    updatedLesson: Partial<LessonPayload>
  ) => {
    const lessons = [...form.lessons];
    lessons[index] = { ...lessons[index], ...updatedLesson };
    setForm({ ...form, lessons });
  };

  const addLesson = () => {
    setForm({
      ...form,
      lessons: [...form.lessons, { ...emptyLesson }],
    });
  };

  const removeLesson = (index: number) => {
    setForm({
      ...form,
      lessons: form.lessons.filter((_, i) => i !== index),
    });
  };

  /* =====================
     Submit
  ===================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    if (form.lessons.length === 0) {
      toast.error("Add at least one lesson");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      toast.success("Course saved successfully");
    }
      catch (err) {
  toast.error("Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     Render
  ===================== */

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Course Title */}
      <input
        placeholder="Course Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
        className="input input-bordered w-full"
      />

      {/* Course Description */}
      <textarea
        placeholder="Course Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="textarea textarea-bordered w-full"
      />

      {/* Lessons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Lessons</h3>

        {form.lessons.map((lesson, index) => (
          <div key={index} className="border p-4 rounded space-y-3">
            {/* Lesson Title */}
            <input
              className="input input-bordered w-full"
              placeholder="Lesson title"
              value={lesson.title}
              onChange={(e) =>
                updateLesson(index, { title: e.target.value })
              }
            />

            {/* Lesson Type */}
            <select
              className="select select-bordered w-full"
              value={lesson.type}
              onChange={(e) => {
                const type = e.target.value as "video" | "assignment";

                updateLesson(index, {
                  type,
                  video:
                    type === "video"
                      ? { provider: "youtube", videoId: "" }
                      : undefined,
                  assignment:
                    type === "assignment"
                      ? { instructions: "", maxScore: 100 }
                      : undefined,
                });
              }}
            >
              <option value="video">Video</option>
              <option value="assignment">Assignment</option>
            </select>

            {/* VIDEO FIELDS */}
            {lesson.type === "video" && (
              <>
                <select
                  className="select select-bordered w-full"
                  value={lesson.video?.provider || "youtube"}
                  onChange={(e) =>
                    updateLesson(index, {
                      video: {
                        provider: e.target.value as "youtube" | "s3",
                      },
                    })
                  }
                >
                  <option value="youtube">YouTube</option>
                  <option value="s3">MP4 / S3</option>
                </select>

                {lesson.video?.provider === "youtube" && (
                  <input
                    className="input input-bordered w-full"
                    placeholder="YouTube Video ID"
                    value={lesson.video.videoId || ""}
                    onChange={(e) =>
                      updateLesson(index, {
                        video: {
                          provider: "youtube",
                          videoId: e.target.value,
                        },
                      })
                    }
                  />
                )}

                {lesson.video?.provider === "s3" && (
                  <input
                    className="input input-bordered w-full"
                    placeholder="Video URL"
                    value={lesson.video.url || ""}
                    onChange={(e) =>
                      updateLesson(index, {
                        video: {
                          provider: "s3",
                          url: e.target.value,
                        },
                      })
                    }
                  />
                )}
              </>
            )}

            {/* ASSIGNMENT FIELDS */}
            {lesson.type === "assignment" && (
              <>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Assignment instructions"
                  value={lesson.assignment?.instructions ?? ""}
                  onChange={(e) =>
                    updateLesson(index, {
                      assignment: {
                        instructions: e.target.value, //  ALWAYS string
                        maxScore: lesson.assignment?.maxScore ?? 100,
                      },
                    })
                  }
                />

                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Max Score"
                  value={lesson.assignment?.maxScore ?? 100}
                  onChange={(e) =>
                    updateLesson(index, {
                      assignment: {
                        instructions:
                          lesson.assignment?.instructions ?? "", //  ALWAYS string
                        maxScore: Number(e.target.value),
                      },
                    })
                  }
                />
              </>
            )}

            <button
              type="button"
              onClick={() => removeLesson(index)}
              className="btn btn-sm btn-error"
            >
              Remove Lesson
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addLesson}
          className="btn btn-outline"
        >
          + Add Lesson
        </button>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : submitText}
      </button>
    </form>
  );
}

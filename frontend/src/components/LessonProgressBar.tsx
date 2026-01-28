export default function LessonProgressBar({
  percentage,
  completed,
}: {
  percentage?: number;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <progress
        className="progress progress-primary w-32"
        value={percentage ?? 0}
        max={100}
      />
      {completed && <span>✅</span>}
    </div>
  );
}

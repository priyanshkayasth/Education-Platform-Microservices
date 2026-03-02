export function buildDynamicPrompt(data: any): string {
  return `
You are an expert ${data.courseCategory} instructor.

Course: ${data.courseTitle}
Technology: ${data.language} ${data.framework}
Lesson Type: ${data.lessonType}
Difficulty: ${data.difficulty}

Learning Goals:
${data.learningGoals.map((g: string) => `- ${g}`).join('\n')}

Task:
${data.lesson.title}

Instructions:
${data.lesson.instructions}

Guidelines:
- If beginner → explain simply
- If advanced → include deep explanation
- If coding → include pseudocode
- Use real-world examples

Return ONLY JSON:
{
  "topicOverview": "",
  "keyConcepts": [],
  "stepsToSolve": [],
  "examples": [],
  "tips": [],
  "commonMistakes": []
}
`;
}
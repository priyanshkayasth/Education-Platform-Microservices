import { GenerateNotesInput } from "../interfaces/generate-notes.input";

export function buildAssignmentPrompt(input: GenerateNotesInput): string {
  return `
You are an expert instructor.

Generate structured study notes.

Assignment Title: ${input.title}
Instructions: ${input.instructions}
Course: ${input.courseTitle}
Difficulty: ${input.difficulty}

IMPORTANT RULES:
- Return ONLY valid JSON
- DO NOT include markdown
- DO NOT include headings like ### or **
- DO NOT include code blocks
- DO NOT include explanations outside JSON
- All fields must be simple text or arrays

Return EXACT format:

{
  "topicOverview": "string",
  "keyConcepts": ["string"],
  "stepsToSolve": ["string"],
  "examples": ["string"],
  "tips": ["string"],
  "commonMistakes": ["string"]
}
REMEMBER: Your entire response must be ONLY the JSON object. No text before or after it.
Start your response with { and end with }
`;
}
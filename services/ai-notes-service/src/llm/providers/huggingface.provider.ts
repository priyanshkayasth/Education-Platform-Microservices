import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GenerateNotesInput } from "../interfaces/generate-notes.input";
import { buildAssignmentPrompt } from "../prompts/assignment.prompt";

@Injectable()
export class HuggingFaceProvider {
    constructor(private configService: ConfigService) { }

    async generateNotes(input: GenerateNotesInput): Promise<any> {
        const HF_TOKEN = this.configService.get<string>('HF_TOKEN')!;
        const HF_URL = this.configService.get<string>('HF_URL')!;
        const HF_MODEL = this.configService.get<string>('HF_MODEL')!;

        //  build dynamic prompt
        const prompt = buildAssignmentPrompt(input);

        const response = await fetch(HF_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                model: HF_MODEL,
                stream: false,
                messages: [
                  {
  role: 'system',
  content: 'You are a helpful AI teacher. You ALWAYS respond with valid JSON only. Never include markdown, explanations, or text outside of JSON. Start your response with { and end with }',
},
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF HTTP Error ${response.status}: ${errText}`);
        }

        const text = await response.text();
        console.log('HF RAW:', text);

        const data = JSON.parse(text);

        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('Invalid HF response: ' + text);
        }

        // clean markdown fences if any
        const cleaned = content
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch (e) {
            console.log('JSON PARSE FAILED, returning raw text');
            return {
                topicOverview: content,
                keyConcepts: [],
                stepsToSolve: [],
                examples: [],
                tips: [],
                commonMistakes: [],
                raw: content
            };
        }
    }
}
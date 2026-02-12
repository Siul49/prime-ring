import { CreateMLCEngine, MLCEngine, type InitProgressCallback } from "@mlc-ai/web-llm";
import { constructDiaryAnalysisPrompt } from "./aiPrompt";

// Using Llama-3.2-3B-Instruct - extremely efficient and capable for local usage
const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

export interface AIAnalysisResult {
    summary: string;
    flow: string[]; // Steps/Timeline
    tips: string;
}

class AiService {
    private engine: MLCEngine | null = null;
    private modelId = SELECTED_MODEL;

    // Initialize the engine (downloads model if not cached)
    async initialize(onProgress: InitProgressCallback) {
        if (!this.engine) {
            this.engine = await CreateMLCEngine(this.modelId, {
                initProgressCallback: onProgress,
                logLevel: "INFO"
            });
        }
        return this.engine;
    }

    async analyzeDiary(content: string, date: Date, onProgress: InitProgressCallback): Promise<AIAnalysisResult> {
        const engine = await this.initialize(onProgress);

        const messages = constructDiaryAnalysisPrompt(content, date);

        const output = await engine.chat.completions.create({
            messages: messages as any,
            temperature: 0.7,
            max_tokens: 1024, // Enough for summary
        });

        const reply = output.choices[0]?.message?.content || "{}";

        try {
            // Attempt to parse JSON. If the model talks before/after JSON, we might need to extract the block.
            // basic fallback: find first { and last }
            const jsonStart = reply.indexOf('{');
            const jsonEnd = reply.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = reply.substring(jsonStart, jsonEnd + 1);
                return JSON.parse(jsonStr);
            }
            throw new Error("Invalid JSON format");
        } catch (e) {
            console.error("AI Parsing Error:", e);
            return {
                summary: "분석을 완료했지만 데이터 형식을 변환하지 못했습니다.",
                flow: ["내용 분석 실패"],
                tips: reply // Return raw text if parsing fails so user sees something
            };
        }
    }
}

export const aiService = new AiService();

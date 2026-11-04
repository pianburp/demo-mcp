import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { OrderSchema } from "./order-schema";

// Asks Gemini for this shape; read-order.ts still checks the result with zod (S2).
const ORDER_JSON_SCHEMA = z.toJSONSchema(OrderSchema);

export type ModelInput = { system: string; message: string };

// A model takes the prompt and the customer message and returns raw text.
// read-order.ts parses and validates that text, so every model is checked the same way.
export interface Model {
  complete(input: ModelInput): Promise<string>;
}

// Returns a fixed answer per message. Used by tests and the default eval run. Costs nothing.
export class FakeModel implements Model {
  constructor(private answers: Record<string, string>) {}

  async complete({ message }: ModelInput): Promise<string> {
    const answer = this.answers[message];
    if (answer === undefined) throw new Error("FakeModel has no answer for this message");
    return answer;
  }
}

// Calls Gemini. Costs money (S6). Key comes from GEMINI_API_KEY.
export class RealModel implements Model {
  private client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  constructor(private model = "gemini-3.8-flash") {}

  async complete({ system, message }: ModelInput): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: message,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        responseJsonSchema: ORDER_JSON_SCHEMA,
      },
    });
    const finish = response.candidates?.[0]?.finishReason;
    if (finish !== "STOP") throw new Error(`Model stopped with ${finish}`);
    return response.text ?? "";
  }
}

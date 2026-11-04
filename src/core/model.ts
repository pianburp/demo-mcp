import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { OrderSchema } from "./order-schema";

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

// Calls Claude. Costs money (S6). Key comes from ANTHROPIC_API_KEY.
export class RealModel implements Model {
  private client = new Anthropic();

  constructor(private model = "claude-opus-5-5") {}

  async complete({ system, message }: ModelInput): Promise<string> {
    const response = await this.client.beta.messages.create({
      model: this.model,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: message }],
      output_config: { effort: "low", format: betaZodOutputFormat(OrderSchema) },
      // On a safety decline, the API retries on a fallback model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    if (response.stop_reason !== "end_turn") {
      throw new Error(`Model stopped with ${response.stop_reason}`);
    }
    return response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  }
}

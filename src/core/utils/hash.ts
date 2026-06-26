import { createHash } from "crypto";

export function hashInput(input: object): string {
  let serialized: string;
  try {
    serialized = JSON.stringify(input);
  } catch {
    serialized = String(input);
  }
  return createHash("sha256").update(serialized).digest("hex");
}

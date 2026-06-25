import { createHash } from "crypto";

export function hashInput(input: object): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

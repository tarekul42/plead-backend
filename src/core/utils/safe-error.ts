export function getErrorMessage(err: unknown, fallback = "Unknown error"): string {
  if (err instanceof Error) return err.message;
  return String(err) || fallback;
}

export function getErrorCode(err: unknown): number | undefined {
  if (err && typeof err === "object" && "code" in err) return (err as { code: number }).code;
  return undefined;
}

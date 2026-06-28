import { ZodError } from "zod";

interface TErrorSources {
  path: string;
  message: string;
}

export const handleZodError = (err: ZodError) => {
  const errorSources: TErrorSources[] = err.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return {
    statusCode: 422,
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    errorSources,
  };
};

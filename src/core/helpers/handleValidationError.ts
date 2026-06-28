import mongoose from "mongoose";

interface TErrorSources {
  path: string;
  message: string;
}

export const handleValidationError = (err: mongoose.Error.ValidationError) => {
  const errorSources: TErrorSources[] = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
      path: val.path,
      message: val.message,
    }),
  );

  return {
    statusCode: 400,
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    errorSources,
  };
};

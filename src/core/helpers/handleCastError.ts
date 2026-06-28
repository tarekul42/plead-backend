import mongoose from "mongoose";

interface TErrorSources {
  path: string;
  message: string;
}

export const handleCastError = (err: mongoose.Error.CastError) => {
  const errorSources: TErrorSources[] = [
    {
      path: err.path,
      message: `Invalid ${err.path}: ${err.value}`,
    },
  ];

  return {
    statusCode: 400,
    code: "INVALID_ID",
    message: "Invalid ID format",
    errorSources,
  };
};

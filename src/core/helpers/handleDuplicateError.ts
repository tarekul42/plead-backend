interface TErrorSources {
  path: string;
  message: string;
}

export const handleDuplicateError = (err: Record<string, unknown>) => {
  const keyValue = err.keyValue as Record<string, unknown> | undefined;
  const keys = keyValue ? Object.keys(keyValue) : [];
  const field = keys.length > 0 ? keys[0] : "field";

  const errorSources: TErrorSources[] = [
    {
      path: field,
      message: `Duplicate value for ${field}`,
    },
  ];

  return {
    statusCode: 409,
    code: "DUPLICATE_KEY",
    message: "Resource already exists",
    errorSources,
  };
};

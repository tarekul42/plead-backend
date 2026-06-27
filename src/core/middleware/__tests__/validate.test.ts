import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().optional(),
  });

  it("calls next without error when validation passes", () => {
    const req = { body: { name: "Alice", age: 30 } };
    const next = jest.fn();

    validate(schema)(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("replaces req[source] with parsed data", () => {
    const req = { body: { name: "  Alice  ", age: "30" } };
    const coerceSchema = z.object({ name: z.string(), age: z.coerce.number() });
    const next = jest.fn();

    validate(coerceSchema)(req as never, {} as never, next);

    expect(req.body).toEqual({ name: "  Alice  ", age: 30 });
  });

  it("calls next with a ValidationError when validation fails", () => {
    const req = { body: { name: "" } };
    const next = jest.fn();

    validate(schema)(req as never, {} as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Validation failed");
    expect(err.details).toBeDefined();
  });

  it("validates the body source by default", () => {
    const req = { body: { name: "Bob" } };
    const next = jest.fn();

    validate(schema)(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("validates the query source when specified", () => {
    const req = { query: { name: "Bob" } };
    const next = jest.fn();

    validate(schema, "query")(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ name: "Bob" });
  });

  it("validates the params source when specified", () => {
    const req = { params: { name: "Bob" } };
    const next = jest.fn();

    validate(schema, "params")(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("reports all validation issues", () => {
    const strictSchema = z.object({
      name: z.string().min(5),
      email: z.string().email(),
    });
    const req = { body: { name: "ab", email: "not-an-email" } };
    const next = jest.fn();

    validate(strictSchema)(req as never, {} as never, next);

    const err = next.mock.calls[0][0];
    expect(err.details.length).toBeGreaterThanOrEqual(2);
  });

  it("does not call next with an error when data is valid", () => {
    const req = { body: { name: "Valid" } };
    const next = jest.fn();

    validate(schema)(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
    expect(next.mock.calls[0][0]).toBeUndefined();
  });
});

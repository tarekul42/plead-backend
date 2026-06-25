export function toDTO<T>(doc: unknown): T {
  if (Array.isArray(doc)) return doc.map((d: any) => stripInternal(d)) as T;
  return stripInternal(doc) as T;
}

function stripInternal(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const { __v, _id, ...rest } = obj._doc || obj;
  return { id: obj._id?.toString(), ...rest };
}

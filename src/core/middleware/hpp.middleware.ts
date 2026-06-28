import hpp from "hpp";

const WHITELISTED_PARAMS = ["sort", "page", "limit", "price", "beds", "baths", "area"];

export const hppMiddleware = hpp({
  whitelist: WHITELISTED_PARAMS,
});

import http from "k6/http";
import { check } from "k6";
import { BASE_URL, API_URL, HEADERS, LEAD_PAYLOAD, PROPERTY_PAYLOAD, THRESHOLDS } from "./shared.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: THRESHOLDS,
};

export default function () {
  const createdIds = [];

  const healthRes = http.get(`${BASE_URL}/health`, { headers: HEADERS });
  check(healthRes, { "health returns 200": (r) => r.status === 200 });

  const listPropsRes = http.get(`${API_URL}/properties`, { headers: HEADERS });
  check(listPropsRes, { "list properties returns 200": (r) => r.status === 200 });

  const listLeadsRes = http.get(`${API_URL}/leads`, { headers: HEADERS });
  check(listLeadsRes, { "list leads returns 200": (r) => r.status === 200 });

  const createLeadRes = http.post(`${API_URL}/leads`, JSON.stringify(LEAD_PAYLOAD), {
    headers: HEADERS,
  });
  check(createLeadRes, { "create lead returns 201": (r) => r.status === 201 });

  const createPropRes = http.post(
    `${API_URL}/properties`,
    JSON.stringify(PROPERTY_PAYLOAD),
    { headers: HEADERS },
  );
  check(createPropRes, { "create property returns 201": (r) => r.status === 201 });
}

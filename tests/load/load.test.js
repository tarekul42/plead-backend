import http from "k6/http";
import { check, sleep, group } from "k6";
import { BASE_URL, API_URL, HEADERS, LEAD_PAYLOAD, PROPERTY_PAYLOAD, THRESHOLDS } from "./shared.js";

export const options = {
  stages: [
    { duration: "1m", target: 25 },
    { duration: "3m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: THRESHOLDS,
};

export default function () {
  group("read-heavy operations", () => {
    const healthRes = http.get(`${BASE_URL}/health`, { headers: HEADERS });
    check(healthRes, { "health is ok": (r) => r.status === 200 });

    const propsRes = http.get(`${API_URL}/properties?page=1&limit=20`, { headers: HEADERS });
    check(propsRes, { "list properties": (r) => r.status === 200 });

    const leadsRes = http.get(`${API_URL}/leads?page=1&limit=20`, { headers: HEADERS });
    check(leadsRes, { "list leads": (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1);

  group("write operations", () => {
    const leadRes = http.post(`${API_URL}/leads`, JSON.stringify(LEAD_PAYLOAD), {
      headers: HEADERS,
    });
    check(leadRes, { "create lead": (r) => r.status === 201 });

    const propRes = http.post(
      `${API_URL}/properties`,
      JSON.stringify(PROPERTY_PAYLOAD),
      { headers: HEADERS },
    );
    check(propRes, { "create property": (r) => r.status === 201 });
  });

  sleep(Math.random() * 3 + 1);
}

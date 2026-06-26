import http from "k6/http";
import { check, sleep } from "k6";
import { API_URL, HEADERS, LEAD_PAYLOAD } from "./shared.js";

export const options = {
  stages: [
    { duration: "2m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const res = http.post(`${API_URL}/leads`, JSON.stringify(LEAD_PAYLOAD), {
    headers: HEADERS,
  });
  check(res, { "lead created or rate-limited": (r) => r.status === 201 || r.status === 429 });

  const listRes = http.get(`${API_URL}/leads?page=1&limit=10`, { headers: HEADERS });
  check(listRes, { "list leads ok": (r) => r.status === 200 });

  sleep(1);
}

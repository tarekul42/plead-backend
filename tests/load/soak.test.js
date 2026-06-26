import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, API_URL, HEADERS, THRESHOLDS } from "./shared.js";

export const options = {
  vus: 100,
  duration: "30m",
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<3000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const endpoints = [
    { url: `${API_URL}/properties?page=1&limit=12`, method: "GET" },
    { url: `${API_URL}/leads?page=1&limit=20`, method: "GET" },
    { url: `${API_URL}/reviews`, method: "GET" },
    { url: `${BASE_URL}/health`, method: "GET" },
    { url: `${API_URL}/interactions`, method: "GET" },
    { url: `${API_URL}/blog`, method: "GET" },
  ];

  const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(ep.url, { headers: HEADERS });
  check(res, { [`GET ${ep.url.split("/").pop()} ok`]: (r) => r.status === 200 });

  sleep(Math.random() * 3 + 1);
}

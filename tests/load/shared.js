export const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
export const API_URL = `${BASE_URL}/api/v1`;

export const HEADERS = {
  "Content-Type": "application/json",
  Authorization: "Bearer test_agent_token",
};

export const LEAD_PAYLOAD = {
  name: "Test Lead",
  email: "test@example.com",
  phone: "+1-555-0100",
  budget: 500000,
  preferredLocation: "Austin, TX",
  propertyType: "house",
  bedsDesired: 3,
  bathsDesired: 2,
  source: "load-test",
  assignedAgentId: "507f1f77bcf86cd799439011",
};

export const PROPERTY_PAYLOAD = {
  title: "Load Test Property",
  description: "A property created during load testing to simulate real-world usage patterns.",
  price: 450000,
  location: "Austin, TX",
  address: "123 Load Test Blvd, Austin, TX 73301",
  images: ["https://example.com/test.jpg"],
  beds: 3,
  baths: 2,
  area: 1800,
  propertyType: "house",
  assignedAgentId: "507f1f77bcf86cd799439011",
};

export function checkStatus(res, expectedStatus = 200) {
  return res.status === expectedStatus;
}

export const THRESHOLDS = {
  http_req_duration: ["p(95)<500", "p(99)<1500"],
  http_req_failed: ["rate<0.01"],
};

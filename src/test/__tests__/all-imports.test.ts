describe("all module imports (models, routes, index files)", () => {
  it("loads all models", () => {
    expect(() => {
      require("../../modules/users/users.model");
      require("../../modules/agencies/agencies.model");
      require("../../modules/properties/properties.model");
      require("../../modules/leads/leads.model");
      require("../../modules/interactions/interactions.model");
      require("../../modules/reviews/reviews.model");
      require("../../modules/blogs/blogs.model");
      require("../../modules/ai/models/ai-analysis.model");
      require("../../modules/ai/models/ai-copy.model");
    }).not.toThrow();
  });

  it("loads all routes", () => {
    expect(() => {
      require("../../modules/users/users.routes");
      require("../../modules/agencies/agencies.routes");
      require("../../modules/properties/properties.routes");
      require("../../modules/leads/leads.routes");
      require("../../modules/interactions/interactions.routes");
      require("../../modules/reviews/reviews.routes");
      require("../../modules/blogs/blogs.routes");
      require("../../modules/ai/ai.routes");
      require("../../modules/admin/admin.routes");
      require("../../modules/webhooks/webhooks.routes");
    }).not.toThrow();
  });

  it("loads all barrel exports", () => {
    expect(() => {
      require("../../core/types/common.types");
      require("../../modules/users");
      require("../../modules/agencies");
      require("../../modules/properties");
      require("../../modules/leads");
      require("../../modules/interactions");
      require("../../modules/reviews");
      require("../../modules/blogs");
      require("../../modules/ai");
      require("../../modules/admin");
      require("../../modules/webhooks");
    }).not.toThrow();
  });

  it("loads all validation files", () => {
    expect(() => {
      require("../../modules/users/users.validation");
      require("../../modules/agencies/agencies.validation");
      require("../../modules/properties/properties.validation");
      require("../../modules/leads/leads.validation");
      require("../../modules/interactions/interactions.validation");
      require("../../modules/reviews/reviews.validation");
      require("../../modules/blogs/blogs.validation");
      require("../../modules/ai/ai.validation");
    }).not.toThrow();
  });

  it("loads all prompts", () => {
    expect(() => {
      require("../../modules/ai/prompts/match-engine.prompts");
      require("../../modules/ai/prompts/outreach-email.prompts");
      require("../../modules/ai/prompts/property-description.prompts");
    }).not.toThrow();
  });
});

jest.mock("@clerk/express", () => ({
  requireAuth: jest.fn(() => (req: any, _res: any, next: any) => next()),
  createClerkClient: jest.fn(() => ({
    users: {
      getUser: jest.fn().mockResolvedValue({
        emailAddresses: [{ id: "email_1", emailAddress: "auto@test.com" }],
        primaryEmailAddressId: "email_1",
        firstName: "Auto",
        lastName: "Created",
      }),
    },
  })),
}));

jest.mock("../../../modules/users", () => ({
  UsersService: {
    getByClerkId: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../../modules/agencies/agencies.model", () => ({
  AgencyModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { UsersService } = jest.requireMock("../../../modules/users");
const { AgencyModel } = jest.requireMock("../../../modules/agencies/agencies.model");
const { requireAuth, clearUserCache } = jest.requireActual("../auth.middleware");

describe("debug3", () => {
  it("debugs auto-create", async () => {
    clearUserCache();
    
    const req = { auth: () => ({ userId: "clerk_new" }), user: undefined } as any;
    const res = {} as any;
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue(null);
    AgencyModel.findOne.mockResolvedValue({ _id: "662a1f77bcf86cd799439044" });
    UsersService.create.mockResolvedValue({
      _id: { toString: () => "662a1f77bcf86cd799439033" },
      clerkId: "clerk_new",
      email: "auto@test.com",
      name: "Auto Created",
      role: "agent",
      agencyId: { toString: () => "662a1f77bcf86cd799439044" },
      isActive: true,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);
    
    if (next.mock.calls.length > 0) {
      const err = next.mock.calls[0][0];
      if (err instanceof Error) {
        console.log("Error:", err.message);
      } else {
        console.log("Error (no message):", typeof err);
      }
    }
    console.log("UsersService.create calls:", UsersService.create.mock.calls.length);
    console.log("AgencyModel.findOne calls:", AgencyModel.findOne.mock.calls.length);
  });
});

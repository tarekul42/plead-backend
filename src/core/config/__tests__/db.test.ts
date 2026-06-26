const mockMongoose = {
  set: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    on: jest.fn(),
  },
};

jest.mock("mongoose", () => mockMongoose);

const mockLogger = {
  warn: jest.fn(),
  fatal: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("../../utils/logger", () => ({ logger: mockLogger }));

describe("connectDB / closeDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("connects successfully on first attempt", async () => {
    mockMongoose.connect.mockResolvedValue(undefined);
    const { connectDB } = require("../db");
    await connectDB();
    expect(mockMongoose.connect).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith("MongoDB connected");
  });

  it("retries on failure and succeeds", async () => {
    mockMongoose.connect
      .mockRejectedValueOnce(new Error("first fail"))
      .mockResolvedValueOnce(undefined);
    const { connectDB } = require("../db");
    await connectDB();
    expect(mockMongoose.connect).toHaveBeenCalledTimes(2);
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("throws after exhausting retries", async () => {
    mockMongoose.connect.mockRejectedValue(new Error("persistent fail"));
    const { connectDB } = require("../db");
    await expect(connectDB()).rejects.toThrow("persistent fail");
    expect(mockMongoose.connect).toHaveBeenCalledTimes(3);
    expect(mockLogger.fatal).toHaveBeenCalled();
  });

  it("closeDB disconnects", async () => {
    mockMongoose.disconnect.mockResolvedValue(undefined);
    const { closeDB } = require("../db");
    await closeDB();
    expect(mockMongoose.disconnect).toHaveBeenCalledTimes(1);
  });

  it("registers connection event handlers", async () => {
    mockMongoose.connect.mockResolvedValue(undefined);
    const { connectDB } = require("../db");
    await connectDB();
    expect(mockMongoose.connection.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mockMongoose.connection.on).toHaveBeenCalledWith("disconnected", expect.any(Function));
  });
});

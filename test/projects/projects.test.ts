import supertest from "supertest";
import app from "../../src/app";
import { jwtDecode } from "jwt-decode";
import { sign } from "cookie-signature";
import { Project } from "../../src/models/project-model";
import { queryInput } from "./input";
import { projectQueryResult, successOutput } from "./output";

const request = supertest(app);

// MOCK VARIABLE TEST
const tokenSample = "testtoken";
const decodedTokenSample = { userId: "16hoiqwu12jo1nejo1" };

// Mock the jwt-decode
jest.mock("jwt-decode");

describe("GET /project", () => {
  describe("If the project is exist", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should return status 200 & a list of projects", async () => {
      (jwtDecode as jest.Mock).mockReturnValue(decodedTokenSample);
      const findSpy = jest.spyOn(Project, "find").mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([projectQueryResult]),
      } as never);
      jest.spyOn(Project, "countDocuments").mockResolvedValue(1);

      const response = await request
        .get("/project")
        .set(
          "Cookie",
          `jwtk=s:${sign(tokenSample, process.env.COOKIE_SECRET_KEY as string)}`
        )
        .query(queryInput);

      expect(jwtDecode).toHaveBeenCalledWith(tokenSample);
      expect(findSpy).toHaveBeenCalledWith({
        title: { $regex: /Test/gi },
      });
      expect(Project.find().limit).toHaveBeenCalledWith(1); // limit
      expect(Project.find().skip).toHaveBeenCalledWith(0); // (page - 1) * limit
      expect(Project.find().exec).toHaveBeenCalled();
      expect(Project.countDocuments).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(successOutput);
    });
  });
});

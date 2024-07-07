import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models/user-model";
import bcrypt from "bcryptjs";
import * as jwtUtils from "../../src/libs/create-jwt";

// INPUT TESTING =================================================
import {
  correctSignupInput,
  invalidSignupPassword,
  invalidSignupEmail,
  invalidSignupUsername,
} from "./input";

// OUTPUT TESTING =================================================
import { authResult, userQueryResult } from "./output";

describe("POST /auth/signup", () => {
  describe("Given correct input", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should return status 201 & a json object", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt" as never);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword" as never);
      jest.spyOn(User.prototype, "save").mockResolvedValue(userQueryResult);
      jest.spyOn(jwtUtils, "createJwt").mockReturnValue("fakeToken");

      const response = await request(app)
        .post("/auth/signup")
        .send(correctSignupInput);

      expect(User.findOne).toHaveBeenCalledWith({
        email: correctSignupInput.email,
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        correctSignupInput.password,
        "salt"
      );
      expect(User.prototype.save).toHaveBeenCalled();
      expect(jwtUtils.createJwt).toHaveBeenCalledWith(
        {
          userId: userQueryResult._id,
        },
        { expiresIn: "1d" }
      );
      expect(jwtUtils.createJwt).toHaveBeenCalledWith(
        {
          userId: userQueryResult._id,
        },
        { expiresIn: "90d" }
      );
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        message: "Sign up successfully",
        token: "fakeToken",
        refreshToken: "fakeToken",
        body: authResult,
      });
    });
  });

  describe("Given invalid password length", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should return status 400 & a json object", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt" as never);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword" as never);
      jest.spyOn(User.prototype, "save").mockResolvedValue(userQueryResult);
      jest.spyOn(jwtUtils, "createJwt").mockReturnValue("fakeToken");

      const response = await request(app)
        .post("/auth/signup")
        .send(invalidSignupPassword);

      expect(User.findOne).toHaveBeenCalledWith({
        email: invalidSignupPassword.email,
      });
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.prototype.save).not.toHaveBeenCalled();
      expect(jwtUtils.createJwt).not.toHaveBeenCalled();
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Password must be at least 6 characters!",
        stack: expect.any(String),
      });
    });
  });

  describe("Given invalid email format", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should return status 400 & a json object", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt" as never);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword" as never);
      jest.spyOn(User.prototype, "save").mockResolvedValue(userQueryResult);
      jest.spyOn(jwtUtils, "createJwt").mockReturnValue("fakeToken");

      const response = await request(app)
        .post("/auth/signup")
        .send(invalidSignupEmail);

      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.prototype.save).not.toHaveBeenCalled();
      expect(jwtUtils.createJwt).not.toHaveBeenCalled();
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Invalid email!",
        stack: expect.any(String),
      });
    });
  });

  describe("Given invalid username", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test.each(invalidSignupUsername)(
      "should return status 400 & a json object",
      async ({ input, output }) => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);
        jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt" as never);
        jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword" as never);
        jest.spyOn(User.prototype, "save").mockResolvedValue(userQueryResult);
        jest.spyOn(jwtUtils, "createJwt").mockReturnValue("fakeToken");

        const response = await request(app).post("/auth/signup").send(input);

        expect(User.findOne).not.toHaveBeenCalled();
        expect(bcrypt.genSalt).not.toHaveBeenCalled();
        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(User.prototype.save).not.toHaveBeenCalled();
        expect(jwtUtils.createJwt).not.toHaveBeenCalled();
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(output);
      }
    );
  });
});

describe("POST /auth/login", () => {
  describe("Given correct input", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("Should return status 200 & json object", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(userQueryResult);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      jest.spyOn(jwtUtils, "createJwt").mockReturnValue("fakeToken");

      const response = await request(app).post("/auth/login").send({
        username: "test user",
        password: "testpass",
      });

      expect(User.findOne).toHaveBeenCalledWith({
        username: "test user",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "testpass",
        userQueryResult.password
      );
      expect(jwtUtils.createJwt).toHaveBeenCalledWith(
        {
          userId: userQueryResult._id,
        },
        { expiresIn: "1d" }
      );
      expect(jwtUtils.createJwt).toHaveBeenCalledWith(
        {
          userId: userQueryResult._id,
        },
        { expiresIn: "90d" }
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        message: "Login successfullly",
        token: "fakeToken",
        refreshToken: "fakeToken",
        body: authResult,
      });
    });
  });
});

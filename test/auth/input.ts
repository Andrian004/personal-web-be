export const correctSignupInput = {
  username: "test user",
  email: "test@example.com",
  password: "testpass",
};

export const invalidSignupPassword = {
  username: "testuser",
  email: "test@example.com",
  password: "test", // password must be at least 6 characters
};

export const invalidSignupEmail = {
  username: "testuser",
  email: "test", // email must be in the correct format
  password: "testpass",
};

export const invalidSignupUsername = [
  {
    input: {
      username: "@#test%123 --iu12", // username must be alphanumeric
      email: "test@example.com",
      password: "testpass",
    },
    output: {
      message: "Username must be alphanumeric!",
      stack: expect.any(String),
    },
  },
  {
    input: {
      username: "p", // username must be at least 3 characters
      email: "test@example.com",
      password: "testpass",
    },
    output: {
      message:
        "Username must have at least 3 characters and max of 25 characters!",
      stack: expect.any(String),
    },
  },
  {
    input: {
      username: "This is an example of username", // max 25 char
      email: "test@example.com",
      password: "testpass",
    },
    output: {
      message:
        "Username must have at least 3 characters and max of 25 characters!",
      stack: expect.any(String),
    },
  },
];

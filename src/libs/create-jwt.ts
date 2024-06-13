import { sign, JwtPayload } from "jsonwebtoken";

export const createJwt = (payload: JwtPayload) => {
  const token = sign(payload, process.env.SECRET_KEY as string, {
    expiresIn: "30d",
  });
  return token;
};

import { sign, JwtPayload, SignOptions } from "jsonwebtoken";

export const createJwt = (payload: JwtPayload, options?: SignOptions) => {
  const token = sign(payload, process.env.SECRET_KEY as string, options);
  return token;
};

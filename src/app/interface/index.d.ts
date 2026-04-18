import { JwtPayload } from "jsonwebtoken";

// this is a global interface for the express request object
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

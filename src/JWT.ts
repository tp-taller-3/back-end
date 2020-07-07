import { User } from "./models";
import { Environment } from "./config/Environment";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";
import { ICurrentUser } from "./graphql/Context";
import { AuthConfig } from "./config/AuthConfig";

let JWT_SECRET: string;
if (["test", "development", "test_travis"].includes(Environment.NODE_ENV)) {
  JWT_SECRET = "Environment.JWT_SECRET";
} else {
  if (!Environment.JWT_SECRET) throw new Error("JWT_SECRET not set");
  JWT_SECRET = Environment.JWT_SECRET;
}

export const JWT = {
  createToken: async (user: User) => {
    const admin = await user.getAdmin();
    const applicant = await user.getApplicant();
    const companyUser = await user.getCompanyUser();
    const payload = {
      uuid: user.uuid,
      email: user.email,
      ...(admin?.userUuid && { admin: { userUuid: admin.userUuid } }),
      ...(applicant?.uuid && { applicant: { uuid: applicant.uuid } }),
      ...(companyUser?.companyUuid && { company: { uuid: companyUser.companyUuid } })
    };

    return sign(
      payload,
      JWT_SECRET,
      { expiresIn: AuthConfig.JWT.expiresIn }
    );
  },
  decodeToken: (token: string): ICurrentUser | undefined => {
    try {
      return verify(token, JWT_SECRET) as ICurrentUser;
    } catch (e) {
      return;
    }
  },
  applyMiddleware: ({ app }: { app: Application }) => {
    app.use(
      jwt({
        secret: JWT_SECRET,
        credentialsRequired: false,
        algorithms: AuthConfig.JWT.algorithms
      })
    );
  },
  extractTokenPayload: (token: string): ICurrentUser | undefined => JWT.decodeToken(token)
};

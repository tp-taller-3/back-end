import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { User, UserNotFoundError, UserRepository } from "$models/User";
import { JWT } from "$src/JWT";
import { Context } from "$graphql/Context";
import { CookieConfig, Database } from "$config";
import { FiubaCredentials } from "$models/User/Credentials";
import { Applicant } from "$models";
import { ApplicantNotFound, ApplicantRepository } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { ApplicantCapabilityRepository } from "$models/ApplicantCapability";

export const fiubaLogin = {
  type: Boolean,
  args: {
    dni: {
      type: nonNull(String)
    },
    password: {
      type: nonNull(String)
    }
  },
  resolve: async (_: undefined, { dni, password }: ILogin, { res: expressResponse }: Context) => {
    const credentials = new FiubaCredentials(dni);
    await credentials.authenticate(password);

    let user: User;
    try {
      user = await UserRepository.findFiubaUserByDni(dni);
    } catch (error) {
      if (!(error instanceof UserNotFoundError)) throw error;
      user = new User({
        name: "",
        surname: "",
        email: "",
        credentials: new FiubaCredentials(dni)
      });
    }

    await Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      let applicant: Applicant;
      try {
        applicant = await ApplicantRepository.findByUserUuid(user.uuid || "");
      } catch (error) {
        if (!(error instanceof ApplicantNotFound)) throw error;

        applicant = new Applicant({
          padron: 1,
          description: "",
          userUuid: user.uuid,
          approvalStatus: ApprovalStatus.approved
        });
        await ApplicantRepository.save(applicant, transaction);
        await ApplicantCareersRepository.bulkCreate(
          [{ careerCode: "1", isGraduate: true }],
          applicant,
          transaction
        );
        await ApplicantCapabilityRepository.update([], applicant, transaction);
      }
    });

    const token = await JWT.createToken(user, "login");
    expressResponse.cookie(CookieConfig.cookieName, token, CookieConfig.cookieOptions);
  }
};

interface ILogin {
  dni: string;
  password: string;
}

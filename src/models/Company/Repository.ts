import { Database } from "../../config/Database";
import { Company, ICompany, ICompanyEditable } from "./index";
import { CompanyPhotoRepository } from "../CompanyPhoto";
import { CompanyPhoneNumberRepository } from "../CompanyPhoneNumber";
import { CompanyNotFoundError, CompanyNotUpdatedError } from "./Errors";
import { UserRepository } from "../User";
import { ApprovalStatus } from "../ApprovalStatus";
import { CompanyUserRepository } from "../CompanyUser/Repository";
import { CompanyApprovalEventRepository } from "./CompanyApprovalEvent";

export const CompanyRepository = {
  create: (
    {
      phoneNumbers = [],
      photos = [],
      user: userAttributes,
      ...companyAttributes
    }: ICompany
  ) => Database.transaction(async transaction => {
    const user = await UserRepository.create(userAttributes, transaction);
    const company = await Company.create(companyAttributes, { transaction: transaction });
    await CompanyUserRepository.create(company, user, transaction);
    await CompanyPhotoRepository.bulkCreate(photos, company, transaction);
    await CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company, transaction);
    return company;
  }),
  update: async (
    {
      uuid,
      phoneNumbers,
      photos,
      ...companyAttributes
    }: ICompanyEditable
  ) => {
    const [, [updatedCompany]] = await Company.update(companyAttributes, {
      where: { uuid },
      returning: true
    });
    if (!updatedCompany) throw new CompanyNotFoundError(uuid);

    return updatedCompany;
  },
  updateApprovalStatus: (
    adminUserUuid: string,
    companyUuid: string,
    status: ApprovalStatus
  ) => Database.transaction(async transaction => {
    const [numberOfUpdatedCompanies, [updatedCompany]] = await Company.update(
      { approvalStatus: status },
      { where: { uuid: companyUuid }, returning: true, transaction }
    );
    if (numberOfUpdatedCompanies !== 1) throw new CompanyNotUpdatedError(companyUuid);

    await CompanyApprovalEventRepository.create({
      adminUserUuid,
      company: updatedCompany,
      status: status,
      transaction
    });
    return updatedCompany;
  }),
  findByUuid: async (uuid: string) => {
    const company = await Company.findByPk(uuid);
    if (!company) throw new CompanyNotFoundError(uuid);

    return company;
  },
  findAll: async () => {
    return Company.findAll();
  },
  truncate: () => Company.truncate({ cascade: true })
};

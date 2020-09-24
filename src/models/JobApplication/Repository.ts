import { Database } from "$config";
import { Applicant, JobApplication, Offer } from "$models";
import { IUpdateApprovalStatus } from "./Interfaces";
import { JobApplicationApprovalEventRepository } from "./JobApplicationsApprovalEvent";
import { JobApplicationNotFoundError } from "./Errors";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { PaginationQuery } from "../PaginationQuery";

export const JobApplicationRepository = {
  apply: async ({ uuid: applicantUuid }: Applicant, { uuid: offerUuid }: Offer) =>
    JobApplication.create({ offerUuid, applicantUuid }),
  hasApplied: async (applicant: Applicant, offer: Offer) => {
    const jobApplication = await JobApplication.findOne({
      where: {
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      }
    });
    return jobApplication != null;
  },
  findByUuid: async (uuid: string) => {
    const jobApplication = await JobApplication.findByPk(uuid);
    if (!jobApplication) throw new JobApplicationNotFoundError(uuid);
    return jobApplication;
  },
  findLatestByCompanyUuid: async ({
    companyUuid,
    updatedBeforeThan
  }: {
    companyUuid: string;
    updatedBeforeThan?: IPaginatedInput;
  }) => {
    return PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => JobApplication.findAll(options),
      order: [
        ["updatedAt", "DESC"],
        ["offerUuid", "DESC"],
        ["applicantUuid", "DESC"]
      ],
      include: [
        {
          model: Offer,
          where: { companyUuid },
          attributes: []
        }
      ]
    });
  },
  updateApprovalStatus: async ({
    admin: { userUuid: adminUserUuid },
    uuid,
    status
  }: IUpdateApprovalStatus) =>
    Database.transaction(async transaction => {
      const [, [updatedJobApplication]] = await JobApplication.update(
        { approvalStatus: status },
        { where: { uuid }, returning: true, transaction }
      );
      if (!updatedJobApplication) throw new JobApplicationNotFoundError(uuid);

      await JobApplicationApprovalEventRepository.create({
        adminUserUuid,
        jobApplicationUuid: uuid,
        status,
        transaction
      });
      return updatedJobApplication;
    }),
  truncate: () => JobApplication.truncate({ cascade: true })
};

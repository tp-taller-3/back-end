import { List } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { ICompanyUser } from "../../Context";

export const getMyLatestJobApplications = {
  type: List(GraphQLJobApplication),
  resolve: async (_: undefined, __: undefined, { currentUser }: { currentUser: ICompanyUser }) =>
    JobApplicationRepository.findLatestByCompanyUuid(currentUser.company.uuid)
};

import { ID, nonNull } from "$graphql/fieldTypes";
import { JobApplicationRepository } from "$models/JobApplication";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { IAdminUser } from "$graphql/Context";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminRepository } from "$models/Admin";

export const updateJobApplicationApprovalStatus = {
  type: GraphQLJobApplication,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    }
  },
  resolve: async (
    _: undefined,
    { uuid, approvalStatus }: IUpdateJobApplicationApprovalStatusArguments,
    { currentUser }: { currentUser: IAdminUser }
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.admin.userUuid);
    return JobApplicationRepository.updateApprovalStatus({
      adminUserUuid: currentUser.admin.userUuid,
      uuid,
      secretary: admin.secretary,
      status: approvalStatus
    });
  }
};

interface IUpdateJobApplicationApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}

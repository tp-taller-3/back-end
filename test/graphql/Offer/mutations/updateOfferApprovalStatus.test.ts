import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import { client } from "../../ApolloTestClient";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { CompanyRepository } from "$models/Company";
import { Offer } from "$models";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { OfferGenerator } from "$test/generators/Offer";
import { OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { Secretary } from "$models/Admin";
import { OfferNotUpdatedError } from "$models/Offer/Errors";

const UPDATE_OFFER_APPROVAL_STATUS = gql`
  mutation($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateOfferApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      uuid
      extensionApprovalStatus
      graduadosApprovalStatus
    }
  }
`;

const APPROVAL_STATUS_DEFAULT_VALUE = "pending";

describe("updateOfferApprovalStatus", () => {
  let offer: Offer;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    const company = await CompanyGenerator.instance.withMinimumData();
    offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
  });

  beforeEach(() => OfferApprovalEventRepository.truncate());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_OFFER_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const secretaryColumn = (secretary: Secretary) => {
    let changedColumn: string;
    let unchangedColumn: string;
    if (secretary === Secretary.graduados) {
      changedColumn = "graduadosApprovalStatus";
      unchangedColumn = "extensionApprovalStatus";
    } else {
      changedColumn = "extensionApprovalStatus";
      unchangedColumn = "graduadosApprovalStatus";
    }
    return [changedColumn, unchangedColumn];
  };

  const expectToUpdateStatusAndLogEvent = async (
    newStatus: ApprovalStatus,
    secretary: Secretary
  ) => {
    const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
    const dataToUpdate = { uuid: offer.uuid, approvalStatus: newStatus };
    const { data, errors } = await performMutation(apolloClient, dataToUpdate);
    const [changedColumn, unchangedColumn] = secretaryColumn(secretary);
    expect(errors).toBeUndefined();
    expect(data!.updateOfferApprovalStatus).toEqual({
      uuid: offer.uuid,
      [`${changedColumn}`]: newStatus,
      [`${unchangedColumn}`]: APPROVAL_STATUS_DEFAULT_VALUE
    });
    expect(await OfferApprovalEventRepository.findAll()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          adminUserUuid: admin.userUuid,
          offerUuid: offer.uuid,
          status: newStatus
        })
      ])
    );
  };

  it("approves an offer and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(ApprovalStatus.approved, Secretary.graduados);
  });

  it("rejects an offer and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(ApprovalStatus.rejected, Secretary.graduados);
  });

  it("set an offer to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(ApprovalStatus.pending, Secretary.graduados);
  });

  it("throws an error if no user is logged in", async () => {
    const apolloClient = client.loggedOut();
    const dataToUpdate = {
      uuid: offer.uuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
  });

  it("throws an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const dataToUpdate = {
      uuid: offer.uuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("throws an error if the current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const dataToUpdate = {
      uuid: offer.uuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("throws an error if the offer does not exists", async () => {
    const nonExistentOfferUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = {
      uuid: nonExistentOfferUuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotUpdatedError.name
    });
  });

  it("throws an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = {
      uuid: offer.uuid,
      approvalStatus: "invalidApprovalStatus"
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).not.toBeUndefined();
  });
});

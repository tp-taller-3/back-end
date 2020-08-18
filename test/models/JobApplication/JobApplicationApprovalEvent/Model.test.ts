import { ValidationError } from "sequelize";
import { JobApplicationApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("JobApplicationApprovalEvent", () => {
  const expectToCreateAValidEventWithStatus = async (status: ApprovalStatus) => {
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent({
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status
    });
    await expect(jobApplicationApprovalEvent.validate()).resolves.not.toThrow();
  };

  const expectToCreateAnEventWithTheGivenAttributes = async (status: ApprovalStatus) => {
    const attributes = {
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status
    };
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent(attributes);
    expect(jobApplicationApprovalEvent).toEqual(expect.objectContaining(attributes));
  };

  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    const attributes = {
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: ApprovalStatus.pending
    };
    delete attributes[attribute];
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent(attributes);
    await expect(jobApplicationApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: JobApplicationApprovalEvent.${attribute} cannot be null`
    );
  };

  it("creates a valid JobApplicationApprovalEvent with pending status", async () => {
    await expectToCreateAValidEventWithStatus(ApprovalStatus.pending);
  });

  it("creates a valid JobApplicationApprovalEvent with approved status", async () => {
    await expectToCreateAValidEventWithStatus(ApprovalStatus.approved);
  });

  it("creates a valid JobApplicationApprovalEvent with rejected status", async () => {
    await expectToCreateAValidEventWithStatus(ApprovalStatus.rejected);
  });

  it("creates an event with the given attributes and pending status", async () => {
    await expectToCreateAnEventWithTheGivenAttributes(ApprovalStatus.pending);
  });

  it("creates an event with the given attributes and approved status", async () => {
    await expectToCreateAnEventWithTheGivenAttributes(ApprovalStatus.approved);
  });

  it("creates an event with the given attributes and rejected status", async () => {
    await expectToCreateAnEventWithTheGivenAttributes(ApprovalStatus.rejected);
  });

  it("creates an event with undefined timestamps", async () => {
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent({
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: ApprovalStatus.pending
    });
    expect(jobApplicationApprovalEvent.createdAt).toBeUndefined();
    expect(jobApplicationApprovalEvent.updatedAt).toBeUndefined();
  });

  it("throws an error if no offerUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("offerUuid");
  });

  it("throws an error if no applicantUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("applicantUuid");
  });

  it("throws an error if no adminUserUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("adminUserUuid");
  });

  it("throws an error if no status is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("status");
  });
});

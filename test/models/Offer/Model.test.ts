import { NumberIsTooSmallError, SalaryRangeError } from "validations-fiuba-laboral-v2";
import { ValidationError } from "sequelize";
import { Offer } from "$models/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("Offer", () => {
  const offerAttributes = {
    companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
    title: "title",
    description: "description",
    hoursPerDay: 8,
    minimumSalary: 52500,
    maximumSalary: 70000
  };

  const offerWithoutProperty = async (property: string) => {
    const offerAttributesWithoutProperty = offerAttributes;
    delete offerAttributesWithoutProperty[property];
    return offerAttributesWithoutProperty;
  };

  it("creates a valid offer", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer with default extensionApprovalStatus", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    await expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer with default graduadosApprovalStatus", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    await expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("throws an error if offer does not belong to any company", async () => {
    const offer = new Offer({ ...offerAttributes, companyUuid: null });
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer does not has a title", async () => {
    const offer = new Offer(offerWithoutProperty("title"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer does not has a description", async () => {
    const offer = new Offer(offerWithoutProperty("description"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer does not has a hoursPerDay", async () => {
    const offer = new Offer(offerWithoutProperty("hoursPerDay"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer has negative hoursPerDay", async () => {
    const offer = new Offer({ ...offerAttributes, hoursPerDay: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if offer does not has a minimumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("minimumSalary"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer has negative minimumSalary", async () => {
    const offer = new Offer({ ...offerAttributes, minimumSalary: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if offer does not has a maximumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("maximumSalary"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer has negative maximumSalary", async () => {
    const offer = new Offer({ ...offerAttributes, maximumSalary: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if minimumSalary if bigger than maximumSalary", async () => {
    const offer = new Offer({
      ...offerAttributes,
      minimumSalary: 100,
      maximumSalary: 50
    });
    await expect(offer.validate()).rejects.toThrow(SalaryRangeError.buildMessage());
  });

  it("throws an error if graduadosApprovalStatus isn't a ApprovalStatus enum value", async () => {
    const offer = new Offer({
      ...offerAttributes,
      graduadosApprovalStatus: "pepito"
    });
    await expect(offer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: ApprovalStatus must be one of these values: pending,approved,rejected"
    );
  });
});

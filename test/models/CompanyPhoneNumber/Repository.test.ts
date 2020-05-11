import { DatabaseError, ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import Database from "../../../src/config/Database";
import { Company, CompanyRepository } from "../../../src/models/Company";
import {
  CompanyPhoneNumber,
  CompanyPhoneNumberRepository
} from "../../../src/models/CompanyPhoneNumber";
import { UserRepository } from "../../../src/models/User";
import { UserMocks } from "../User/mocks";
import { companyMocks } from "../Company/mocks";

describe("CompanyPhoneNumberRepository", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  it("creates several phoneNumbers for the same company", async () => {
    const phoneNumbers = ["1144444444", "1155555555", "1166666666"];
    const company = await CompanyRepository.create(companyMocks.companyData());
    await expect(
      CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company)
    ).resolves.not.toThrow();
  });

  it("throws an error if a phone number is repeated in a bulk create", async () => {
    const phoneNumbers = ["1144444444", "1144444444", "1166666666"];
    const company = await CompanyRepository.create(companyMocks.companyData());
    await expect(
      CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company)
    ).rejects.toThrow(UniqueConstraintError);
  });

  it("throws an error if a company has already the same phoneNumber", async () => {
    const phoneNumber = "1144444444";
    const company = await CompanyRepository.create(companyMocks.companyData());
    await CompanyPhoneNumberRepository.create(phoneNumber, company);
    await expect(CompanyPhoneNumberRepository.create(
      phoneNumber, company)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("throws a database constraint error if phoneNumber is very large", async () => {
    const company = await CompanyRepository.create(companyMocks.companyData());
    const phoneNumber = new CompanyPhoneNumber({
      companyUuid: company.uuid,
      phoneNumber: "0".repeat(300)
    });
    await expect(
      phoneNumber.save({ validate: false })
    ).rejects.toThrowErrorWithMessage(
      DatabaseError, "value too long for type character varying(255)"
    );
  });

  it("throws an error if company does not exist", async () => {
    const notSavedCompany = new Company({
      uuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    await expect(
      CompanyPhoneNumberRepository.create("1144444444", notSavedCompany)
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      "insert or update on table \"CompanyPhoneNumbers\" violates foreign " +
      "key constraint \"CompanyPhoneNumbers_companyUuid_fkey\""
    );
  });

  it("truncates phoneNumber by cascade when we remove its company", async () => {
    const company = await CompanyRepository.create({
      ...companyMocks.companyData(),
      cuit: "30711819017"
    });
    await CompanyRepository.create({
      ...companyMocks.companyData(),
      user: { ...UserMocks.userAttributes, email: "asd@asd.asd" },
      cuit: "30701307115"
    });
    await CompanyRepository.create({
      ...companyMocks.companyData(),
      user: { ...UserMocks.userAttributes, email: "qwe@qwe.qwe" },
      cuit: "30703088534"
    });
    await CompanyPhoneNumberRepository.create("1144444444", company);
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
    await company.destroy();
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(0);
  });

  it("does not truncate phoneNumber by cascade when we remove another company", async () => {
    const company = await CompanyRepository.create(companyMocks.companyData());
    const anotherCompany = await CompanyRepository.create({
      ...companyMocks.companyData(),
      user: { ...UserMocks.userAttributes, email: "qwe@qwe.qwe" },
      cuit: "23390691939"
    });
    await CompanyPhoneNumberRepository.create("(011) 44444444", company);
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
    await anotherCompany.destroy();
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
  });
});

import { findAdminTasksQuery } from "$models/AdminTask/findAdminTasksQuery";
import { WhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";
import { AdminTaskType } from "$models/AdminTask";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "$models/AdminTask/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { Applicant, ApplicantCareer, JobApplication } from "$models";

describe("findAdminTasksQuery", () => {
  it("throws an error if no adminTaskTypes are provided", async () => {
    expect(() =>
      findAdminTasksQuery({
        adminTaskTypes: [],
        statuses: [ApprovalStatus.pending],
        limit: 100,
        secretary: Secretary.graduados
      })
    ).toThrowErrorWithMessage(
      AdminTaskTypesIsEmptyError,
      AdminTaskTypesIsEmptyError.buildMessage()
    );
  });

  it("throws an error if no statuses are provided", async () => {
    expect(() =>
      findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.Applicant],
        statuses: [],
        limit: 150,
        secretary: Secretary.graduados
      })
    ).toThrowErrorWithMessage(StatusesIsEmptyError, StatusesIsEmptyError.buildMessage());
  });

  describe("all adminTasks", () => {
    const expectToReturnSQLQueryOfAllAdminTasksWithStatus = (
      status: ApprovalStatus | ApprovalStatus[],
      secretary: Secretary,
      updatedBeforeThan?: IPaginatedInput
    ) => {
      const limit = 15;
      const statuses = [status].flat();
      const adminTaskTypes = [
        AdminTaskType.Applicant,
        AdminTaskType.Company,
        AdminTaskType.Offer,
        AdminTaskType.JobApplication
      ];
      const query = findAdminTasksQuery({
        adminTaskTypes,
        statuses,
        limit,
        secretary,
        ...(updatedBeforeThan && { updatedBeforeThan })
      });

      const expectedQuery = `
      WITH "AdminTask" AS (
        SELECT COALESCE (
          Applicants."tableNameColumn",
          Companies."tableNameColumn",
          Offers."tableNameColumn",
          JobApplications."tableNameColumn"
        ) AS "tableNameColumn",
        COALESCE (
            Applicants."uuid",
            Companies."uuid",
            Offers."uuid",
            JobApplications."uuid"
        ) AS "uuid",
        COALESCE (Applicants."padron") AS "padron",
        COALESCE (
          Applicants."description",
          Companies."description",
          Offers."description"
        ) AS "description",
        COALESCE (Applicants."userUuid") AS "userUuid",
        COALESCE (
            Applicants."approvalStatus",
            Companies."approvalStatus",
            JobApplications."approvalStatus"
        ) AS "approvalStatus",
        COALESCE (
            Applicants."createdAt",
            Companies."createdAt",
            Offers."createdAt",
            JobApplications."createdAt"
        ) AS "createdAt",
        COALESCE (
            Applicants."updatedAt",
            Companies."updatedAt",
            Offers."updatedAt",
            JobApplications."updatedAt"
        ) AS "updatedAt",
        COALESCE (Companies."cuit") AS "cuit",
        COALESCE (Companies."companyName") AS "companyName",
        COALESCE (Companies."businessName") AS "businessName",
        COALESCE (Companies."slogan") AS "slogan",
        COALESCE (Companies."logo") AS "logo",
        COALESCE (Companies."website") AS "website",
        COALESCE (Companies."email") AS "email",
        COALESCE (Offers."companyUuid") AS "companyUuid",
        COALESCE (Offers."title") AS "title",
        COALESCE (Offers."extensionApprovalStatus") AS "extensionApprovalStatus",
        COALESCE (Offers."graduadosApprovalStatus") AS "graduadosApprovalStatus",
        COALESCE (Offers."hoursPerDay") AS "hoursPerDay",
        COALESCE (Offers."minimumSalary") AS "minimumSalary",
        COALESCE (Offers."maximumSalary") AS "maximumSalary",
        COALESCE (Offers."targetApplicantType") AS "targetApplicantType",
        COALESCE (JobApplications."applicantUuid") AS "applicantUuid",
        COALESCE (JobApplications."offerUuid") AS "offerUuid"
        FROM (
          (
            SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants"
          ) AS Applicants
          FULL OUTER JOIN
          (
            SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies"
          ) AS Companies
          ON FALSE FULL OUTER JOIN
          (
            SELECT *, 'Offers' AS "tableNameColumn" FROM "Offers"
          ) AS Offers
          ON FALSE FULL OUTER JOIN
          (
            SELECT *, 'JobApplications' AS "tableNameColumn" FROM "JobApplications"
          ) AS JobApplications
          ON FALSE
        )
      )
      SELECT * FROM "AdminTask"
      WHERE ${WhereClauseBuilder.build({
        statuses,
        secretary,
        updatedBeforeThan,
        adminTaskTypes
      })}
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
      expect(query).toEqualIgnoringSpacing(expectedQuery);
    };

    it("returns an sql query of adminTasks in pending status for extension secretary", async () => {
      expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.pending, Secretary.extension);
    });

    it("returns an sql query of adminTasks in pending status for graduados secretary", async () => {
      expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.pending, Secretary.graduados);
    });

    it("returns an sql query of adminTasks in approved status for extension secretary", async () => {
      expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.approved, Secretary.extension);
    });

    it("returns an sql query of adminTasks in approved status for graduados secretary", async () => {
      expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.approved, Secretary.graduados);
    });

    it("returns an sql query of adminTasks in rejected status for extension secretary", async () => {
      expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.rejected, Secretary.extension);
    });

    it("returns an sql query of adminTasks in rejected status for graduados secretary", async () => {
      expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.rejected, Secretary.graduados);
    });

    it("returns an sql query of adminTasks in all statuses for graduados secretary", async () => {
      const statuses = [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected];

      expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.graduados);
    });

    it("returns an sql query of adminTasks in all statuses for extension secretary", async () => {
      const statuses = [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected];

      expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.extension);
    });

    it("optionally filters by maximum updatedAt (not inclusive)", async () => {
      const statuses = [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected];

      expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.extension, {
        dateTime: new Date("1995-12-17T03:24:00Z"),
        uuid: "ec45bb65-6076-45ea-b5e2-844334c3238e"
      });
    });

    it("returns an sql query of adminTasks in approved and rejected statuses for extension secretary", async () => {
      const statuses = [ApprovalStatus.approved, ApprovalStatus.rejected];

      expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.extension);
    });

    it("returns an sql query of adminTasks in approved and rejected statuses for graduados secretary", async () => {
      const statuses = [ApprovalStatus.approved, ApprovalStatus.rejected];

      expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.graduados);
    });
  });

  describe("query only for companies", () => {
    const expectToReturnSQLQueryOfCompaniesWithStatus = (status: ApprovalStatus) => {
      const limit = 50;
      const secretary = Secretary.graduados;
      const query = findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.Company],
        statuses: [status],
        limit,
        secretary
      });
      const expectedQuery = `
      WITH "AdminTask" AS
        (
          SELECT
            COALESCE(Companies."uuid") AS "uuid",
            COALESCE(Companies."cuit") AS "cuit",
            COALESCE(Companies."companyName") AS "companyName",
            COALESCE (Companies."businessName") AS "businessName",
            COALESCE(Companies."slogan") AS "slogan",
            COALESCE(Companies."description") AS "description",
            COALESCE(Companies."logo") AS "logo",
            COALESCE(Companies."website") AS "website",
            COALESCE(Companies."email") AS "email",
            COALESCE(Companies."approvalStatus") AS "approvalStatus",
            COALESCE(Companies."createdAt") AS "createdAt",
            COALESCE(Companies."updatedAt") AS "updatedAt",
            COALESCE(Companies."tableNameColumn") AS "tableNameColumn"
          FROM (SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies") AS Companies
        )
      SELECT * FROM "AdminTask"
      WHERE ("AdminTask"."approvalStatus" = '${status}')
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
      expect(query).toEqualIgnoringSpacing(expectedQuery);
    };

    it("returns an sql query of Companies in pending status", async () => {
      expectToReturnSQLQueryOfCompaniesWithStatus(ApprovalStatus.pending);
    });

    it("returns an sql query of Companies in approved status", async () => {
      expectToReturnSQLQueryOfCompaniesWithStatus(ApprovalStatus.approved);
    });

    it("returns an sql query of Companies in rejected status", async () => {
      expectToReturnSQLQueryOfCompaniesWithStatus(ApprovalStatus.rejected);
    });
  });

  describe("query only for applicants", () => {
    const expectToReturnSQLQueryOfApplicantsWithStatus = (status: ApprovalStatus) => {
      const limit = 75;
      const secretary = Secretary.graduados;
      const query = findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.Applicant],
        statuses: [status],
        limit,
        secretary
      });
      const expectedQuery = `
      WITH "AdminTask" AS
        (
          SELECT
            COALESCE(Applicants."uuid") AS "uuid",
            COALESCE(Applicants."description") AS "description",
            COALESCE(Applicants."approvalStatus") AS "approvalStatus",
            COALESCE(Applicants."createdAt") AS "createdAt",
            COALESCE(Applicants."updatedAt") AS "updatedAt",
            COALESCE(Applicants."tableNameColumn") AS "tableNameColumn",
            COALESCE(Applicants."padron") AS "padron",
            COALESCE(Applicants."userUuid") AS "userUuid"
          FROM (SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants") AS Applicants
        )
      SELECT * FROM "AdminTask"
      WHERE
        ("AdminTask"."approvalStatus" = '${status}')
        AND
        (
            "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
            OR EXISTS(
              SELECT *
              FROM "${ApplicantCareer.tableName}"
              WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
            )
        )
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
      expect(query).toEqualIgnoringSpacing(expectedQuery);
    };

    it("returns an sql query of Applicants in pending status", async () => {
      expectToReturnSQLQueryOfApplicantsWithStatus(ApprovalStatus.pending);
    });

    it("returns an sql query of Applicants in approved status", async () => {
      expectToReturnSQLQueryOfApplicantsWithStatus(ApprovalStatus.approved);
    });

    it("returns an sql query of Applicants in rejected status", async () => {
      expectToReturnSQLQueryOfApplicantsWithStatus(ApprovalStatus.rejected);
    });
  });

  describe("query only for offers", () => {
    const expectToReturnSQLQueryOfOfferWithStatus = (
      status: ApprovalStatus,
      secretary: Secretary
    ) => {
      const limit = 75;
      const query = findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.Offer],
        statuses: [status],
        limit,
        secretary
      });
      const expectedQuery = `
      WITH "AdminTask" AS (
        SELECT  COALESCE ( Offers."tableNameColumn" ) AS "tableNameColumn",
          COALESCE ( Offers."uuid" ) AS "uuid",
          COALESCE ( Offers."companyUuid" ) AS "companyUuid",
          COALESCE ( Offers."title" ) AS "title",
          COALESCE ( Offers."description" ) AS "description",
          COALESCE ( Offers."extensionApprovalStatus" ) AS "extensionApprovalStatus",
          COALESCE ( Offers."graduadosApprovalStatus" ) AS "graduadosApprovalStatus",
          COALESCE ( Offers."hoursPerDay" ) AS "hoursPerDay",
          COALESCE ( Offers."minimumSalary" ) AS "minimumSalary",
          COALESCE ( Offers."maximumSalary" ) AS "maximumSalary",
          COALESCE ( Offers."targetApplicantType" ) AS "targetApplicantType",
          COALESCE ( Offers."createdAt" ) AS "createdAt",
          COALESCE ( Offers."updatedAt" ) AS "updatedAt"
        FROM (SELECT *, 'Offers' AS "tableNameColumn" FROM "Offers" ) AS Offers
      )
      SELECT * FROM "AdminTask"
      WHERE ${WhereClauseBuilder.build({
        statuses: [status],
        secretary,
        adminTaskTypes: [AdminTaskType.Offer]
      })}
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
      expect(query).toEqualIgnoringSpacing(expectedQuery);
    };

    it("returns an sql query of Offer in pending status for extension secretary", async () => {
      expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.pending, Secretary.extension);
    });

    it("returns an sql query of Offer in approved status for extension secretary", async () => {
      expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.approved, Secretary.extension);
    });

    it("returns an sql query of Offer in rejected status for extension secretary", async () => {
      expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.rejected, Secretary.extension);
    });

    it("returns an sql query of Offer in pending status for graduados secretary", async () => {
      expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.pending, Secretary.graduados);
    });

    it("returns an sql query of Offer in approved status for graduados secretary", async () => {
      expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.approved, Secretary.graduados);
    });

    it("returns an sql query of Offer in rejected status for graduados secretary", async () => {
      expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.rejected, Secretary.graduados);
    });
  });

  describe("query only for jobApplications", () => {
    const expectToReturnSQLQueryOfJobApplicationsWithStatus = (
      status: ApprovalStatus,
      secretary: Secretary
    ) => {
      const limit = 75;
      const query = findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.JobApplication],
        statuses: [status],
        limit,
        secretary
      });
      const expectedQuery = `
      WITH "AdminTask" AS (
        SELECT  COALESCE (JobApplications."tableNameColumn") AS "tableNameColumn",
          COALESCE (JobApplications."uuid") AS "uuid",
          COALESCE (JobApplications."applicantUuid") AS "applicantUuid",
          COALESCE (JobApplications."offerUuid") AS "offerUuid",
          COALESCE (JobApplications."approvalStatus") AS "approvalStatus",
          COALESCE (JobApplications."createdAt") AS "createdAt",
          COALESCE (JobApplications."updatedAt") AS "updatedAt"
        FROM (
            SELECT *, 'JobApplications' AS "tableNameColumn" FROM "JobApplications"
        ) AS JobApplications
      )
      SELECT * FROM "AdminTask"
      WHERE (
        "AdminTask"."approvalStatus" = '${status}'
        AND
        (
          "AdminTask"."tableNameColumn" != '${JobApplication.tableName}'
          OR ${secretary === Secretary.graduados ? "" : "NOT"} EXISTS(
            SELECT *
            FROM "${ApplicantCareer.tableName}"
            WHERE "applicantUuid" = "AdminTask"."applicantUuid" AND "isGraduate" = true
        )
      )
      )
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
      expect(query).toEqualIgnoringSpacing(expectedQuery);
    };

    it("returns an sql query of JobApplication in pending status for extension secretary", async () => {
      expectToReturnSQLQueryOfJobApplicationsWithStatus(
        ApprovalStatus.pending,
        Secretary.extension
      );
    });

    it("returns an sql query of JobApplication in approved status for extension secretary", async () => {
      expectToReturnSQLQueryOfJobApplicationsWithStatus(
        ApprovalStatus.approved,
        Secretary.extension
      );
    });

    it("returns an sql query of JobApplication in rejected status for extension secretary", async () => {
      expectToReturnSQLQueryOfJobApplicationsWithStatus(
        ApprovalStatus.rejected,
        Secretary.extension
      );
    });

    it("returns an sql query of JobApplication in pending status for graduados secretary", async () => {
      expectToReturnSQLQueryOfJobApplicationsWithStatus(
        ApprovalStatus.pending,
        Secretary.graduados
      );
    });

    it("returns an sql query of JobApplication in approved status for graduados secretary", async () => {
      expectToReturnSQLQueryOfJobApplicationsWithStatus(
        ApprovalStatus.approved,
        Secretary.graduados
      );
    });

    it("returns an sql query of JobApplication in rejected status for graduados secretary", async () => {
      expectToReturnSQLQueryOfJobApplicationsWithStatus(
        ApprovalStatus.rejected,
        Secretary.graduados
      );
    });
  });
});

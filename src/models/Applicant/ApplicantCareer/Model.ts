import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { Applicant, Career } from "$models";
import {
  ForbiddenApprovedSubjectCountError,
  ForbiddenCurrentCareerYearError,
  MissingApprovedSubjectCountError,
  MissingCurrentCareerYearError
} from "./Errors";
import { BOOLEAN, HasOneGetAssociationMixin, INTEGER, STRING, UUID } from "sequelize";
import { isUuid, optional } from "$models/SequelizeModelValidators";
import { Nullable } from "$models/SequelizeModel";
import { validateCareerYear, validateIntegerInRange } from "validations-fiuba-course-admin";

@Table({
  tableName: "ApplicantCareers",
  validate: {
    validateApplicantCareer(this: ApplicantCareer) {
      this.validateApplicantCareer();
    }
  },
  timestamps: true
})
export class ApplicantCareer extends Model<ApplicantCareer> {
  @ForeignKey(() => Career)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: STRING,
    references: { model: Career.tableName, key: "code" },
    onDelete: "CASCADE"
  })
  public careerCode: string;

  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: UUID,
    references: { model: Applicant.tableName, key: "uuid" },
    onDelete: "CASCADE",
    ...isUuid
  })
  public applicantUuid: string;

  @Column({
    allowNull: true,
    type: INTEGER,
    ...optional(validateCareerYear)
  })
  public currentCareerYear: Nullable<number>;

  @Column({
    allowNull: true,
    type: INTEGER,
    ...optional(validateIntegerInRange({ min: { value: 0, include: true } }))
  })
  public approvedSubjectCount: Nullable<number>;

  @Column({
    allowNull: false,
    type: BOOLEAN
  })
  public isGraduate: boolean;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @BelongsTo(() => Career, "careerCode")
  public career: Career;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getCareer!: HasOneGetAssociationMixin<Career>;
  public getApplicant!: HasOneGetAssociationMixin<Applicant>;

  public validateApplicantCareer() {
    if (this.isGraduate) {
      if (this.approvedSubjectCount) throw new ForbiddenApprovedSubjectCountError();
      if (this.currentCareerYear) throw new ForbiddenCurrentCareerYearError();
    } else {
      if (!this.approvedSubjectCount) throw new MissingApprovedSubjectCountError();
      if (!this.currentCareerYear) throw new MissingCurrentCareerYearError();
    }
  }
}

import { BelongsTo, Column, ForeignKey, Is, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Applicant } from "../..";
import { validateURL } from "validations-fiuba-course-admin";
import { STRING, UUID } from "sequelize";

@Table({ tableName: "ApplicantsLinks" })
export class ApplicantLink extends Model<ApplicantLink> {
  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant)
  public applicant: Applicant;

  @PrimaryKey
  @Column({
    allowNull: false,
    type: STRING
  })
  public name: string;

  @Is(validateURL)
  @Column({
    allowNull: false,
    type: STRING
  })
  public url: string;
}

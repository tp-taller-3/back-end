import { Column, CreatedAt, Is, Model, Table, UpdatedAt } from "sequelize-typescript";
import { INTEGER, UUID, UUIDV4 } from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { validateIntegerInRange } from "validations-fiuba-course-admin";

@Table({ tableName: "Semesters", timestamps: true })
export class Semester extends Model<Semester> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
    ...isUuid
  })
  public uuid: string;

  @Is("year", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public year: number;

  @Is(
    "semesterNumber",
    validateIntegerInRange({ min: { value: 0, include: true }, max: { value: 2, include: true } })
  )
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public semesterNumber: number;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}

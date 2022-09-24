import { Column, CreatedAt, ForeignKey, Is, Model, Table, UpdatedAt } from "sequelize-typescript";
import { INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { validateIntegerInRange } from "validations-fiuba-course-admin";
import { Semester } from "$models/Semester";

@Table({ tableName: "Departments", timestamps: true })
export class Department extends Model<Department> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
    ...isUuid
  })
  public uuid: string;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public name: string;

  @Is("leadDNI", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public leadDNI: number;

  @ForeignKey(() => Semester)
  @Column({ allowNull: false, type: UUID })
  public semesterUuid: string;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}

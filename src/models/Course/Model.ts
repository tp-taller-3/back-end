import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Is,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { validateIntegerInRange } from "validations-fiuba-course-admin";
import { Department } from "$models/Department";

@Table({ tableName: "Courses", timestamps: true })
export class Course extends Model<Course> {
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

  @ForeignKey(() => Department)
  @Column({ allowNull: false, type: UUID })
  public departmentUuid: string;

  @BelongsTo(() => Department, "departmentUuid")
  public department: Department;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}

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
import { ENUM, INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { validateIntegerInRange } from "validations-fiuba-course-admin";
import { TeacherRole, teacherRoles } from "$models/TeacherRole";
import { isTeacherRole } from "$models/SequelizeModelValidators/isTeacherRole";
import { Course } from "$models/Course";

@Table({ tableName: "Teachers", timestamps: true })
export class Teacher extends Model<Teacher> {
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

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: teacherRoles }),
    ...isTeacherRole
  })
  public role: TeacherRole;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public fullName: string;

  @Is("dni", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public dni: number;

  @ForeignKey(() => Course)
  @Column({ allowNull: true, type: UUID })
  public courseUuid: string;

  @BelongsTo(() => Course, "courseUuid")
  public course: Course;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}

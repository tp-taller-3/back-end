import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { TEXT, UUID, UUIDV4 } from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { Semester, Teacher } from "$src/models";

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

  @ForeignKey(() => Semester)
  @Column({ allowNull: false, type: UUID })
  public semesterUuid: string;

  @BelongsTo(() => Semester, "semesterUuid")
  public semester: Semester;

  @HasMany(() => Teacher)
  public teachers: Teacher[];

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}

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
import {
  BOOLEAN,
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  TEXT,
  UUID,
  UUIDV4
} from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { Course } from "$models/Course";
import { Answer } from "$src/models";
import { Teacher } from "$models/Teacher";

@Table({ tableName: "Questions", timestamps: true })
export class Question extends Model<Question> {
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
    type: BOOLEAN
  })
  public isPublic: boolean;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public questionText: string;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public category: string;

  @ForeignKey(() => Teacher)
  @Column({ allowNull: true, type: UUID })
  public teacherUuid: string;

  @BelongsTo(() => Teacher, "teacherUuid")
  public teacher: Teacher;

  public getTeacher: HasOneGetAssociationMixin<Teacher>;

  @ForeignKey(() => Course)
  @Column({ allowNull: false, type: UUID })
  public courseUuid: string;

  @BelongsTo(() => Course, "courseUuid")
  public course: Course;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @HasMany(() => Answer)
  public answers: Answer[];

  public getAnswers: HasManyGetAssociationsMixin<Answer>;
}

import { Column, CreatedAt, ForeignKey, Is, Model, Table, UpdatedAt } from "sequelize-typescript";
import { INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";
import { isUuid } from "../SequelizeModelValidators";
import { validateIntegerInRange } from "validations-fiuba-course-admin";
import { Question } from "$models/Question";

@Table({ tableName: "Answers", timestamps: true })
export class Answer extends Model<Answer> {
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
  public value: string;

  @Is("count", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public count: number;

  @ForeignKey(() => Question)
  @Column({ allowNull: false, type: UUID })
  public questionUuid: string;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}

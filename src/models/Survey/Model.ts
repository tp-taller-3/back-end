import { Column, Model, Table } from "sequelize-typescript";
import { TEXT, UUID, UUIDV4 } from "sequelize";

@Table({ tableName: "Surveys" })
export class Survey extends Model<Survey> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4 })
  public uuid: string;

  @Column({ allowNull: false, type: TEXT })
  public name: string;
}

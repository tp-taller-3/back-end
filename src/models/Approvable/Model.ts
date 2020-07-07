import { Applicant } from "..";
import { Company } from "..";

export const TABLE_NAME_COLUMN = "tableNameColumn";
export type ApprovableModelsType = typeof Applicant | typeof Company;
export const APPROVABLE_MODELS = [
  Applicant,
  Company
];
export type Approvable = Applicant | Company;
export enum ApprovableEntityType {
  Applicant = "Applicant",
  Company = "Company"
}
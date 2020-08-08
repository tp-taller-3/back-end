import { IVariables } from "./interfaces";
import { IOfferAttributes } from "$models/Offer/Interface";

export const withObligatoryData = (
  {
    index,
    companyUuid,
    careers,
    sections
  }: IVariables
): IOfferAttributes => {
  const data = {
    companyUuid,
    title: `title${index}`,
    description: `description${index}`,
    hoursPerDay: index + 1,
    minimumSalary: index + 1,
    maximumSalary: 2 * index + 1,
    careers,
    sections
  };
  if (!careers) delete data.careers;
  if (!sections) delete data.sections;
  return data;
};

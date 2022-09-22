import { IFindAll } from "./Interface";
import { PaginationQuery } from "$models/PaginationQuery";
import { Survey } from "$models";
import { Transaction } from "sequelize";
import { SurveyNotFoundError } from "$models/Survey/Errors";

export const SurveyRepository = {
  save: (survey: Survey, transaction?: Transaction) => survey.save({ transaction }),
  findByUuid: async (uuid: string) => {
    const survey = await Survey.findByPk(uuid);
    if (!survey) throw new SurveyNotFoundError(uuid);
    return survey;
  },
  findAll: ({ createdBeforeThan }: IFindAll) => {
    return PaginationQuery.findLatest({
      updatedBeforeThan: createdBeforeThan,
      timestampKey: "createdAt",
      query: options => Survey.findAll(options)
    });
  },
  truncate: () => Survey.truncate({ cascade: true })
};

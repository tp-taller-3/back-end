import { ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLSurvey } from "../Types/GraphQLSurvey";
import { Survey } from "$models";
import { SurveyRepository } from "$models/Survey";

export const saveSurvey = {
  type: GraphQLSurvey,
  args: {
    uuid: {
      type: ID
    },
    name: {
      type: nonNull(String)
    }
  },
  resolve: async (_: undefined, { uuid, name }: ISaveSurvey) => {
    let survey: Survey;
    if (uuid) {
      survey = await SurveyRepository.findByUuid(uuid);
    } else {
      survey = new Survey({ name });
    }
    SurveyRepository.save(survey);
    return survey;
  }
};

export interface ISaveSurvey {
  uuid: string;
  name: string;
}

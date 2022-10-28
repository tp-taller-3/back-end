import { Transaction } from "sequelize";
import { Answer } from "./Model";

export const AnswerRepository = {
  save: (answer: Answer, transaction?: Transaction) => answer.save({ transaction }),
  findByQuestionUuidAndAnswerValue: async (questionUuid: string, answerValue: string) =>
    Answer.findOne({ where: { questionUuid: questionUuid, value: answerValue } }),
  deleteById: (uuid: string) => Answer.destroy({ where: { uuid: uuid } })
};

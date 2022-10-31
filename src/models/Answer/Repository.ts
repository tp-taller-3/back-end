import { Transaction } from "sequelize";
import { Answer } from "./Model";
import { QueryTypes } from "sequelize";
import { Database } from "$config";

export const AnswerRepository = {
  save: (answer: Answer, transaction?: Transaction) => answer.save({ transaction }),
  findByQuestionUuidAndAnswerValue: async (questionUuid: string, answerValue: string) =>
    Answer.findOne({ where: { questionUuid: questionUuid, value: answerValue } }),
  deleteById: (uuid: string) => Answer.destroy({ where: { uuid: uuid } }),
  deleteBySemesterUuid: (semesterUuid: string, transaction: Transaction) => {
    Database.sequelize.query(
      `
      DELETE
      FROM "Answers" 
      WHERE "Answers"."questionUuid" IN (SELECT "Questions"."uuid"
                         FROM "Questions" 
                         INNER JOIN "Courses" ON "Questions"."courseUuid" = "Courses"."uuid"
                             WHERE "Courses"."semesterUuid" = '${semesterUuid}')
      `,
      {
        type: QueryTypes.DELETE,
        model: Answer,
        transaction: transaction
      }
    );
  }
};

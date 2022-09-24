import { Question } from "./Model";
import { Course, Department } from "$models";
import { Op } from "sequelize";

export const QuestionRepository = {
  findByCourseUuid: async ({
    courseUuid,
    currentUserDNI
  }: {
    courseUuid: string;
    currentUserDNI: string;
  }) =>
    Question.findAll({
      include: [
        {
          model: Course,
          attributes: [],
          include: [
            {
              model: Department,
              attributes: []
            }
          ]
        }
      ],
      where: {
        courseUuid,
        [Op.or]: [
          {
            isPublic: true
          },
          {
            "$course.leadDNI$": currentUserDNI
          },
          {
            "$course->department.leadDNI$": currentUserDNI
          }
        ]
      }
    })
};

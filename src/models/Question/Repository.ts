import { Question } from "./Model";
import { Course, Department } from "$models";
import { Op } from "sequelize";

export const QuestionRepository = {
  findByCourseUuid: async ({
    courseUuid,
    currentUserDNI
  }: {
    courseUuid: string;
    currentUserDNI?: string | null;
  }) => {
    const orClause: any = [
      {
        isPublic: true
      }
    ];

    if (currentUserDNI) {
      orClause.push({ "$course.leadDNI$": currentUserDNI });
      orClause.push({ "$course->department.leadDNI$": currentUserDNI });
    }

    return Question.findAll({
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
        [Op.or]: orClause
      }
    });
  }
};

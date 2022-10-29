import { Answer } from "$models/Answer";
import { AnswerRepository } from "$models/Answer/Repository";
import { Course } from "$models/Course";
import { CourseRepository } from "$models/Course/Repository";
import { Question } from "$models/Question";
import { QuestionRepository } from "$models/Question/Repository";
import { Semester, SemesterRepository } from "$models/Semester";
import { Teacher } from "$models/Teacher";
import { TeacherRepository } from "$models/Teacher/Repository";
import { TeacherRole } from "$models/TeacherRole";
import { answersCsvColumns, teachersCsvColumns } from "../csvConstants";
import { PUBLIC_ANSWERS_WHITELIST } from "./PublicAnswersWhitelist";

export const csvBulkUpsert = async (answers, teachers, year: number, semesterNumber: number) => {
  const savedSemesters = new Set();
  const savedCourses = new Set();
  const savedTeachers = new Set();
  const savedQuestions = new Set();
  const savedAnswers = new Set();
  try {
    const semester = await getOrCreateSemester(year, semesterNumber);
    await SemesterRepository.save(semester);
    savedSemesters.add(semester.uuid);
    for (const answer of answers) {
      const course = await getOrCreateCourseByName(
        answer[answersCsvColumns.EvaluatedConcept],
        semester
      );
      let teacher;
      if (isEvaluatedElementATeacher(answer[answersCsvColumns.EvaluatedElement])) {
        teacher = await getOrCreateTeacherByFullName(
          answer[answersCsvColumns.EvaluatedElement],
          course
        );
      }
      const question = await getOrCreateQuestion(
        answer[answersCsvColumns.Question],
        answer[answersCsvColumns.Block],
        teacher,
        course,
        answer[answersCsvColumns.AnswerValue]
      );
      const answerEntity = await getOrCreateAnswer(question, answer[answersCsvColumns.AnswerValue]);
      answerEntity.count += 1;
      await CourseRepository.save(course);
      savedCourses.add(course.uuid);
      if (teacher) {
        await TeacherRepository.save(teacher);
        savedTeachers.add(teacher.uuid);
      }
      await QuestionRepository.save(question);
      savedQuestions.add(question.uuid);
      await AnswerRepository.save(answerEntity);
      savedAnswers.add(answerEntity.uuid);
    }
    for (const teacherRow of teachers) {
      const teacher = await getOrCreateTeacherByFullName(teacherRow[teachersCsvColumns.Name], null);
      teacher.dni = teacherRow[teachersCsvColumns.Dni];
      await TeacherRepository.save(teacher);
      savedTeachers.add(teacher.uuid);
    }
  } catch (err) {
    await rollbackCsv(savedSemesters, savedCourses, savedTeachers, savedQuestions, savedAnswers);
    throw err;
  }
};

const rollbackCsv = async (
  savedSemesters,
  savedCourses,
  savedTeachers,
  savedQuestions,
  savedAnswers
) => {
  for (const uuid of savedAnswers) {
    await AnswerRepository.deleteById(uuid);
  }
  for (const uuid of savedQuestions) {
    await QuestionRepository.deleteById(uuid);
  }
  for (const uuid of savedTeachers) {
    await TeacherRepository.deleteById(uuid);
  }
  for (const uuid of savedCourses) {
    await CourseRepository.deleteById(uuid);
  }
  for (const uuid of savedSemesters) {
    await SemesterRepository.deleteById(uuid);
  }
};

const getOrCreateAnswer = async (question: Question, answerValue: string) => {
  let answer = await AnswerRepository.findByQuestionUuidAndAnswerValue(question.uuid, answerValue);
  if (!answer) {
    answer = new Answer();
    answer.value = answerValue;
    answer.count = 0;
    answer.questionUuid = question.uuid;
  }
  return answer;
};

const getOrCreateQuestion = async (
  questionText: string,
  category: string,
  teacher: Teacher,
  course: Course,
  answerValue: string
) => {
  let question = await QuestionRepository.findByCourseTeacherCategoryAndQuestionText(
    questionText,
    category,
    teacher === undefined ? null : teacher.uuid,
    course.uuid
  );
  if (!question) {
    question = new Question();
    question.isPublic = isPublic(teacher, category, answerValue);
    question.questionText = questionText;
    question.category = category;
    if (teacher) {
      question.teacher = teacher;
      question.teacherUuid = teacher.uuid;
    }
    question.course = course;
    question.courseUuid = course.uuid;
  }
  if (question.isPublic) {
    // Siempre rechequeo que siga siendo publica la pregunta segun todas las respuestas que me hicieron.
    // Sino puede pasar el caso que en la primer fila que agarre sea una pregunta de campo libre me respondan un "Si",
    // y pase el whitelist pero no era publica en realidad
    question.isPublic = isPublic(teacher, category, answerValue);
  }
  return question;
};

const getOrCreateSemester = async (year: number, semesterNumber: number) => {
  let semester = await SemesterRepository.findByYearAndSemesterNumber(year, semesterNumber);
  if (!semester) {
    semester = new Semester();
    semester.year = year;
    semester.semesterNumber = semesterNumber;
  }
  return semester;
};

const getOrCreateCourseByName = async (name: string, semester: Semester) => {
  let course = await CourseRepository.findByCourseNameIfExists(name);
  if (!course) {
    course = new Course();
    course.name = name;
    course.semester = semester;
    course.semesterUuid = semester.uuid;
  }
  return course;
};

const getOrCreateTeacherByFullName = async (fullName: string, course: any) => {
  let teacher = await TeacherRepository.findByFullNameIfExists(fullName);
  if (!teacher) {
    teacher = new Teacher();
    teacher.name = getNameFromFullName(fullName);
    teacher.role = getTeacherRoleFromFullName(fullName);
    teacher.fullName = fullName;
    if (course) {
      teacher.course = course;
      teacher.courseUuid = course.uuid;
    }
  }
  return teacher;
};

const getNameFromFullName = (fullName: string) => {
  const endIndex = fullName.indexOf("(") - 1; // There is a space before the '('
  if (endIndex < 0) {
    throw { code: "MISSING_ROLE_ON_FULLNAME", fullName: fullName };
  }
  return fullName.substring(0, endIndex);
};

const getTeacherRoleFromFullName = (fullName: string) => {
  const role = fullName.substring(fullName.indexOf("(") + 1, fullName.indexOf(")"));
  switch (role) {
    case "Ayudante 1ro/a":
      return TeacherRole.ayudante;
    case "Jefe/a Trabajos Practicos":
      return TeacherRole.jtp;
    case "Titular":
      return TeacherRole.titular;
    default:
      throw { code: "UNRECOGNIZED_TEACHER_ROLE", fullName: fullName, role: role };
  }
};

const isEvaluatedElementATeacher = (evaluatedElement: string) => {
  try {
    getTeacherRoleFromFullName(evaluatedElement);
    return true;
  } catch (err) {
    return false;
  }
};

const isPublic = (teacher: Teacher, category: string, answerValue: string) => {
  return (
    teacher === undefined &&
    category !== "CUERPO DOCENTE" &&
    PUBLIC_ANSWERS_WHITELIST.includes(answerValue)
  );
};

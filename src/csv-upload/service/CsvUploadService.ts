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
import { answersCsvColumns, csvFileName, teachersCsvColumns } from "../csvConstants";
import { CsvUploadErrorCodes } from "../csvUploadErrorCodes";
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
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const file = csvFileName.Answers;
      const course = await getOrCreateCourseByNameAndSemester(
        answer[answersCsvColumns.EvaluatedConcept],
        semester
      );
      let teacher;
      if (isEvaluatedElementATeacher(answer[answersCsvColumns.Block])) {
        teacher = await getOrCreateTeacherByFullNameAndCourse(
          answer[answersCsvColumns.EvaluatedElement],
          course,
          i,
          file
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
    for (let i = 0; i < teachers.length; i++) {
      const teacher = await getTeacherByFullNameAndSemester(
        teachers[i][teachersCsvColumns.Name],
        semester,
        i,
        csvFileName.Teachers
      );
      teacher.dni = teachers[i][teachersCsvColumns.Dni];
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

const getOrCreateCourseByNameAndSemester = async (name: string, semester: Semester) => {
  let course = await CourseRepository.findByCourseNameAndSemesterIfExists(name, semester.uuid);
  if (!course) {
    course = new Course();
    course.name = name;
    course.semester = semester;
    course.semesterUuid = semester.uuid;
  }
  return course;
};

const getOrCreateTeacherByFullNameAndCourse = async (
  fullName: string,
  course: Course,
  line: number,
  file: string
) => {
  let teacher = await TeacherRepository.findByFullNameAndCourseUuidIfExists(fullName, course.uuid);
  if (!teacher) {
    teacher = new Teacher();
    teacher.name = getNameFromFullName(fullName, line, file);
    teacher.role = getTeacherRoleFromFullName(fullName, line, file);
    teacher.fullName = fullName;
    teacher.course = course;
    teacher.courseUuid = course.uuid;
  }
  return teacher;
};

const formatLine = (line: number) => line + 2;

const getTeacherByFullNameAndSemester = async (
  fullName: string,
  semester: Semester,
  line: number,
  file: string
) => {
  const teacher = await TeacherRepository.findByFullNameAndSemesterUuid(fullName, semester.uuid);
  if (!teacher) {
    throw {
      code: CsvUploadErrorCodes.TeacherWithoutCourse,
      fullName: fullName,
      line: formatLine(line),
      file: file
    };
  }
  return teacher;
};

const getNameFromFullName = (fullName: string, line: number, file: string) => {
  const endIndex = fullName.indexOf("(") - 1; // There is a space before the '('
  if (endIndex < 0) {
    throw {
      code: CsvUploadErrorCodes.MissingRoleOnFullname,
      fullName: fullName,
      line: line + 2,
      file: file
    };
  }
  return fullName.substring(0, endIndex);
};

const getTeacherRoleFromFullName = (fullName: string, line: number, file: string) => {
  const role = fullName.substring(fullName.indexOf("(") + 1, fullName.indexOf(")"));
  switch (role) {
    case "Ayudante 1ro/a":
      return TeacherRole.ayudante;
    case "Jefe/a Trabajos Practicos":
      return TeacherRole.jtp;
    case "Titular":
      return TeacherRole.titular;
    default:
      throw {
        code: CsvUploadErrorCodes.UnrecognizedTeacherRole,
        fullName: fullName,
        role: role,
        line: line + 2,
        file: file
      };
  }
};

const isEvaluatedElementATeacher = (category: string) => {
  return category === "CUERPO DOCENTE - Individual";
};

const isPublic = (teacher: Teacher, category: string, answerValue: string) => {
  return (
    teacher === undefined &&
    category !== "CUERPO DOCENTE - Individual" &&
    PUBLIC_ANSWERS_WHITELIST.includes(answerValue)
  );
};

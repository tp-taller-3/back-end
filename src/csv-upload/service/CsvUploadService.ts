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
import { answersCsvColumns } from "../csvConstants";

export const csvBulkUpsert = async (
  answers,
  /*teachers,*/ year: number,
  semesterNumber: number
) => {
  const savedSemesters: string[] = [];
  const savedCourses: string[] = [];
  const savedTeachers: string[] = [];
  const savedQuestions: string[] = [];
  const savedAnswers: string[] = [];
  try {
    const semester = await getOrCreateSemester(year, semesterNumber);
    await SemesterRepository.save(semester);
    savedSemesters.push(semester.uuid);
    for (const answer of answers) {
      const course = await getOrCreateCourseByName(
        answer[answersCsvColumns.EvaluatedConcept],
        semester
      );
      let teacher;
      if (isEvaluatedElementATeacher(answer[answersCsvColumns.EvaluatedElement])) {
        teacher = await getOrCreateTeacherByName(
          answer[answersCsvColumns.EvaluatedElement],
          course
        );
      }
      const question = await getOrCreateQuestion(
        answer[answersCsvColumns.Question],
        answer[answersCsvColumns.Block],
        teacher,
        course
      );
      const answerEntity = await getOrCreateAnswer(question, answer[answersCsvColumns.AnswerValue]);
      answerEntity.count += 1;
      await CourseRepository.save(course);
      savedCourses.push(course.uuid);
      if (teacher) {
        await TeacherRepository.save(teacher);
        savedTeachers.push(teacher.uuid);
      }
      await QuestionRepository.save(question);
      savedQuestions.push(question.uuid);
      await AnswerRepository.save(answerEntity);
      savedAnswers.push(answerEntity.uuid);
    }
    // Agregar parseo de teachers (antes o despues... Hay que ver que conviene)
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
  course: Course
) => {
  let question;
  if (teacher) {
    question = await QuestionRepository.findByCourseTeacherCategoryAndQuestionText(
      questionText,
      category,
      teacher.uuid,
      course.uuid
    );
  } else {
    question = await QuestionRepository.findByCourseCategoryAndQuestionText(
      questionText,
      category,
      course.uuid
    );
  }
  if (!question) {
    question = new Question();
    question.isPublic = true; // Agregar logica de publica vs privada
    question.questionText = questionText;
    question.category = category;
    if (teacher) {
      question.teacher = teacher;
      question.teacherUuid = teacher.uuid;
    }
    question.course = course;
    question.courseUuid = course.uuid;
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

const getOrCreateTeacherByName = async (fullName: string, course: Course) => {
  let teacher = await TeacherRepository.findByFullNameIfExists(fullName);
  if (!teacher) {
    teacher = new Teacher();
    teacher.name = getNameFromFullName(fullName);
    teacher.role = getTeacherRoleFromFullName(fullName);
    teacher.dni = 123; // Reemplazar por dni posta!!  O hacer allow NULL!!!
    // Aunque si hago allow null tendria que ver porque podria pasar que les
    // falte un teacher en el segundo csv... O viceversa
    teacher.fullName = fullName;
    teacher.course = course;
    teacher.courseUuid = course.uuid;
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

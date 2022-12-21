import { CookieConfig } from "$config/Cookie";
import { JWT } from "$src/JWT";
import { parseCsv } from "$src/util";
import _ from "lodash";
import { answersCsvColumns, csvFileName, teachersCsvColumns } from "../csvConstants";
import { CsvUploadErrorCodes } from "../csvUploadErrorCodes";
import { csvBulkUpsert } from "../service";

export const csvUploadHandler = async (req, res) => {
  const token = req.cookies[CookieConfig.cookieName] || "";
  const currentUser = JWT.decodeToken(token);
  if (currentUser === undefined || !currentUser.getAdminRole()) {
    return res.status(403).send({ error: { code: CsvUploadErrorCodes.UserIsNotAdmin } });
  }
  try {
    checkForMissingFiles([csvFileName.Answers, csvFileName.Teachers], Object.keys(req.files || {}));
    validateSemester(req.body.semester);
    validateYear(req.body.year);
  } catch (err) {
    return res.status(400).send({ error: err });
  }
  let answers = [];
  let teachers = [];
  try {
    answers = readRecords(
      req.files[csvFileName.Answers].data,
      Object.values(answersCsvColumns),
      csvFileName.Answers
    );
    teachers = readRecords(
      req.files[csvFileName.Teachers].data,
      Object.values(teachersCsvColumns),
      csvFileName.Teachers
    );
  } catch (err) {
    return res.status(422).send({ error: err });
  }
  try {
    await csvBulkUpsert(answers, teachers, Number(req.body.year), Number(req.body.semester));
  } catch (err) {
    if (Object.values(CsvUploadErrorCodes).includes(err.code)) {
      return res.status(422).send({ error: err });
    }
    return res.status(500).send({ error: err });
  }
  return res.status(201).send({
    success: true
  });
};

const readRecords = (input: Buffer, expectedColumnNames: string[], fileName: string) => {
  try {
    return parseCsv(input, expectedColumnNames, fileName);
  } catch (err) {
    err.file = fileName;
    throw err;
  }
};

const checkForMissingFiles = (expectedFiles: string[], actualFiles: string[]) => {
  const missingFiles = _.difference(expectedFiles, actualFiles);
  const extraFiles = _.difference(actualFiles, expectedFiles);
  if (missingFiles.length !== 0 || extraFiles.length !== 0) {
    throw {
      code: CsvUploadErrorCodes.MissingFile,
      missingFiles: missingFiles,
      extraFiles: extraFiles
    };
  }
};

const validateSemester = semester => {
  const validSemesters = ["0", "1", "2"];
  if (!validSemesters.includes(semester)) {
    throw {
      code: CsvUploadErrorCodes.InvalidField,
      field: "semester",
      expected: validSemesters.join(" o "),
      actual: semester === undefined ? "" : semester
    };
  }
};

const validateYear = year => {
  if (isNaN(year)) {
    throw {
      code: CsvUploadErrorCodes.InvalidField,
      field: "year",
      expected: "Un año válido",
      actual: year === undefined ? "" : year
    };
  }
};

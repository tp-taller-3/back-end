import { parseCsv } from "$src/util";
import _ from "lodash";
import { answersCsvColumns, csvFileName, teachersCsvColumns } from "../csvConstants";
import { csvBulkUpsert } from "../service";
import { CsvUploadControllerErrorCode } from "./CsvUploadControllerErrorCodes";

export const csvUploadHandler = async (req, res) => {
  // Check admin here...
  try {
    checkForMissingFiles(
      [csvFileName.Answers, csvFileName.Teachers],
      Object.keys(req.files === undefined ? {} : req.files)
    );
    ValidateBodyFields(req.body);
  } catch (err) {
    return res.status(400).send({ error: err });
  }
  let answers = [];
  try {
    answers = readRecords(
      req.files[csvFileName.Answers].data,
      Object.values(answersCsvColumns),
      csvFileName.Answers
    );
    readRecords(
      req.files[csvFileName.Teachers].data,
      Object.values(teachersCsvColumns),
      csvFileName.Teachers
    );
  } catch (err) {
    return res.status(422).send({ error: err });
  }
  try {
    // Add teacher to csvBulkUpsert
    await csvBulkUpsert(answers, Number(req.body.year), Number(req.body.semester));
  } catch (err) {
    // Deberia ser un 500? Si falla la base supongo que sí.
    // Pero si es por un error de validacion que debería devolver?
    return res.status(500).send({ error: err });
  }
  return res.status(201).send({
    success: true
  });
};

const readRecords = (input: Buffer, expectedColumnNames: string[], fileName: string) => {
  try {
    return parseCsv(input, expectedColumnNames);
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
      code: CsvUploadControllerErrorCode.MissingFile,
      missingFiles: missingFiles,
      extraFiles: extraFiles
    };
  }
};

const ValidateBodyFields = body => {
  const validSemesters = ["1", "2"];
  if (!validSemesters.includes(body.semester)) {
    throw {
      code: CsvUploadControllerErrorCode.InvalidField,
      field: "semester",
      expected: validSemesters,
      actual: body.semester === undefined ? "" : body.semester
    };
  }
  // Check if year is current or before maybe (?)
  if (isNaN(body.year)) {
    throw {
      code: CsvUploadControllerErrorCode.InvalidField,
      field: "year",
      expected: "A valid year",
      actual: body.year === undefined ? "" : body.year
    };
  }
};

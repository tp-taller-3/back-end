import { parseCsv } from "$src/util";
import _ from "lodash";
import { CsvUploadControllerErrorCode } from "./CsvUploadControllerErrorCodes";

const answersCSV = "answersCSV";
const answersCSVColumns = [
  "Encuesta",
  "Concepto Evaluado",
  "Elemento evaluado",
  "Bloque",
  "Código de Pregunta",
  "Pregunta",
  "Valor de Respuesta",
  "Usuario",
  "Respondido por",
  "Código del elemento"
];
const teachersCSV = "teachersCSV";
const teachersCSVColumns = ["DNI", "Nombre"];

export const csvUploadHandler = async (req, res) => {
  // Check admin here...
  try {
    checkForMissingFiles(
      [answersCSV, teachersCSV],
      Object.keys(req.files === undefined ? {} : req.files)
    );
    ValidateBodyFields(req.body);
  } catch (err) {
    return res.status(400).send(err);
  }
  try {
    const answers = readRecords(req.files[answersCSV].data, answersCSVColumns, answersCSV);
    const teachers = readRecords(req.files[teachersCSV].data, teachersCSVColumns, teachersCSV);
    return res.status(201).send({
      success: true,
      answers: answers,
      teachers: teachers,
      semester: req.body.semester,
      year: req.body.year
    });
  } catch (err) {
    return res.status(422).send(err);
  }
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

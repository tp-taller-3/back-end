import { parse } from "csv-parse/sync";
import _ from "lodash";
import { CsvErrorCode } from "./CsvErrors";

export const parseCsv = (input: Buffer, expectedColumnNames: string[], fileName: string) => {
  let records = [];
  try {
    records = parse(input, {
      columns: true,
      skip_empty_lines: true
    });
  } catch (err) {
    if (err.code === "CSV_RECORD_INCONSISTENT_COLUMNS") {
      validateColumns(
        expectedColumnNames,
        err.columns.map(element => element.name),
        fileName
      );
      if (err.message.includes("Invalid Record Length")) {
        throw {
          code: CsvErrorCode.InvalidRecordLength,
          line: err.lines,
          expected_number_of_columns: expectedColumnNames.length,
          record_number_of_columns: err.index,
          file: fileName
        };
      }
    }
    throw { code: CsvErrorCode.UnrecognizedError, error: err, file: fileName };
  }
  if (records.length > 0) {
    validateColumns(expectedColumnNames, Object.keys(records[0]), fileName);
  }
  return records;
};

const validateColumns = (expectedColumns: string[], actualColumns: string[], fileName: string) => {
  const missingColumns = _.difference(expectedColumns, actualColumns);
  const extraColumns = _.difference(actualColumns, expectedColumns);
  if (missingColumns.length !== 0 || extraColumns.length !== 0) {
    throw {
      code: CsvErrorCode.MissingColumn,
      missingColumns,
      extraColumns,
      file: fileName
    };
  }
};

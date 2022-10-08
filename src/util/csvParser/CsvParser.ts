import { parse } from "csv-parse/sync";
import { CsvErrorCode } from "./CsvErrors";

export const parseCsv = (data, wantedColumns) => {
  try {
    const records = parse(data, {
      columns: true,
      skip_empty_lines: true
    });
    return records;
  } catch (err) {
    if (err.code === "CSV_RECORD_INCONSISTENT_COLUMNS") {
      if (err.columns.length !== wantedColumns.length) {
        throw {
          code: CsvErrorCode.ColumnsLengthMissmatch,
          expected: wantedColumns,
          received: err.columns
        };
      }
      for (const column of wantedColumns) {
        if (!err.columns.some(element => element.name === column)) {
          throw { code: CsvErrorCode.MissingColumn, column: column };
        }
      }
      if (err.message.includes("Invalid Record Length")) {
        throw {
          code: CsvErrorCode.InvalidRecordLength,
          line: err.lines,
          expected_number_of_columns: wantedColumns.length,
          record_number_of_columns: err.index
        };
      }
    }
    throw { code: CsvErrorCode.UnrecognizedError, error: err };
  }
};

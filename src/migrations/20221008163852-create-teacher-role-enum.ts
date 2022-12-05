import { noop } from "lodash";
import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(
      "CREATE TYPE teacherRole AS ENUM ('titular', 'asociado', 'adjunto', 'jtp', 'ayudante');"
    ),
  down: noop
};

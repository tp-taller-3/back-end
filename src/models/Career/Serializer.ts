import { Career } from "./index";

import pick from "lodash/pick";

const CareerSerializer = {
  serialize: (career: Career) => pick(career, ["code", "description", "credits"])
};

export { CareerSerializer };

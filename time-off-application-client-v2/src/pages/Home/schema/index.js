import { addMethod, array, date, number, object, string } from "yup";

import dayjs from "dayjs";
import task from "./task";
import timeOff from "./timeOff";

addMethod(date, "isValidSync", value => dayjs(value).isValid());

const schema = object().shape({
  id: number().integer(),
  officer: string().required(),
  task,
  timeOffs: array()
    .of(timeOff)
    .required()
    .min(1)
    .max(2)
}).required();

export default schema;
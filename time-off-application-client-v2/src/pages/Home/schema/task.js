import { date, object, string, boolean } from "yup";

import formOptions from "constants/formOptions";

const task = object().shape({
  date: date().nullable().typeError("Invalid date").required(),
  status: string().oneOf(Object.values(formOptions.task.status)).required(),
  onsite: boolean().required(),
  details: string().required()
}).required();

export default task;
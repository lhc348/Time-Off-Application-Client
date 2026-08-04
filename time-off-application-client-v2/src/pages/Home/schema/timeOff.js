import { date, object, string } from "yup";

import dayjs from "dayjs";

const isSunday = date => dayjs(date).day() === 0;
const isWithinMonths = (date1, date2, months) => dayjs(date1).diff(dayjs(date2), "month", true) <= months;

const errors = {
  TIME_OFF_DATE_TOO_EARLY: "Time off date should not earlier than task completion date",
  TIME_OFF_OUT_OF_RANGE_SUN: "Time off must be claimed within 1 month",
  TIME_OFF_OUT_OFF_RANGE_MON_TO_SAT: "Time off must be claimed within 6 months",
  TIME_OFF_SESSION_WRONG_COMBO: "Time off sessions must be either (1) 1 Full day session, (2) 1 half day session or (3) a combination of 2 half day sessions",
  TIME_OFF_SESSION_NOT_FULL_DAY_SUN: "Time off of Sunday task(s) must be a full day session or a combination of 2 half day sessions"
};

const schema = object().shape({
  date: date()
    .nullable()
    .typeError("Invalid date")
    .required()
    .test(
      "is-after-task-date",
      errors.TIME_OFF_DATE_TOO_EARLY,
      (value, { from }) => {
        const timeOffDate = dayjs(value);
        const taskDate = dayjs(from[1].value.task.date);

        return timeOffDate.isAfter(taskDate) > 0;
      }
    )
    .test(
      "is-within-1-month-if-task-date-is-sunday",
      errors.TIME_OFF_OUT_OF_RANGE_SUN,
      (value, { from }) => {
        const timeOffDate = dayjs(value);
        const taskDate = dayjs(from[1].value.task.date);

        if (isSunday(taskDate)) {
          return isWithinMonths(timeOffDate, taskDate, 1);
        }

        return true;
      }
    )
    .test(
      "is-within-6-months-if-task-date-is-not-sunday",
      errors.TIME_OFF_OUT_OFF_RANGE_MON_TO_SAT,
      (value, { from }) => {
        const timeOffDate = dayjs(value);
        const taskDate = dayjs(from[1].value.task.date);

        if (!isSunday(taskDate)) {
          return isWithinMonths(timeOffDate, taskDate, 6);
        }

        return true;
      }
    ),
  session: string()
    .oneOf(["AM", "PM", "Full Day"])
    .required()
    .test(
      "is-at-most-one-full-day-when-combined",
      errors.TIME_OFF_SESSION_WRONG_COMBO,
      (value, { from }) => {
        if (from[1].value.timeOffs.length > 1) {
          return value !== "Full Day";
        }

        return true;
      }
    )
    .test(
      "is-full-day-when-combined-if-task-date-is-sunday",
      errors.TIME_OFF_SESSION_NOT_FULL_DAY_SUN,
      (value, { from }) => {
        const taskDate = dayjs(from[1].value.task.date);

        if (isSunday(taskDate)) {
          if (from[1].value.timeOffs.length === 1) {
            return value === "Full Day";
          }

          return value === "AM" || value === "PM";
        }

        return true;
      }
    )
}).required();

export default schema;
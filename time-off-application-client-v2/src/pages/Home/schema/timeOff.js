import { date, object, string } from "yup";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// extend dayjs with isSameOrBefore plugin
dayjs.extend(isSameOrBefore);

const isSunday = date => dayjs(date).day() === 0;
const isWithinMonths = (date1, date2, months) => dayjs(date1).diff(dayjs(date2), "month", true) <= months;

const errors = {
  TIME_OFF_DATE_TOO_EARLY: "Time off date should not earlier than task completion date",
  //TIME_OFF_OUT_OF_RANGE_SUN: "Time off must be claimed within 1 month",
  TIME_OFF_OUT_OFF_RANGE_MON_TO_SAT: "Time off must be claimed within 6 months",
  TIME_OFF_SESSION_WRONG_COMBO: "Time off sessions must be either (1) 1 Full day session, (2) 1 half day session, (3) a combination of 2 half day sessions or (4) a combination of half day session(s) (and/or) 1/4 day session(s)",
  //TIME_OFF_SESSION_NOT_FULL_DAY_SUN: "Time off of Sunday task(s) must be a full day session or a combination of 2 half day sessions",
  TIME_OFF_QUARTER_START_REQUIRED: "Start time is required for a 1/4 Day session",
  TIME_OFF_OVERLAPS_OFFICE_HOURS: "Task date is overlaps with office hours (08:45-17:33) on a weekday"
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
    /*.test(
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
    )*/
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
    )
    .test(
      "does-not-overlap-office-hours",
      errors.TIME_OFF_OVERLAPS_OFFICE_HOURS,
      (value, { from }) => {
        // Determine task start datetime and OT duration based on timeOffs
        const taskDateRaw = from[1].value.task && from[1].value.task.date;
        const timeOffs = from[1].value.timeOffs || [];

        const taskStart = dayjs(taskDateRaw);
        if (!taskStart.isValid()) return true; // let other validations handle invalid task date

        // Calculate duration in minutes: 1/4 day = 1.95h (117m), half day = 3.9h (3h54m = 234m), full day = 7.8h (7h48m = 468m)
        let durationMinutes = 0;
        if (timeOffs.length > 1) {
          durationMinutes = 7 * 60 + 48;
        } else if (timeOffs.length === 1) {
          const session = (timeOffs[0].session || "").toLowerCase();
          if (session === "full day" || session === "fullday" || session === "full-day") {
            durationMinutes = 7 * 60 + 48;
          } else if (session.includes("1/4") || session.includes("quarter")) {
            durationMinutes = 1 * 60 + 57; // 117 minutes
          } else {
            // AM or PM treated as half day
            durationMinutes = 3 * 60 + 54;
          }
        } else {
          // no timeOffs specified -> nothing to check
          return true;
        }

        const start = taskStart;
        const end = start.add(durationMinutes, "minute");

        // If end is not after start, no overlap
        if (!end.isAfter(start)) return true;

        // Iterate each calendar day between start and end and check weekday office hours overlap
        const dayStart = start.startOf("day");
        const lastDay = end.startOf("day");
        let d = dayStart;
        while (d.isSameOrBefore(lastDay)) {
          const dayOfWeek = d.day(); // 0 = Sunday, 6 = Saturday
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const officeStart = d.hour(8).minute(45).second(0);
            const officeEnd = d.hour(17).minute(33).second(0);

            // overlap if start < officeEnd && end > officeStart
            if (start.isBefore(officeEnd) && end.isAfter(officeStart)) {
              return false; // overlap found -> validation fails
            }
          }
          d = d.add(1, "day");
        }

        return true;
      }
    ),
  startTime: date()
    .nullable()
    .when("session", (session, schema) =>
      session === "1/4 Day"
        ? schema.required("Start time is required for a 1/4 Day session")
        : schema.nullable()
    ),
  session: string()
    .oneOf(["AM", "PM", "Full Day", "1/4 Day"])
    .required()
    .test(
      "is-at-most-one-full-day-when-combined",
      errors.TIME_OFF_SESSION_WRONG_COMBO,
      (value, { from }) => {
        const timeOffs = from[1].value.timeOffs || [];

        // Map session to minutes
        const getMinutes = (session) => {
          const s = (session || "").toLowerCase();
          if (s.includes("full")) return 7 * 60 + 48; // 468
          if (s.includes("1/4") || s.includes("quarter")) return 1 * 60 + 57; // 117
          // AM/PM or any other -> half day (234)
          return 3 * 60 + 54;
        };

        // If combining entries, ensure none is a Full Day and total duration is at most one full day
        if (timeOffs.length > 1) {
          // if any entry is full day -> invalid
          if (timeOffs.some(t => (t.session || "").toLowerCase().includes("full"))) {
            return false;
          }

          const totalMinutes = timeOffs.reduce((sum, t) => sum + getMinutes(t.session), 0);

          return totalMinutes <= 7 * 60 + 48; // must be at most one full day
        }

        return true;
      }
    )
    /*.test(
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
    )*/
}).required();

export default schema;

import dayjs from "dayjs";
import formOptions from "constants/formOptions";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const useForm = () => {
  const { state } = useLocation();

  const form = useMemo(() => state?.form
    ? {
      "Officer": state.form.officer,
      "Task Date": dayjs(state.form.task.date).format("YYYY/MM/DD HH:mm"),
      "Task Status": state.form.task.status,
      "Task Onsite": formOptions.task.onsite[state.form.task.onsite],
      "Task Details": state.form.task.details,
      ...state.form.timeOffs.reduce((acc, curr, index) => ({
        ...acc,
        [`Time Off Date ${index + 1}`]: dayjs(curr.date).format("YYYY/MM/DD"),
        [`Time Off Session ${index + 1}`]: curr.session
      }), {})
    }
    : {}, [state?.form]
  );

  return form;
};

export default useForm;
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { useController } from "react-hook-form";

const DatePicker = ({ name, control, ...props }) => {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error }
  } = useController({ name, control });

  return (
    <MuiDatePicker
      ref={ref}
      value={value}
      onChange={onChange}
      inputFormat="YYYY/MM/DD"
      mask="____/__/__"
      renderInput={params => (
        <TextField
          {...params}
          name={name}
          onBlur={onBlur}
          error={Boolean(error)}
          helperText={error?.message ?? " "}
          fullWidth
        />
      )}
      {...props}
    />
  );
};

DatePicker.propTypes = {
  control: PropTypes.object.isRequired,
  ...DatePicker.propTypes
};

export default DatePicker;

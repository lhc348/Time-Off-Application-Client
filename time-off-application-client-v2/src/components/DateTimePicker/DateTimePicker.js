import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { useController } from "react-hook-form";

const DateTimePicker = ({ name, control, ...props }) => {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error }
  } = useController({ name, control });

  return (
    <MuiDateTimePicker
      ref={ref}
      value={value}
      onChange={onChange}
      inputFormat="YYYY/MM/DD HH:mm"
      mask="____/__/__ __:__"
      disableMaskedInput={false}
      ampm={false}
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

DateTimePicker.propTypes = {
  control: PropTypes.object.isRequired,
  ...DateTimePicker.propTypes
};

export default DateTimePicker;

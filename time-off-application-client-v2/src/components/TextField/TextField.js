import { TextField as MuiTextField } from "@mui/material";
import PropTypes from "prop-types";
import { useController } from "react-hook-form";

const TextField = ({ name, control, children, ...props }) => {
  const {
    field: { ref, ...field },
    fieldState: { error }
  } = useController({ name, control });

  return (
    <MuiTextField
      name={name}
      inputRef={ref}
      {...field}
      error={Boolean(error)}
      helperText={error?.message ?? " "}
      {...props}
    >
      {children}
    </MuiTextField>
  );
};

TextField.propTypes = {
  control: PropTypes.object.isRequired,
  children: PropTypes.node,
  ...TextField.propTypes
};

export default TextField;

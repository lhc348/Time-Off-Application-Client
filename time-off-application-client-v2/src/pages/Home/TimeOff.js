import { Add, Delete } from "@mui/icons-material";
import { FormHelperText, Grid, IconButton, MenuItem, Stack } from "@mui/material";

import DatePicker from "components/DatePicker";
import { Fragment } from "react";
import PropTypes from "prop-types";
import TextField from "components/TextField";
import { useWatch } from "react-hook-form";

const TimeOff = ({ index, control, onInsert, onDelete }) => {
  const timeOffs = useWatch({ control, name: "timeOffs" });

  return (
    <Fragment>
      <Grid item xs={4}>
        <DatePicker
          name={`timeOffs.${index}.date`}
          control={control}
          label="Date"
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          name={`timeOffs.${index}.session`}
          control={control}
          label="Session"
          select
          fullWidth
        >
          <MenuItem value="AM">
            AM
          </MenuItem>
          <MenuItem value="PM">
            PM
          </MenuItem>
          <MenuItem value="Full Day">
            Full Day
          </MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={4}>
        <Stack direction="row" spacing={1}>
          <div>
            <IconButton onClick={onInsert} disabled={timeOffs.length > 1}>
              <Add />
            </IconButton>
            <FormHelperText>{" "}</FormHelperText> {/* spacer */}
          </div>
          <div>
            <IconButton onClick={onDelete} color="error" disabled={timeOffs.length <= 1}>
              <Delete />
            </IconButton>
            <FormHelperText>{" "}</FormHelperText> {/* spacer */}
          </div>
        </Stack>
      </Grid>
    </Fragment>
  );
};

TimeOff.propTypes = {
  index: PropTypes.number,
  control: PropTypes.object,
  onInsert: PropTypes.func,
  onDelete: PropTypes.func
};

export default TimeOff;
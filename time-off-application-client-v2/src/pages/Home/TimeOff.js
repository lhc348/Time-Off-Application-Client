import { Add, Delete } from "@mui/icons-material";
import { FormHelperText, Grid, IconButton, MenuItem, Stack } from "@mui/material";
import { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { useWatch } from "react-hook-form";

import DatePicker from "components/DatePicker";
import DateTimePicker from "components/DateTimePicker";
import TextField from "components/TextField";

const TimeOff = ({ index, control, setValue, onInsert, onDelete }) => {
  const timeOffs = useWatch({ control, name: "timeOffs" });
  const session = useWatch({ control, name: `timeOffs.${index}.session` });

  // When session is not 1/4 Day, clear startTime to avoid stale values causing validation
  useEffect(() => {
    if (session !== "1/4 Day") {
      setValue(`timeOffs.${index}.startTime`, null);
    }
  }, [session, index, setValue]);

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
          <MenuItem value="AM">AM</MenuItem>
          <MenuItem value="PM">PM</MenuItem>
          <MenuItem value="Full Day">Full Day</MenuItem>
          <MenuItem value="1/4 Day">1/4 Day</MenuItem>
        </TextField>
      </Grid>

      {session === "1/4 Day" && (
        <Grid item xs={4}>
          <DateTimePicker
            name={`timeOffs.${index}.startTime`}
            control={control}
            label="Start Time"
            views={["hours", "minutes"]}
            openTo="hours"
          />
        </Grid>
      )}

      <Grid item xs={session === "1/4 Day" ? 12 : 4}>
        <Stack direction="row" spacing={1}>
          <div>
            <IconButton onClick={onInsert} disabled={timeOffs.length > 1}>
              <Add />
            </IconButton>
            <FormHelperText>{" "}</FormHelperText>
          </div>

          <div>
            <IconButton onClick={onDelete} color="error" disabled={timeOffs.length <= 1}>
              <Delete />
            </IconButton>
            <FormHelperText>{" "}</FormHelperText>
          </div>
        </Stack>
      </Grid>
    </Fragment>
  );
};

TimeOff.propTypes = {
  index: PropTypes.number,
  control: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired,
  onInsert: PropTypes.func,
  onDelete: PropTypes.func
};

export default TimeOff;

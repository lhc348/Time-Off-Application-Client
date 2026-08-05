import { Box, Button, ButtonGroup, Grid, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { applyTimeOff, getOfficer, listActingApprovers } from "api";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import DateTimePicker from "components/DateTimePicker";
import { KeyboardArrowDown } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import TextField from "components/TextField";
import TimeOff from "./TimeOff";
import formOptions from "constants/formOptions";
import nav from "constants/nav";
import schema from "./schema";
import { updateTimeOff } from "./../../api/index";
import useSx from "./useSx";
import { yupResolver } from "@hookform/resolvers/yup";

const defaultFormValues = {
  officer: "",
  task: {
    date: "",
    status: "",
    onsite: false,
    details: ""
  },
  timeOffs: [{ date: "", session: "" }]
};

// Helper: calculate OT duration in minutes based on timeOffs
function calculateOtDurationMinutes(timeOffs) {
  if (!timeOffs || timeOffs.length === 0) return 0;
  if (timeOffs.length > 1) return 7 * 60 + 48; // 7h48m = 468 minutes
  const session = (timeOffs[0].session || "").toLowerCase();
  if (session === "full day" || session === "fullday" || session === "full-day") return 7 * 60 + 48;
  // treat AM/PM as half day
  return 3 * 60 + 54; // 3h54m = 234 minutes
}

// Helper: check whether [start, end) intersects office hours (08:45-17:33) on any weekday
function intersectsOfficeHoursOnWeekday(start, end) {
  if (!(start instanceof Date)) start = new Date(start);
  if (!(end instanceof Date)) end = new Date(end);

  if (end <= start) return false;

  function atMidnight(d) {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  }

  const dayStart = atMidnight(start);
  const lastDay = atMidnight(end);

  for (let d = new Date(dayStart); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    const officeStart = new Date(d);
    officeStart.setHours(8, 45, 0, 0);
    const officeEnd = new Date(d);
    officeEnd.setHours(17, 33, 0, 0);

    if (start < officeEnd && end > officeStart) return true;
  }

  return false;
}

const Home = () => {
  const sx = useSx();
  const submitButtonRef = useRef();
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const { control, setValue, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultFormValues
  });
  const { fields, insert, remove, replace } = useFieldArray({ name: "timeOffs", control });
  const [name, setName] = useState();
  const [actingApprovers, setActingApprovers] = useState([]);
  const [approverMenuOpen, setApproverMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state?.form) {
      const { id, timeOffs, officer, task } = state.form;
      setValue("id", id);
      setValue("officer", officer.corpId);
      setValue("task", task);
      replace(timeOffs);
      setName(`${officer.firstName} ${officer.lastName}`);
    } else {
      getOfficer()
        .then(({ corpId, firstName, lastName }) => {
          setValue("officer", corpId);
          setName(`${firstName} ${lastName}`);
        });
    }
  }, [replace, setValue, state?.form]);

  useEffect(() => {
    listActingApprovers()
      .then(actingApprovers => setActingApprovers(actingApprovers));
  }, []);

  const handleInsert = index => () => insert(index + 1, { date: "", session: "" });
  const handleDelete = index => () => remove(index);
  const handleFormSubmit = actingApproverCorpId => data => {
    // client-side validation: check OT interval does not overlap office hours on weekdays
    try {
      const start = new Date(data.task.date);
      const durationMinutes = calculateOtDurationMinutes(data.timeOffs || []);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      if (intersectsOfficeHoursOnWeekday(start, end)) {
        // show prompt message and abort submit
        window.alert("Task date is overlaps with office hours (08:45-17:33) on a weekday");
        return;
      }
    } catch (err) {
      window.alert("Invalid task date or timeOffs");
      return;
    }

    const formData = {
      ...data,
      submitToHR: true // TODO: This may be false in the future depending on the application
    };
    const navigateToConfirmPage = () => {
      navigate(pathname, {}); // clear router state
      navigate(nav.APPLICATION_CONFIRMATION.path, {
        state: {
          form: formData
        }
      });
    };

    setSubmitting(true);
    if (state?.form) {
      updateTimeOff(formData, actingApproverCorpId)
        .then(() => navigateToConfirmPage())
        .finally(setSubmitting(false));
    } else {
      applyTimeOff(formData, actingApproverCorpId)
        .then(() => navigateToConfirmPage())
        .finally(setSubmitting(false));
    }
  };

  const handleApproverMenuOpen = () => setApproverMenuOpen(true);
  const handleApproverMenuClose = () => setApproverMenuOpen(false);
  const handleMenuClick = corpId => () => {
    handleApproverMenuClose();
    handleSubmit(handleFormSubmit(corpId))();
  };

  return (
    <Box component="form" sx={sx.root} onSubmit={handleSubmit(handleFormSubmit())}>
      <Stack spacing={2}>
        <Typography variant="h5">
          {name}
        </Typography>
        <Stack sx={sx.stackContainer} spacing={2}>
          <Typography variant="h6">
            Task
          </Typography>
          <div>
            <Grid container spacing={2}>
              <Grid item sm={4} xs={12}>
                <DateTimePicker
                  name="task.date"
                  control={control}
                  label="Date"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name="task.status"
                  control={control}
                  label="Status"
                  select
                  fullWidth
                >
                  {Object.values(formOptions.task.status).map(value => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name="task.onsite"
                  control={control}
                  label="Onsite"
                  select
                  fullWidth
                >
                  {Object.entries(formOptions.task.onsite).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="task.details"
                  control={control}
                  label="Details"
                  fullWidth
                  multiline
                  rows={7}
                />
              </Grid>
            </Grid>
          </div>
        </Stack>
        <Stack sx={sx.stackContainer} spacing={2}>
          <Typography variant="h6">
            Time Off
          </Typography>
          <div>
            <Grid container spacing={1} sx={sx.timeOffGridContainer}>
              {fields.map(({ id }, index) => (
                <TimeOff
                  key={id}
                  index={index}
                  control={control}
                  onInsert={handleInsert(index)}
                  onDelete={handleDelete(index)}
                />
              ))}
            </Grid>
          </div>
        </Stack>
      </Stack>
      <Stack spacing={2} sx={sx.submitContainer}>
        <Typography variant="body2" sx={sx.helperText}>
          * In the event of the approver is not available (e.g. on leave), please submit your application to one of the following acting approvers.
        </Typography>
        <ButtonGroup ref={submitButtonRef} variant="contained" sx={sx.submitButton}>
          <LoadingButton type="submit" variant="contained" size="large" loading={submitting}>
            Submit
          </LoadingButton>
          <Button size="small" onClick={handleApproverMenuOpen} disabled={submitting}>
            <KeyboardArrowDown />
          </Button>
        </ButtonGroup>
        <Menu
          anchorEl={submitButtonRef.current}
          open={approverMenuOpen}
          onClose={handleApproverMenuClose}
        >
          {actingApprovers.map(({ corpId, firstName, lastName }) => (
            <MenuItem
              key={corpId}
              onClick={handleMenuClick(corpId)}
            >
              {`Submit to ${firstName} ${lastName}`}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Box>
  );
};

export default Home;

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
    date: null,       // was ""
    status: "",
    onsite: false,
    details: ""
  },
  timeOffs: [{ date: null, session: "", startTime: null }] // date/startTime null
};

const Home = () => {
  const sx = useSx();
  const submitButtonRef = useRef();
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const { control, setValue, handleSubmit, trigger, formState: { errors } } = useForm({
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

  const handleInsert = index => () => insert(index + 1, { date: "", session: "", startTime: "" });
  const handleDelete = index => () => remove(index);
  const handleFormSubmit = actingApproverCorpId => async data => {
    // perform an explicit trigger to make validation errors visible
    const valid = await trigger();
    if (!valid) {
      console.log("Validation failed:", errors);
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
    try {
      if (state?.form) {
        await updateTimeOff(formData, actingApproverCorpId);
      } else {
        await applyTimeOff(formData, actingApproverCorpId);
      }
      navigateToConfirmPage();
    } catch (err) {
      // show a console error — you can replace with UI toast if desired
      console.error("submit failed", err);
    } finally {
      setSubmitting(false); // fixed: pass a function to finally by using try/finally
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
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Please input text:[TSR/CR/SR/INC no.][Details Description]
                </Typography>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                  Sample:[BID20260102-126238][tablespace enlargement for AFW and IBX DB]
                </Typography>
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
                  setValue={setValue}
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

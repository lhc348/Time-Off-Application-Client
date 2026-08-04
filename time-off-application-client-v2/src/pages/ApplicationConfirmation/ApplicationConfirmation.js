/* eslint-disable no-unused-vars */

import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import { Fragment } from "react";
import useForm from "./useForm";
import useSx from "./useSx";

const ApplicationConfirmation = () => {
  const sx = useSx();
  const form = useForm();

  return (
    <Stack spacing={2} sx={sx.root}>
      <Typography variant="h2">
        Application Submitted
      </Typography>
      <Typography>
        You will be receiving a confirmation email with your application details.
      </Typography>
      <TableContainer sx={sx.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(form).map(([field, value]) => (
              <TableRow key={field}>
                <TableCell>{field}</TableCell>
                <TableCell sx={sx.valueCell}>
                  {value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default ApplicationConfirmation;
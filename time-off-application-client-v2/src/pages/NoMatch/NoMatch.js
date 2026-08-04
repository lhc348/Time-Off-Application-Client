import { Button, Stack, Typography } from "@mui/material";

import { KeyboardArrowLeft } from "@mui/icons-material";
import { Link } from "react-router-dom";
import nav from "constants/nav";
import useSx from "./useSx";

const NoMatch = () => {
  const sx = useSx();

  return (
    <Stack sx={sx.root} spacing={5}>
      <Typography variant="h1">
        404 Not Found
      </Typography>
      <Button
        component={Link}
        to={nav.HOME.path}
        variant="contained"
        startIcon={<KeyboardArrowLeft />}
        size="large"
      >
        Back to home
      </Button>
    </Stack>
  );
};

export default NoMatch;
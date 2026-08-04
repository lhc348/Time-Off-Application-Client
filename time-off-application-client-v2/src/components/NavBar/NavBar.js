import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import nav from "constants/nav";
import useSx from "./useSx";

const NavBar = () => {
  const sx = useSx();
  const { pathname } = useLocation();

  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h6" component-="h1">
          Time Off Application
        </Typography>
        <Box sx={sx.spacer} />
        <Stack direction="row" spacing={1}>
          {Object.values(nav).filter(({ label }) => Boolean(label)).map(({ path, label }) => (
            <Button
              key={path}
              component={Link}
              to={path}
              variant={pathname === path ? "contained" : "text"}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
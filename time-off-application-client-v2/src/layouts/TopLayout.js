import { Container, Toolbar } from "@mui/material";

import { Fragment } from "react";
import NavBar from "components/NavBar";
import { Outlet } from "react-router-dom";

const useSx = () => ({
  main: {
    display: "flex",
    flexDirection: "column",
    height: "100vh"
  }
});

const TopLayout = () => {
  const sx = useSx();

  return (
    <Fragment>
      <NavBar />
      <Container component="main" sx={sx.main} maxWidth="xl">
        <Toolbar />
        <Outlet />
      </Container>
    </Fragment>
  );
};

export default TopLayout;
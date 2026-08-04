import "@fontsource/roboto/latin-300.css";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-700.css";

import { createTheme, darken, lighten } from "@mui/material";

const defaultTheme = createTheme();

const theme = createTheme({
  components: {
    MuiAppBar: {
      defaultProps: {
        color: "inherit"
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    },
    MuiButtonGroup: {
      defaultProps: {
        disableElevation: true
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        ins: {
          backgroundColor: lighten(defaultTheme.palette.success.light, .9),
          color: darken(defaultTheme.palette.success.light, 0.6),
          textDecoration: "none"
        },
        del: {
          backgroundColor: lighten(defaultTheme.palette.error.light, .9),
          color: darken(defaultTheme.palette.error.light, 0.6)
        }
      }
    }
  }
});

export default theme;
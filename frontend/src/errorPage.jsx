import { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";

const ErrorPageSection = () => {

  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: "#eaeff1", padding: { xs: 3.8, md: 5 }, borderRadius: 10}}
    >
      <Typography variant="h1" align="center">Error Page</Typography>

      
    </Grid>
  );
};

export default ErrorPageSection;
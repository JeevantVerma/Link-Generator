import { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";

const LoginPageSection = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerUser = async () => {
    const userData = JSON.stringify({
      user: "Preet",
      pass: "12345",
    });

    const config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: "http://localhost:4000/register",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          "https://generate.mlsctiet.com/, http://localhost:5173/",
      },
      data: userData,
    };
    const response = await axios.request(config);

    if (response.status == 200) {
      console.log(userData);
      console.log("Register success");
    } else {
        console.log("Register failed");
    }
  }

  const loginUser = async () => {
    const config = {
      method: 'GET',
      maxBodyLength: Infinity,
      url: 'http://localhost:4000/login',
      params: {
        username: username,
        password: password,
      },
      withCredentials: true
    };
  
    try {
      const response = await axios.request(config);
  
      if (response.status === 200) {
        console.log('Login success');
        const redirectUrl = response.data.redirectUrl;
        if (redirectUrl) {
          console.log('redirect');
          window.location.href = redirectUrl;
        } else {
          console.log('No redirect URL provided by the backend');
        }
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      console.error('Full error:', error);
    }
  };

  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: "#eaeff1", padding: { xs: 3.8, md: 5 }, borderRadius: 10}}
    >
      <Typography variant="h4" align="center">Sign Up</Typography>

      <Grid item xs={12} sx={{ pt: { xs: 32, md: 16 }, pl: 16 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          error={!!error}
          helperText={error}
        />
      </Grid>
      <Grid item xs={12} sx={{ pt: { xs: 32, md: 16 }, pl: 16 }}>
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={loginUser}>
          Login
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={registerUser}>
          Register
        </Button>
      </Grid>
    </Grid>
  );
};

export default LoginPageSection;
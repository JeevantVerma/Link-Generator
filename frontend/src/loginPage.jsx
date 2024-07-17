import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Grid, Container, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { setIsFetching, loginSuccess, loginFailure } from './Redux/Slice/userSlice'; // import the actions
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    
    dispatch(setIsFetching());
    console.log("hello")
    const config = {
      method: 'GET',
      maxBodyLength: Infinity,
      url: 'http://localhost:4000/login',
      params: {
        username: username,
        password: password,
      },
      // withCredentials: true,
    };

    try {
      const response = await axios.request(config);
      console.log(response.data);
      if (response.status === 200) {
        console.log('Login success');
        const redirectUrl = response.data.redirectUrl;
        dispatch(loginSuccess({"username":username}));

        if (redirectUrl) {
          console.log('redirect');
          // window.location.href = redirectUrl;
          navigate(redirectUrl);
        } else {
          console.log('No redirect URL provided by the backend');
        }
      } else {
        dispatch(loginFailure());
        console.log('Login failed');
      }
    } catch (error) {
      dispatch(loginFailure());
      console.error('Error during login:', error.message);
      console.error('Full error:', error);
    }
  };

  return (
    <Container
      maxWidth="md" 
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '89vh',
        width: {
          xs: '100%',
          md: '50vw',
        }
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ backgroundColor: '#eaeff1', padding: { xs: 3.8, md: 5 }, borderRadius: 10 }}
      >
        <Typography variant="h4" align="center">Login</Typography>

        <Grid item xs={12} sx={{ pt: { xs: 32, md: 16 }, pl: 16 }}>
          <TextField
            label="Enter your Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} sx={{ pt: { xs: 32, md: 16 }, pl: 16 }}>
          <TextField
            label="Enter your password"
            variant="outlined"
            fullWidth
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Button
            // type="submit"
            fullWidth
            spacing={2}
            variant="contained"
            color="primary"
            onClick={handleLogin}
          >
            Login
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;

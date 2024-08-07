import { useState } from "react";
import { Grid, Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
    setError("Invalid email address");
    return;
    }
    setError("");
    
    dispatch(setIsFetching());
    const config = {
      method: 'GET',
      maxBodyLength: Infinity,
      url: 'http://localhost:4000/login',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          "https://generate.mlsctiet.com, http://localhost:5173",
        "email" : email,
        "password" : password 
      },
      withCredentials: true,
    };

    try {
      const response = await axios.request(config);
      console.log(response.data);
      if (response.status === 200) {
        console.log('Login success');
        const redirectUrl = response.data.redirectUrl;
        dispatch(loginSuccess({"email":email}));

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
        console.log(e);
        setSnackbarOpen(true);
      }
    } catch (error) {
      dispatch(loginFailure());
      console.error('Error during login:', error.message);
      console.error('Full error:', error);
      setSnackbarOpen(true);
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
            label="Enter your Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <Snackbar 
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}>
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="error"
            sx={{ width: '100%' }}>
            Email or password is invalid
          </Alert>
        </Snackbar>
      </Grid>
    </Container>
  );
};

export default LoginPage;

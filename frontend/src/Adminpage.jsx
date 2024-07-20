import { useState } from "react";
import {
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,
  Snackbar,
  Alert
} from "@mui/material";
import Administrators from "./Adminpagecomponents/Administrators";
import Approvals from "./Adminpagecomponents/Approvals";
import axios from 'axios';
// import Users from "./Adminpagecomponents/Users";
import { combineReducers } from "redux";

const Adminpage = () => {
  const [activeComponent, setActiveComponent] = useState("Approvals");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState();
  const handleLinkClick = (newComponent) => {
    setActiveComponent(newComponent);
  };
  const addAdmin = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      setSnackbarOpen(true);
      return;
    }
  
    setError("");
  
    const raw = JSON.stringify({
      email: email.toLowerCase(),
      password: password,
    });
  
    const config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: `http://localhost:4000/add-admin`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          "https://generate.mlsctiet.com, http://localhost:5173",
      },
      data: raw,
    };
  
    try {
      const response = await axios.request(config);
      if (response.status === 200) {
        console.log(raw);
        handleClose();
        setEmail('');
        setPassword('');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "An error occurred while adding the admin");
      setSnackbarOpen(true);
    }
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
    <Grid sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Grid sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2, gap: 10 }}>
        <Typography variant="h4" align="center" color="white">
          Administrator Panel
        </Typography>
        <Grid>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Add New Administrator
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the email and password of the new admin.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                autoFocus
                margin="dense"
                id="password"
                label="Password"
                type="password"
                fullWidth
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={addAdmin} >Add</Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid item xs={2} sx={{
          backgroundColor: "#eaeff1",
          height: "550px",
          border: "1px solid black",
          display: "flex",
          justifyContent:"space-between",
          flexDirection: "column",
          p: 2,
          m: 2,
          borderRadius: 5,
        }}>
          <Grid item sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Avatar alt="Jeevant Verma" src="/static/images/avatar/1.jpg" />
            <Typography variant="h6" align="center">
              Jeevant Verma
            </Typography>
          </Grid>
          <List>
            {/* <ListItem button onClick={() => handleLinkClick("Users")}>
              <ListItemText primary="Users" />
            </ListItem> */}
            <ListItem button onClick={() => handleLinkClick("Administrators")}>
              <ListItemText primary="Administrators" />
            </ListItem>
            <ListItem button onClick={() => handleLinkClick("Approvals")}>
              <ListItemText primary="Approval Requests" />
            </ListItem>
          </List>
          <Button variant="contained" color="primary">
            Logout
          </Button>
        </Grid>
        <Grid item xs={9} sx={{
          backgroundColor: "#eaeff1",
          height: "550px",
          border: "1px solid black",
          display: "flex",
          justifyContent: "center",
          p: 2,
          m: 2,
          borderRadius: 5,
        }}>
          {/* {activeComponent === "Users" && <Users />} */}
          {activeComponent === "Approvals" && <Approvals />}
          {activeComponent === "Administrators" && <Administrators />}
        </Grid>
      </Grid>
    </Grid>
    <Snackbar 
    open={snackbarOpen}
    autoHideDuration={3000}
    onClose={() => setSnackbarOpen(false)}
    >
    {error ? (
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      ) : (
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Admin added successfully
        </Alert>
      )}
    </Snackbar>
  </>
  );
};

export default Adminpage;

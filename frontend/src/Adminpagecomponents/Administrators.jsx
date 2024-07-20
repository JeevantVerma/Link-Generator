import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Grid, Avatar, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const Administrators = () => {
  const [adminJSON, setAdminJSON] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getAdminDataJSON = async () => {
    const config = {
      method: 'GET',
      maxBodyLength: Infinity,
      url: 'http://localhost:4000/admin',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://generate.mlsctiet.com, http://localhost:5173",
      },
      withCredentials: true,
    };

    try {
      const response = await axios.request(config);
      if (response.status === 200) {
        setAdminJSON(response.data);
        setError(""); // Clear any previous error messages
      } else {
        setError('Error in Fetching Details');
      }
    } catch (error) {
      setError('Error during Fetching Data: ' + error.message);
    }
  };

  const removeAdmin = async (email) => {
    const config = {
      method: 'DELETE',
      maxBodyLength: Infinity,
      url: 'http://localhost:4000/admin',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://generate.mlsctiet.com, http://localhost:5173",
      },
      data: {
        "email": email.toLowerCase()
      },
      withCredentials: true,
    };

    try {
      const response = await axios.request(config);
      if (response.status === 200) {
        setError(""); 
        setSnackbarOpen(true);
      } else {
        setError('Error in deleting admin');
      }
    } catch (error) {
      setError('Error during Deleting admin: ' + error.message);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    getAdminDataJSON();
  }, []);

  useEffect(() => {
    setRows(adminJSON.map((admin, index) => ({
      id: index,
      email: admin.email,
      date: admin.joinDate,
    })));
  }, [adminJSON]);

  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      disableColumnMenu: true,
      renderCell: (params) => {
        const firstInitial = params.row.email.charAt(0).toUpperCase();
        return (
          <Grid container alignItems="center" justifyContent="left" sx={{ display: 'flex', width: '100%', height: '100%' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {firstInitial}
            </Avatar>
          </Grid>
        );
      },
      sortable: false,
      filterable: false,
    },
    { field: 'email', headerName: 'Email', width: 400 },
    { field: 'date', headerName: 'Admin since', width: 300, sortable: false, filterable: false, disableColumnMenu: true },
    {
      field: 'removeAdmin',
      headerName: 'Remove Admin',
      width: 150,
      disableColumnMenu: true,
      renderCell: (params) => {
        const handleClick = () => {
          removeAdmin(params.row.email);
        };

        return (
          <Button variant="contained" color="error" size="small" onClick={handleClick}>
            Remove Admin
          </Button>
        );
      },
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnSelector={true}
        getRowId={(row) => row.id}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || 'Admin removed successfully'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Administrators;

import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Grid, Avatar, Button } from '@mui/material';
import axios from 'axios';

const Administrators = () => {
  const [adminJSON, setAdminJSON] = useState([]);
  const [rows, setRows] = useState([]);

  const getAdminDataJSON = async () => {
    const config = {
      method: 'GET',
      maxBodyLength: Infinity,
      url: 'http://localhost:4000/get-admin',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://generate.mlsctiet.com, http://localhost:5173",
      },
      withCredentials: true,
    };

    try {
      const response = await axios.request(config);
      console.log(response.data);
      if (response.status === 200) {
        console.log('Data Fetched Successfully');
        setAdminJSON(response.data);
      } else {
        console.log('Error in Fetching Details');
      }
    } catch (error) {
      console.error('Error during Fetching Data:', error.message);
      console.error('Full error:', error);
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
          console.log('Remove admin with ID:', params.row.id);
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
    <DataGrid
      rows={rows}
      columns={columns}
      disableColumnSelector={true}
      getRowId={(row) => row.id}
    />
  );
};

export default Administrators;

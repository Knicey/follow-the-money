import { useEffect, useState } from 'react';
import { Container, Typography, Alert, Link, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ZAxis } from 'recharts';

import config from '../config.json';

import { formatCurrency } from '../helpers/formatter';

export default function DoctorHomePage() {
  const muiTheme = useTheme();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/doctors`)
      .then(res => res.json())
      .then(resJson => setDoctors(resJson))
      .catch(() => setError('Could not load doctors. Check that the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      field: 'name',
      headerName: 'Doctor',
      minWidth: 180,
      flex: 1,
      valueGetter: (params) => `${params.row.last_name}, ${params.row.first_name}`,
      renderCell: (params) => (
        <Link component={NavLink} to={`/doctor/${params.row.npi}`} underline='hover'>
          {params.value}
        </Link>
      ),
    },
    {
      field: 'specialty',
      headerName: 'Specialty',
      minWidth: 180,
      flex: 1.2,
    },
    { field: 'city', headerName: 'City', minWidth: 150 },
    { field: 'state', headerName: 'State', minWidth: 80 },
    {
      field: 'total_payments',
      headerName: 'Payments received',
      type: 'number',
      minWidth: 180,
      flex: 1,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
    {
      field: 'total_drug_cost',
      headerName: 'Prescription drug cost',
      type: 'number',
      minWidth: 180,
      flex: 1,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      
      // Combine two columns for the name
      const pointName = `${data.last_name}, ${data.first_name}`;

      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
          <b>{pointName}</b><br/>
          {payload[0].name}: {formatCurrency(payload[0].value)}<br/>
          {payload[1].name}: {formatCurrency(payload[1].value)}
        </div>
      );
    }
    return null;
  };


  return (
    <Container>
      <Typography variant='h4' sx={{ my: 2 }}>
        Doctors
      </Typography>
      <Typography color='text.secondary' sx={{ my: 2 }}>
        See the payments each doctor received and the cost of the drugs they prescribed. Select a doctor to see the details.
      </Typography>

      {error && <Alert severity='error' sx={{ my: 2 }} >{error}</Alert>}

      <Container sx={{ mt: 4 }} >
        <ResponsiveContainer width="100%" height={300} >
          <ScatterChart width="100%" height={400}>
            <CartesianGrid />
            <XAxis
              type="number"
              label="Prescription drug cost"
              name="Prescription drug cost"
              dataKey="total_drug_cost"
              tickFormatter={formatCurrency}
              height={80}
            />
            <YAxis
              type="number"
              label={{ 
                value: 'Payments received',
                // position: 'insideLeft',
                dx: -50,
                // dy: 20,
                angle: -90
              }}
              name="Payments received"
              dataKey="total_payments"
              tickFormatter={formatCurrency}
              width={150}
            />
            <Tooltip
              // formatter={formatCurrency}
              content={CustomTooltip}
            />
            <Scatter data={doctors} fill={muiTheme.palette.primary.light} />
          </ScatterChart>
        </ResponsiveContainer>
      </Container>

      <DataGrid
        rows={doctors}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[25, 50, 100]}
        getRowId={(row) => row.npi}
        loading={loading}
        autoHeight
        initialState={{ sorting: { sortModel: [{ field: 'total_payments', sort: 'desc' }] } }}
        sx={{ my: 2 }}
        variant="doctor"
      />
    </Container>
  );
}

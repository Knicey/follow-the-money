import { useEffect, useState } from 'react';
import { Container, Typography, Alert, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';

import config from '../config.json';

import { formatCurrency } from '../helpers/formatter';

export default function DoctorHomePage() {
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

  return (
    <Container>
      <Typography variant='h4' style={{ margin: '15px 0px' }}>
        Doctors
      </Typography>
      <Typography style={{ margin: '15px 0px' }}>
        See the payments each doctor received and the cost of the drugs they prescribed. Select a doctor to see the details.
      </Typography>

      {error && <Alert severity='error' style={{ margin: '15px 0px' }} >{error}</Alert>}

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
      />
    </Container>
  );
}

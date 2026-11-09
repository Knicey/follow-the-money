import { useEffect, useState } from 'react';
import { Container, Typography, Alert, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';

import config from '../config.json';

import { formatCurrency } from '../helpers/formatter';

export default function CompanyHomePage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(25);

  // TODO: replace this useEffect and columns with actual
  useEffect(() => setLoading(false))
  const columns = []

  // useEffect(() => {
  //   fetch(`http://${config.server_host}:${config.server_port}/doctors`)
  //     .then(res => res.json())
  //     .then(resJson => setDoctors(resJson))
  //     .catch(() => setError('Could not load doctors. Check that the backend is running.'))
  //     .finally(() => setLoading(false));
  // }, []);

  // const columns = [
  //   {
  //     field: 'name',
  //     headerName: 'Doctor',
  //     minWidth: 180,
  //     flex: 1,
  //     valueGetter: (params) => `${params.row.last_name}, ${params.row.first_name}`,
  //     renderCell: (params) => (
  //       <Link component={NavLink} to={`/doctor/${params.row.npi}`} underline='hover'>
  //         {params.value}
  //       </Link>
  //     ),
  //   },
  //   {
  //     field: 'specialty',
  //     headerName: 'Specialty',
  //     minWidth: 180,
  //     flex: 1.2,
  //   },
  //   { field: 'city', headerName: 'City', minWidth: 150 },
  //   { field: 'state', headerName: 'State', minWidth: 80 },
  //   {
  //     field: 'total_payments',
  //     headerName: 'Payments received',
  //     type: 'number',
  //     minWidth: 180,
  //     flex: 1,
  //     valueFormatter: ({ value }) => formatCurrency(value),
  //   },
  //   {
  //     field: 'total_drug_cost',
  //     headerName: 'Prescription drug cost',
  //     type: 'number',
  //     minWidth: 180,
  //     flex: 1,
  //     valueFormatter: ({ value }) => formatCurrency(value),
  //   },
  // ];

  return (
    <Container>
      <Typography variant='h4' sx={{ my: 2 }}>
        Companies
      </Typography>
      <Typography sx={{ my: 2 }}>
        TODO: insert description
      </Typography>

      {error && <Alert severity='error' sx={{ my: 2 }} >{error}</Alert>}

      <DataGrid
        rows={companies}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[25, 50, 100]}
        getRowId={(row) => row.npi}
        loading={loading}
        autoHeight
        initialState={{ sorting: { sortModel: [{ field: 'total_payments', sort: 'desc' }] } }}
        sx={{ my: 4 }}
        variant="company"
      />
    </Container>
  );
}

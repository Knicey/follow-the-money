import { useEffect, useState } from 'react';
import { Container, Typography, Alert, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';


import config from '../config.json';

import { formatCurrency, formatNumber } from '../helpers/formatter';

export default function CompanyHomePage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(25);

  // TODO: replace this useEffect and columns with actual
  // useEffect(() => {
  //   fetch(`http://${config.server_host}:${config.server_port}/companies`)
  //     .then(res => res.json())
  //     .then(resJson => setCompanies(resJson))
  //     .catch(() => setError('Could not load companies. Check that the backend is running.'))
  //     .finally(() => setLoading(false));
  // }, []);


  // const columns = [
  //   {
  //     field: 'company_name',
  //     headerName: 'Company Name',
  //     minWidth: 200,
  //     flex: 1,
  //     renderCell: (params) => (
  //       <Link component={NavLink} to={`/companies/${params.row.company_id}`} underline='hover'>
  //         {params.value}
  //       </Link>
  //     ),
  //   },
  //   {
  //     field: 'company_id',
  //     headerName: 'Company ID',
  //     minWidth: 180,
  //     flex: 1.2,
  //   },
  //   {
  //     field: 'total_payments',
  //     headerName: 'Total Payments',
  //     type: 'number',
  //     minWidth: 180,
  //     flex: 1,
  //     valueFormatter: ({ value }) => formatCurrency(value),
  //   },
  // ];

    // TODO: replace this useEffect and columns with actual
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/company-payments`)
      .then(res => res.json())
      .then(resJson => setCompanies(resJson))
      .catch(() => setError('Could not load companies. Check that the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      field: 'company_name',
      headerName: 'Company Name',
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <Link component={NavLink} to={`/companies/${params.row.company_id}`} underline='hover'>
          {params.value}
        </Link>
      ),
    },
    {
      field: 'company_id',
      headerName: 'Company ID',
      minWidth: 100,
      flex: 0.7,
    },
    {
      field: 'doctors_paid',
      headerName: 'Doctors Paid',
      type: 'number',
      minWidth: 100,
      flex: 0.7,
      valueFormatter: ({ value }) => formatNumber(value),
    },
     {
      field: 'payment_records',
      headerName: 'Payments',
      type: 'number',
      minWidth: 100,
      flex: 0.7,
      valueFormatter: ({ value }) => formatNumber(value),
    },
    {
      field: 'total_amount',
      headerName: 'Total Amount',
      type: 'number',
      minWidth: 180,
      flex: 1,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
  ];

  return (
    <Container>
      <Typography variant='h4' sx={{ my: 2 }}>
        Companies
      </Typography>
      <Typography color='text.secondary' sx={{ my: 2 }}>
        See the total payments each company made. Select a company to see the details.
      </Typography>

      {error && <Alert severity='error' sx={{ my: 2 }} >{error}</Alert>}

      <DataGrid
        rows={companies}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[25, 50, 100]}
        getRowId={(row) => row.company_id}
        loading={loading}
        autoHeight
        initialState={{ sorting: { sortModel: [{ field: 'total_amount', sort: 'desc' }] } }}
        sx={{ my: 4 }}
        variant="company"
      />
    </Container>
  );
}

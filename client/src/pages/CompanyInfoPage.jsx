import { useEffect, useState, } from 'react';
import { Container, Link, Typography, Stack, Card, Alert, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink, useParams } from 'react-router-dom';

import config from '../config.json';

import { formatCurrency, formatNumber } from '../helpers/formatter';


export default function CompanyInfoPage(props) {
  const { company_id } = useParams();

  // const [company, setCompany] = useState(null);
  const [company, setCompany] = useState(null);
  const [payments, setPayments] = useState([]);
  const [drugPayments, setDrugPayments] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [errorCompany, setErrorCompany] = useState(null);
  const [loadingPay, setLoadingPay] = useState(true);
  const [loadingDrug, setLoadingDrug] = useState(true);
  const [errorPay, setErrorPay] = useState(null);
  const [errorDrug, setErrorDrug] = useState(null);
  const [pageSizePay, setPageSizePay] = useState(10);
  const [pageSizeDrug, setPageSizeDrug] = useState(10);

  useEffect(() => {

    fetch(`http://${config.server_host}:${config.server_port}/company/${company_id}`)
      .then(res => res.json())
      .then(resJson => setCompany(resJson))
      .catch(() => setErrorCompany('Could not load company info. Check that the backend is running.'))
      .finally(() => setLoadingCompany(false));
        
    fetch(`http://${config.server_host}:${config.server_port}/companies/${company_id}/payments`)
      .then(res => res.json())
      .then(resJson => setPayments(resJson))
      .catch(() => setErrorPay('Could not load company payments. Check that the backend is running.'))
      .finally(() => setLoadingPay(false));

    fetch(`http://${config.server_host}:${config.server_port}/companies/${company_id}/drug-payments`)
      .then(res => res.json())
      .then(resJson => setDrugPayments(resJson))
      .catch(() => setErrorDrug('Could not load company drug payments. Check that the backend is running.'))
      .finally(() => setLoadingDrug(false));
   

  }, [company_id]);


  const paymentColumns = [
    // { field: "record_id", headerName: "Record ID", width: 100 },
    { field: "doctor", 
      headerName: "Doctor", 
      minWidth: 180, 
      flex: 0.8,
      valueGetter: (params) => `${params.row.last_name},  ${params.row.first_name}`,
      renderCell: (params) => (
        <Link component={NavLink} to={`/doctor/${params.row.npi}`} underline="hover">
          {params.value}
        </Link>
      )
    },
    { 
      field: "amount", 
      headerName: "Amount",
      type: "number",
      minWidth: 80,
      flex: 0.5,
      valueFormatter: ({ value }) => formatCurrency(value)
    },
    {
      field: "number_of_payments",
      headerName: "Payments",
      type: "number",
      minWidth: 70,
      flex: 0.5,
      valueFormatter: ({ value }) => formatNumber(value)
    },
    { field: 'nature_of_payments', headerName: 'Nature', minWidth: 180, flex: 1 },
    { field: 'form_of_payments', headerName: 'Form', minWidth: 150, flex: 0.7 },
  ];



  const drugPaymentColumns = [
    {
      field: "brand_name",
      headerName: "Brand Name",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Link component={NavLink} to={`/drug/${params.row.drug_id}`} underline="hover">
          {params.value}
        </Link>
      )
    },
    {
      field: "n_related_payments",
      headerName: "Related Payments",
      type: "number",
      minWidth: 100,
      flex: 0.5,
      valueFormatter: ({ value }) => formatNumber(value)
    },
    {
      field: "total_related_payments",
      headerName: "Total Related Payments",
      type: "number",
      minWidth: 120,
      flex: 0.7,
      valueFormatter: ({ value }) => formatCurrency(value)
    }
  ];

  return (
    <Container>

      <Chip
        label='Company'
        size='small'
        component={NavLink}
        to='/company'
        clickable
        variant='company'
        sx={{ mt: 3 }}
      />

      {errorCompany && <Alert severity='error' sx={{ my: 2 }}>{errorCompany}</Alert>}

      <Typography variant='h4' sx={{ my: 1 }}>
        {company ? `${company.company_name}` : (errorCompany ? 'Error' : 'Loading...')}
      </Typography>

      {company && (
        <Typography color='text.secondary'>
          {`${company.state || ''}, ${company.country}`}<br/>
          {`Company ID: ${company.company_id}`}
        </Typography>
      )}

      {company && (
        <Stack direction='row' spacing={2} sx={{ my: 3 }}>
          <Card variant='outlined' sx={{ p: 2, flex: 1 }}>
            <Typography variant='body2' color='text.secondary'>Total Payments Made</Typography>
            <Typography variant='h5' sx={{ color: 'success.dark' }}>{formatCurrency(company.total_payments)}</Typography>
          </Card>
          <Card variant='outlined' sx={{ p: 2, flex: 1 }}>
            <Typography variant='body2' color='text.secondary'>Related Drug Count</Typography>
            <Typography variant='h5' sx={{ color: 'secondary.dark' }}>{formatNumber(company.number_of_drugs)}</Typography>
          </Card>
        </Stack>
      )}

      <Typography variant='h5' sx={{ mt: 4 }}>Payments Made To Doctors</Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        Click on doctor to see all all payments received by that doctor.
      </Typography>
      {errorPay && <Alert severity='error' sx={{ mb: 1 }}>{errorPay}</Alert>}
      <DataGrid
        rows={payments}
        columns={paymentColumns}
        getRowId={(row) => row.record_id}
        loading={loadingPay}
        pageSize={pageSizePay}
        onPageSizeChange={setPageSizePay}
        rowsPerPageOptions={[10, 25, 50]}
        autoHeight
        variant='doctor'
      />

      <Typography variant='h5' sx={{ mt: 4, mb: 1 }}>Drug Related Payments</Typography>
      {errorDrug && <Alert severity='error' sx={{ mb: 1 }}>{errorDrug}</Alert>}
      <DataGrid
        rows={drugPayments}
        columns={drugPaymentColumns}
        getRowId={(row) => row.drug_id}
        loading={loadingDrug}
        pageSize={pageSizeDrug}
        onPageSizeChange={setPageSizeDrug}
        rowsPerPageOptions={[10, 25, 50]}
        autoHeight
        sx={{ mb: 4 }}
        variant='drug'
      />
    </Container>
  );
}

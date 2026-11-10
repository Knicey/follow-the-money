import { useEffect, useState, } from 'react';
import { Container, Link, Typography, Stack, Card, Alert, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink, useParams } from 'react-router-dom';

import config from '../config.json';

import PaymentDrugCard from '../components/PaymentDrugCard';
import { formatCurrency, formatNumber } from '../helpers/formatter';

const API = `http://${config.server_host}:${config.server_port}`;

export default function DoctorInfoPage() {
  const { npi } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [payments, setPayments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [errorDoc, setErrorDoc] = useState(null);
  const [loadingPay, setLoadingPay] = useState(true);
  const [errorPay, setErrorPay] = useState(null);
  const [loadingPre, setLoadingPre] = useState(true);
  const [errorPre, setErrorPre] = useState(null);
  const [pageSizePay, setPageSizePay] = useState(10);
  const [pageSizePre, setPageSizePre] = useState(10);

  // drugs for the payment row the user clicked
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetch(`${API}/doctors/${npi}`)
      .then(res => res.json())
      .then(resJson => setDoctor(resJson))
      .catch(() => setErrorDoc('Could not load doctor info. Check that the backend is running.'));

    fetch(`${API}/doctors/${npi}/payments`)
      .then(res => res.json())
      .then(resJson => setPayments(resJson))
      .catch(() => setErrorPay('Could not load doctor payments. Check that the backend is running.'))
      .finally(() => setLoadingPay(false));
    
    fetch(`${API}/prescription-by-doctor/${npi}`)
      .then(res => res.json())
      .then(resJson => setPrescriptions(resJson))
      .catch(() => setErrorPre('Could not load doctor prescriptions. Check that the backend is running.'))
      .finally(() => setLoadingPre(false));
  }, []);

  const paymentColumns = [
    {
      field: 'company_name',
      headerName: 'Company',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Link component={NavLink} to={`/company/${params.row.company_id}`} underline='hover'>
          {params.value}
        </Link>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      minWidth: 100,
      flex: 0.7,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
    {
      field: 'number_of_payments',
      headerName: 'Payments',
      type: 'number',
      minWidth: 70,
      valueFormatter: ({ value }) => formatNumber(value),
    },
    { field: 'nature_of_payments', headerName: 'Nature', minWidth: 180, flex: 1 },
    { field: 'form_of_payments', headerName: 'Form', minWidth: 180, flex: 1 },
  ];

  const prescriptionColumns = [
    {
      field: 'brand_name',
      headerName: 'Drug',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Link component={NavLink} to={`/drug/${params.row.drug_id}`} underline='hover'>
          {params.value}
        </Link>
      ),
    },
    { field: 'generic_name', headerName: 'Generic name', minWidth: 180, flex: 1 },
    {
      field: 'total_claims',
      headerName: 'Claims',
      type: 'number',
      minWidth: 100,
      valueFormatter: ({ value }) => formatNumber(value),
    },
    {
      field: 'total_beneficiaries',
      headerName: 'Patients',
      type: 'number',
      minWidth: 100,
      valueFormatter: ({ value }) => formatNumber(value),
    },
    {
      field: 'total_drug_cost',
      headerName: 'Drug cost',
      type: 'number',
      minWidth: 140,
      flex: 1,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
  ];

  return (
    <Container>
      {selectedPayment && <PaymentDrugCard
        payment={selectedPayment}
        handleClose={() => setSelectedPayment(null)} 
      />}

      <Chip
        label='Doctor'
        size='small'
        component={NavLink}
        to='/doctor'
        clickable
        variant='doctor'
        sx={{ mt: 3 }}
      />

      {errorDoc && <Alert severity='error' sx={{ my: 2 }}>{errorDoc}</Alert>}

      <Typography variant='h4' sx={{ my: 1 }}>
        {doctor ? `${doctor.first_name} ${doctor.last_name}` : (errorDoc ? 'Error' : 'Loading...')}
      </Typography>

      {doctor && (
        <Typography color='text.secondary'>
          {doctor.specialty}<br/>
          {`${doctor.city}, ${doctor.state}`}<br/>
          {`NPI: ${doctor.npi}`}
        </Typography>
      )}

      {doctor && (
        <Stack direction='row' spacing={2} sx={{ my: 3 }}>
          <Card variant='outlined' sx={{ p: 2, flex: 1 }}>
            <Typography variant='body2' color='text.secondary'>Payments received</Typography>
            <Typography variant='h5' sx={{ color: 'success.dark' }}>{formatCurrency(doctor.total_payments)}</Typography>
          </Card>
          <Card variant='outlined' sx={{ p: 2, flex: 1 }}>
            <Typography variant='body2' color='text.secondary'>Cost of drugs prescribed</Typography>
            <Typography variant='h5' sx={{ color: 'secondary.dark' }}>{formatCurrency(doctor.total_drug_cost)}</Typography>
          </Card>
        </Stack>
      )}

      <Typography variant='h5' sx={{ mt: 4 }}>Payments received</Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        Click a payment row to see the drugs it was linked to.
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
        onRowClick={(params) => setSelectedPayment(params.row)}
        autoHeight
        variant='company'
      />

      <Typography variant='h5' sx={{ mt: 4, mb: 1 }}>Drugs prescribed</Typography>
      {errorPre && <Alert severity='error' sx={{ mb: 1 }}>{errorPre}</Alert>}
      <DataGrid
        rows={prescriptions}
        columns={prescriptionColumns}
        getRowId={(row) => row.drug_id}
        loading={loadingPre}
        pageSize={pageSizePre}
        onPageSizeChange={setPageSizePre}
        rowsPerPageOptions={[10, 25, 50]}
        autoHeight
        sx={{ mb: 4 }}
        variant='drug'
      />
    </Container>
  );
}

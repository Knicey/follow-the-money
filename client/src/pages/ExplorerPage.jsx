
import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  Link,
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Autocomplete,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import config from '../config.json';
import {
  formatCurrency,
  formatNumber,
} from '../helpers/formatter';

const STATE_NAMES = {
  ID: 'Idaho',
  NM: 'New Mexico',
  WV: 'West Virginia',
};

const getSpecialty = (row) =>
  row.specialty || 'Unknown specialty';

const columns = [
  {
    field: 'name',
    headerName: 'Physician',
    minWidth: 180,
    flex: 1,
    valueGetter: (params) =>
      `${params.row.last_name}, ${params.row.first_name}`,
    renderCell: (params) => (
      <Link
        component={NavLink}
        to={`/doctor/${params.row.npi}`}
        underline='hover'
      >
        {params.value}
      </Link>
    ),
  },
  {
    field: 'specialty',
    headerName: 'Specialty',
    minWidth: 220,
    flex: 1.2,
    valueGetter: (params) => getSpecialty(params.row),
  },
  {
    field: 'city',
    headerName: 'City',
    minWidth: 120,
    valueGetter: (params) => params.row.city || 'Unknown',
  },
  {
    field: 'state',
    headerName: 'State',
    width: 80,
  },
  {
    field: 'total_payments',
    headerName: 'Payments received',
    type: 'number',
    minWidth: 170,
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
  {
    field: 'total_claims',
    headerName: 'Claims',
    type: 'number',
    minWidth: 100,
    valueFormatter: ({ value }) => formatNumber(value),
  },
];

export default function ExplorerPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(25);

  const [state, setState] = useState('');
  const [specialty, setSpecialty] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `http://${config.server_host}:${config.server_port}/doctor-payments`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setRows(data))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(
            'Could not load physician data. Check that the backend is running.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const states = useMemo(() => {
    return [...new Set(rows.map((row) => row.state))].sort();
  }, [rows]);

  const regionalRows = useMemo(() => {
    return rows.filter((row) => !state || row.state === state);
  }, [rows, state]);

  const specialties = useMemo(() => {
    return [
      ...new Set(regionalRows.map(getSpecialty)),
    ].sort();
  }, [regionalRows]);

  const filteredRows = useMemo(() => {
    return regionalRows.filter(
      (row) => !specialty || getSpecialty(row) === specialty
    );
  }, [regionalRows, specialty]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (totals, row) => {
        totals.payments += Number(row.total_payments || 0);
        totals.drugCost += Number(row.total_drug_cost || 0);
        totals.claims += Number(row.total_claims || 0);
        return totals;
      },
      { payments: 0, drugCost: 0, claims: 0 }
    );
  }, [filteredRows]);

  const chartData = useMemo(() => {
    const groups = new Map();

    filteredRows.forEach((row) => {
      const name = getSpecialty(row);
      const amount = Number(row.total_payments || 0);

      groups.set(name, (groups.get(name) || 0) + amount);
    });

    return [...groups.entries()]
      .map(([name, payments]) => ({
        name,
        shortName: name.split('|').pop(),
        payments,
      }))
      .sort((a, b) => b.payments - a.payments)
      .slice(0, 10);
  }, [filteredRows]);

  const metrics = [
    {
      label: 'Physicians',
      value: formatNumber(filteredRows.length),
    },
    {
      label: 'Industry payments',
      value: formatCurrency(summary.payments),
    },
    {
      label: 'Prescription drug costs',
      value: formatCurrency(summary.drugCost),
    },
    {
      label: 'Prescription claims',
      value: formatNumber(summary.claims),
    },
  ];

  return (
    <Container>
      <Typography variant='h4' sx={{ my: 2 }}>
        Region & Specialty Explorer
      </Typography>

      <Typography color='text.secondary' sx={{ my: 2 }}>
        Explore industry payments and Medicare prescription
        activity across states and medical specialties.
        Filter the results to compare physician populations
        and financial activity.
      </Typography>

      {error && (
        <Alert severity='error' sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant='outlined' sx={{ p: 3, my: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label='State'
              value={state}
              onChange={(event) => {
                setState(event.target.value);
                setSpecialty(null);
              }}
            >
              <MenuItem value=''>All states</MenuItem>

              {states.map((code) => (
                <MenuItem key={code} value={code}>
                  {STATE_NAMES[code] || code}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={specialties}
              value={specialty}
              onChange={(_, value) => setSpecialty(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Medical specialty'
                  placeholder='All specialties'
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant='outlined'
              onClick={() => {
                setState('');
                setSpecialty(null);
              }}
            >
              Reset filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Paper variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Typography variant='body2' color='text.secondary'>
                {metric.label}
              </Typography>

              <Typography
                variant='h6'
                sx={{ mt: 1, fontWeight: 600 }}
              >
                {loading || error ? '—' : metric.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {!loading && !error && chartData.length > 0 && (
        <Paper variant='outlined' sx={{ p: 3, my: 3 }}>
          <Typography variant='h6'>
            Top specialties by industry payments
          </Typography>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 2 }}
          >
            Total reported payments for the selected filters.
          </Typography>

          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={chartData}
                layout='vertical'
                margin={{ top: 10, right: 25, bottom: 10, left: 10 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  type='number'
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                    }).format(value)
                  }
                />
                <YAxis
                  type='category'
                  dataKey='shortName'
                  width={190}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    'Industry payments',
                  ]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.name || label
                  }
                />
                <Bar
                  dataKey='payments'
                  fill='#207991'
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      <Typography variant='h6' sx={{ mt: 4 }}>
        Physician breakdown
      </Typography>

      <Typography color='text.secondary' sx={{ my: 1 }}>
        Showing {formatNumber(filteredRows.length)} physicians.
        Select a physician to view their details.
      </Typography>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[25, 50, 100]}
        getRowId={(row) => row.npi}
        loading={loading}
        autoHeight
        initialState={{
          sorting: {
            sortModel: [
              { field: 'total_payments', sort: 'desc' },
            ],
          },
        }}
        sx={{ my: 2 }}
      />

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ my: 3 }}
      >
        Data source: 2023 CMS Open Payments and Medicare
        Part D data for Idaho, New Mexico, and West Virginia.
        Missing specialties are classified as unknown.
        Reported payments do not establish a causal relationship
        with prescribing behavior.
      </Typography>
    </Container>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import config from '../config.json';
import { formatCurrency } from '../helpers/formatter';

const ALL = 'all';
const chartColors = { paid: '#1f7d99', unpaid: '#f99115' };
const prescriptionColors = { low: '#bfdbfe', high: '#1e3a8a' };
const prescriptionClaimsColorRange = { min: 1, max: 5000 };

function getPrescriptionColor(value) {
  const ratio = Math.max(
    0,
    Math.min(
      1,
      (value - prescriptionClaimsColorRange.min)
        / (prescriptionClaimsColorRange.max - prescriptionClaimsColorRange.min),
    ),
  );
  const low = [0xbf, 0xdb, 0xfe];
  const high = [0x1e, 0x3a, 0x8a];
  const channels = low.map((channel, index) => (
    Math.round(channel + (high[index] - channel) * ratio)
  ));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function formatMetric(value, metric) {
  if (value == null || !Number.isFinite(value)) return '—';
  return metric === 'cost_per_claim'
    ? formatCurrency(value)
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function getRowId(row) {
  return `${row.specialty}-${row.state}-${row.drug_id}-${row.payment_status}`;
}

export default function InfluencePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialty, setSpecialty] = useState(ALL);
  const [state, setState] = useState(ALL);
  const [claimsFilterEnabled, setClaimsFilterEnabled] = useState(false);
  const [minimumClaims, setMinimumClaims] = useState('1');
  const [axisMaxFilterEnabled, setAxisMaxFilterEnabled] = useState(false);
  const [maximumAxisValue, setMaximumAxisValue] = useState('5000');

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      try {
        const response = await fetch(
          `http://${config.server_host}:${config.server_port}/prescription-between-doctors`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`The analytics service returned status ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The analytics service returned an unexpected response.');
        }
        setRows(data);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Could not load prescribing comparisons. Check that the backend is running.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAnalytics();
    return () => controller.abort();
  }, []);

  const specialties = useMemo(
    () => [...new Set(rows.map((row) => row.specialty).filter(Boolean))].sort(),
    [rows],
  );
  const states = useMemo(
    () => [...new Set(rows.map((row) => row.state).filter(Boolean))].sort(),
    [rows],
  );
  const filteredRows = useMemo(
    () => rows.filter((row) => (
      (specialty === ALL || row.specialty === specialty)
      && (state === ALL || row.state === state)
    )),
    [rows, specialty, state],
  );

  const comparison = useMemo(() => {
    const groups = {
      Paid: { claims: 0, prescribers: 0, cost: 0 },
      Unpaid: { claims: 0, prescribers: 0, cost: 0 },
    };

    filteredRows.forEach((row) => {
      const group = groups[row.payment_status];
      if (!group) return;
      group.claims += Number(row.total_claims) || 0;
      group.prescribers += Number(row.prescribing_doctors) || 0;
      group.cost += Number(row.total_drug_cost) || 0;
    });

    return Object.entries(groups).map(([name, group]) => ({
      name,
      averageClaims: group.prescribers ? group.claims / group.prescribers : null,
      costPerClaim: group.claims ? group.cost / group.claims : null,
      prescribers: group.prescribers,
    }));
  }, [filteredRows]);

  const drugScatterData = useMemo(() => {
    const drugsById = new Map();

    filteredRows.forEach((row) => {
      let drug = drugsById.get(row.drug_id);
      if (!drug) {
        drug = {
          drugId: row.drug_id,
          drugName: row.brand_name || row.generic_name || `Drug ${row.drug_id}`,
          paidCost: 0,
          paidClaims: 0,
          unpaidCost: 0,
          unpaidClaims: 0,
        };
        drugsById.set(row.drug_id, drug);
      }

      if (row.payment_status === 'Paid') {
        drug.paidCost += Number(row.total_drug_cost) || 0;
        drug.paidClaims += Number(row.total_claims) || 0;
      } else if (row.payment_status === 'Unpaid') {
        drug.unpaidCost += Number(row.total_drug_cost) || 0;
        drug.unpaidClaims += Number(row.total_claims) || 0;
      }
    });

    return [...drugsById.values()]
      .filter((drug) => drug.paidClaims > 0 && drug.unpaidClaims > 0)
      .map((drug) => ({
        drugId: drug.drugId,
        drugName: drug.drugName,
        paidCostPerClaim: drug.paidCost / drug.paidClaims,
        unpaidCostPerClaim: drug.unpaidCost / drug.unpaidClaims,
        prescriptionClaims: drug.paidClaims + drug.unpaidClaims,
      }));
  }, [filteredRows]);
  const numericMinimumClaims = Number(minimumClaims);
  const numericMaximumAxisValue = Number(maximumAxisValue);
  const validClaimsFilter = claimsFilterEnabled
    && Number.isFinite(numericMinimumClaims)
    && numericMinimumClaims >= 0;
  const validAxisMaxFilter = axisMaxFilterEnabled
    && Number.isFinite(numericMaximumAxisValue)
    && numericMaximumAxisValue > 0;
  const filteredDrugScatterData = drugScatterData.filter((drug) => (
    (!validClaimsFilter || drug.prescriptionClaims >= numericMinimumClaims)
    && (!validAxisMaxFilter
      || (drug.paidCostPerClaim <= numericMaximumAxisValue
        && drug.unpaidCostPerClaim <= numericMaximumAxisValue))
  ));
  const activeScatterDomainMax = validAxisMaxFilter
    ? numericMaximumAxisValue
    : filteredDrugScatterData.reduce(
      (max, drug) => Math.max(max, drug.paidCostPerClaim, drug.unpaidCostPerClaim),
      0,
    ) || 1;

  const columns = [
    { field: 'specialty', headerName: 'Specialty', minWidth: 180, flex: 1 },
    { field: 'state', headerName: 'State', width: 100 },
    { field: 'brand_name', headerName: 'Drug', minWidth: 190, flex: 1.2 },
    { field: 'payment_status', headerName: 'Payment status', width: 150 },
    {
      field: 'prescribing_doctors',
      headerName: 'Prescribers',
      type: 'number',
      width: 125,
    },
    {
      field: 'avg_claims_per_prescriber',
      headerName: 'Avg. claims / prescriber-drug pair',
      type: 'number',
      minWidth: 190,
      valueFormatter: ({ value }) => formatMetric(value, 'average_claims'),
    },
    {
      field: 'cost_per_claim',
      headerName: 'Cost / claim',
      type: 'number',
      width: 145,
      valueFormatter: ({ value }) => formatMetric(value, 'cost_per_claim'),
    },
    {
      field: 'total_claims',
      headerName: 'Total claims',
      type: 'number',
      width: 130,
      valueFormatter: ({ value }) => new Intl.NumberFormat('en-US').format(value),
    },
  ];

  const paidComparison = comparison.find((group) => group.name === 'Paid');
  const unpaidComparison = comparison.find((group) => group.name === 'Unpaid');
  const chartData = [{
    name: 'Selected comparison',
    paid: paidComparison.averageClaims,
    unpaid: unpaidComparison.averageClaims,
  }];
  const costChartData = [{
    name: 'Selected comparison',
    paid: paidComparison.costPerClaim,
    unpaid: unpaidComparison.costPerClaim,
  }];
  const hasPaidData = paidComparison.prescribers > 0;
  const hasUnpaidData = unpaidComparison.prescribers > 0;

  return (
    <Container maxWidth='xl'>
      <Typography variant='h4' sx={{ my: 2 }}>
        Influence Finder
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Compare prescribing patterns for physicians who received industry payments and those who did not.
        Differences show an association, not proof that payments caused a prescribing choice.
      </Typography>

      {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>Narrow the comparison</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id='influence-specialty-label'>Specialty</InputLabel>
              <Select
                labelId='influence-specialty-label'
                id='influence-specialty'
                value={specialty}
                label='Specialty'
                onChange={(event) => {
                  setSpecialty(event.target.value);
                  resetScatterZoom();
                }}
              >
                <MenuItem value={ALL}>All specialties</MenuItem>
                {specialties.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id='influence-state-label'>State</InputLabel>
              <Select
                labelId='influence-state-label'
                id='influence-state'
                value={state}
                label='State'
                onChange={(event) => {
                  setState(event.target.value);
                  resetScatterZoom();
                }}
              >
                <MenuItem value={ALL}>All states</MenuItem>
                {states.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {!loading && !error && filteredRows.length > 0 && (!hasPaidData || !hasUnpaidData) && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          {!hasPaidData && 'No prescribers with recorded payments match these filters. '}
          {!hasUnpaidData && 'No prescribers with zero or missing payment records match these filters. '}
          A comparison is available only when both payment groups exist in the source data.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper variant='outlined' sx={{ p: 2, height: 330 }}>
            <Typography variant='h6'>Average claims per prescriber-drug pair</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Across all drugs in the selected specialty and state
            </Typography>
            <ResponsiveContainer width='100%' height='85%'>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip formatter={(value) => formatMetric(value, 'average_claims')} />
                <Bar dataKey='paid' name='Received payments' fill={chartColors.paid} />
                <Bar dataKey='unpaid' name='No payments' fill={chartColors.unpaid} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant='outlined' sx={{ p: 2, height: 330 }}>
            <Typography variant='h6'>Prescription cost per claim</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Total drug cost divided by total claims
            </Typography>
            <ResponsiveContainer width='100%' height='85%'>
              <BarChart data={costChartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatMetric(value, 'cost_per_claim')} />
                <Bar dataKey='paid' name='Received payments' fill={chartColors.paid} />
                <Bar dataKey='unpaid' name='No payments' fill={chartColors.unpaid} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
        <Typography variant='h6'>Prescription cost per claim by drug</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          Each point is a drug. Compare average cost per claim for doctors who received payments (X)
          with doctors who did not (Y), across the selected specialty and state. The dashed line marks
          equal costs (slope = 1).
        </Typography>
        <Grid container alignItems='center' spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} md='auto'>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={claimsFilterEnabled}
                  onChange={(event) => setClaimsFilterEnabled(event.target.checked)}
                />
              )}
              label='Filter by minimum prescription claims'
            />
            <TextField
              label='Minimum claims'
              type='number'
              size='small'
              value={minimumClaims}
              onChange={(event) => setMinimumClaims(event.target.value)}
              disabled={!claimsFilterEnabled}
              inputProps={{ min: 0, step: 1 }}
              sx={{ width: 150, ml: 1 }}
            />
          </Grid>
          <Grid item xs={12} md='auto'>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={axisMaxFilterEnabled}
                  onChange={(event) => setAxisMaxFilterEnabled(event.target.checked)}
                />
              )}
              label='Limit both axes'
            />
            <TextField
              label='Maximum X / Y'
              type='number'
              size='small'
              value={maximumAxisValue}
              onChange={(event) => setMaximumAxisValue(event.target.value)}
              disabled={!axisMaxFilterEnabled}
              inputProps={{ min: 0.01, step: 'any' }}
              sx={{ width: 150, ml: 1 }}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' spacing={1} sx={{ mb: 1 }}>
          <Grid item>
            <Typography variant='caption'>Prescription claims</Typography>
          </Grid>
          <Grid item>
            <Typography variant='caption'>
              {prescriptionClaimsColorRange.min.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item>
            <div
              aria-label='Prescription claims color scale from low to high'
              style={{
                width: 140,
                height: 12,
                borderRadius: 6,
                background: `linear-gradient(to right, ${prescriptionColors.low}, ${prescriptionColors.high})`,
              }}
            />
          </Grid>
          <Grid item>
            <Typography variant='caption'>
              {prescriptionClaimsColorRange.max.toLocaleString()}+
            </Typography>
          </Grid>
        </Grid>
        <Typography variant='caption' color='text.secondary' display='block'>
          Doctors with no payments ($ / claim)
        </Typography>
        {!loading && filteredDrugScatterData.length === 0 ? (
          <Alert severity='info' sx={{ mt: 2 }}>
            {drugScatterData.length === 0
              ? 'No drugs have prescribing records in both payment groups for these filters.'
              : 'No drugs match the selected claim-count and axis limits.'}
          </Alert>
        ) : (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width='100%' height='100%'>
              <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 72 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                type='number'
                dataKey='paidCostPerClaim'
                name='Received payments'
                domain={[0, activeScatterDomainMax]}
                allowDataOverflow={validAxisMaxFilter}
                tickFormatter={formatCurrency}
                label={{ value: 'Doctors who received payments ($ / claim)', position: 'insideBottom', offset: -12 }}
              />
              <YAxis
                type='number'
                dataKey='unpaidCostPerClaim'
                name='No payments'
                domain={[0, activeScatterDomainMax]}
                allowDataOverflow={validAxisMaxFilter}
                tickFormatter={formatCurrency}
              />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: activeScatterDomainMax, y: activeScatterDomainMax },
                ]}
                stroke='#666'
                strokeDasharray='6 4'
              />
              <Tooltip content={({ active, payload }) => {
                const drug = payload?.[0]?.payload;
                if (!active || !drug) return null;

                return (
                  <Paper variant='outlined' sx={{ p: 1.5 }}>
                    <Typography variant='subtitle2'>{drug.drugName}</Typography>
                    <Typography variant='body2'>
                      Received payments: {formatCurrency(drug.paidCostPerClaim)} / claim
                    </Typography>
                    <Typography variant='body2'>
                      No payments: {formatCurrency(drug.unpaidCostPerClaim)} / claim
                    </Typography>
                    <Typography variant='body2'>
                      Prescription claims: {drug.prescriptionClaims.toLocaleString()}
                    </Typography>
                  </Paper>
                );
              }} />
              <Scatter
                name='Drugs'
                data={filteredDrugScatterData}
              >
                {filteredDrugScatterData.map((drug) => (
                  <Cell
                    key={drug.drugId}
                    fill={getPrescriptionColor(drug.prescriptionClaims)}
                  />
                ))}
              </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </Paper>

      <Typography variant='h6' sx={{ mb: 1 }}>Prescribing detail</Typography>
      {!loading && !error && filteredRows.length === 0 && (
        <Alert severity='info' sx={{ mb: 2 }}>No prescribing records match these filters.</Alert>
      )}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        getRowId={getRowId}
        loading={loading}
        autoHeight
        pageSize={25}
        rowsPerPageOptions={[25, 50, 100]}
        initialState={{ sorting: { sortModel: [{ field: 'avg_claims_per_prescriber', sort: 'desc' }] } }}
        sx={{
          mb: 4,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'secondary.dark',
            color: '#fff',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
        }}
      />
    </Container>
  );
}

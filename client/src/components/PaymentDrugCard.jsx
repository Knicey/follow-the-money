import { useEffect, useState } from 'react';
import { Box, Button, Modal, Alert, Typography, Stack, Chip } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { formatCurrency } from '../helpers/formatter';
import config from '../config.json';


export default function PaymentDrugCard({ payment, handleClose }) {
  const [paymentDrugs, setPaymentDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/payment-by-drug/${payment.record_id}`)
      .then(res => res.json())
      .then(resJson => setPaymentDrugs(resJson))
      .catch(() => setError('Could not load drugs associated with payment. Check that the backend is running.'))
      .finally(() => setLoading(false));
  }, [payment]);

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <div style={{ margin: 20 }}>
          <Typography variant='body2'>
            Company
          </Typography>
          <Chip
            key={payment.company_id}
            label={payment.company_name}
            component={NavLink}
            to={`/company/${payment.company_id}`}
            clickable
            variant='company'
            sx={{ mb: 2 }}
          />
          <Typography variant='body2'>
            Payment
          </Typography>
          <Typography variant='body1' sx={{ mb: 2 }}>
            <b>{formatCurrency(payment.amount)}</b>
          </Typography>
          <Typography variant='body2'>
            Related Drugs
          </Typography>
          {loading ? (
            <Typography variant='body2' color='text.secondary'>Loading...</Typography>
          ) : error ? (
            <Alert severity='error'>{error}</Alert>
          ) : paymentDrugs.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>None listed.</Typography>
          ) : (
            <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
              {paymentDrugs.map(drug => (
                <Chip
                  key={drug.drug_id}
                  label={drug.brand_name}
                  component={NavLink}
                  to={`/drug/${drug.drug_id}`}
                  clickable
                  variant='drug'
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          )}
        </div>
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}

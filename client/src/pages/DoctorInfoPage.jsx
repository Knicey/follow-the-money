import { useEffect, useState, } from 'react';
import { Box, Container } from '@mui/material';
import { NavLink, useParams } from 'react-router-dom';

import config from '../config.json';

export default function DoctorInfoPage() {
  const { doctor_id } = useParams();

  // const [doctors, setDoctors] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [pageSize, setPageSize] = useState(25);

  // useEffect(() => {
  //   fetch(`http://${config.server_host}:${config.server_port}/doctors`)
  //     .then(res => res.json())
  //     .then(resJson => setDoctors(resJson))
  //     .catch(() => setError('Could not load doctors. Check that the backend is running.'))
  //     .finally(() => setLoading(false));
  // }, []);

  return (
    <Container>
      {doctor_id}
    </Container>
  );
}

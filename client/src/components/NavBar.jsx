import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h4' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontWeight: isMain ? 700 : 550,
        letterSpacing: isMain ? 'unset' : '0.05rem',
textTransform: isMain ? 'unset' : 'uppercase',
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavLink
            to='/'
            style={{
              width: '80px',
              margin: '12px 20px 6px 0px',
              textDecoration: 'none',
            }}
          >
            <img src="/logo.jpg" alt="Logo" width="80" />
          </NavLink>
          <NavText href='/' text='Follow the Money' isMain />
          <NavText href='/albums' text='ALBUMS' />
          <NavText href='/songs' text='SONGS' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

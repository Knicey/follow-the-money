import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import DoctorHomePage from './pages/DoctorHomePage';
import DoctorInfoPage from './pages/DoctorInfoPage';
import CompanyHomePage from './pages/CompanyHomePage';
import CompanyInfoPage from './pages/CompanyInfoPage';
import DrugHomePage from './pages/DrugHomePage';
import DrugInfoPage from './pages/DrugInfoPage';
import ExplorerPage from './pages/ExplorerPage';
import InfluencePage from './pages/InfluencePage';

const headingFont = '"Poppins", "Helvetica", "Arial", sans-serif';
const bodyFont = '"Helvetica", "Arial", sans-serif';

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1f7d99', // teal
    },
    secondary: {
      main: '#f99115', // orange pills
    },
    success: {
      main: '#127a46', // green
    },
  },
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: headingFont, fontWeight: 600 },
    h2: { fontFamily: headingFont, fontWeight: 600 },
    h3: { fontFamily: headingFont, fontWeight: 600 },
    h4: { fontFamily: headingFont, fontWeight: 500 },
    h5: { fontFamily: headingFont, fontWeight: 500 },
    h6: { fontFamily: headingFont, fontWeight: 500 },
    h7: { fontFamily: headingFont, fontWeight: 500 },
  },
});

/*
 * Logo colors
 *
 * Teals
 *  #1f7d99
 *  #005b77
 *  #34b1ce
 *  #2199ad
 *
 * Greens (dollar bill)
 *  #a1e6bc
 *  #5dcd8a
 *  #4ba670
 *  #127a46
 *
 * Oranges (pills)
 *  #f99115
 *  #f27e00
 *  #ffa836
 *
 * Greys
 *  #eaeaea
 *  #cccccc
 *  #999999
 */

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctor" element={<DoctorHomePage />} />
          <Route path="/doctor/:doctor_id" element={<DoctorInfoPage />} />
          <Route path="/company" element={<CompanyHomePage />} />
          <Route path="/company/:company_id" element={<CompanyInfoPage />} />
          <Route path="/drug" element={<DrugHomePage />} />
          <Route path="/drug/:drug_id" element={<DrugInfoPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/influence" element={<InfluencePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
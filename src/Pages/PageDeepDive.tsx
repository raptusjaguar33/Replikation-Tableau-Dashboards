import * as React from 'react';
import Layout from '../components/Layout.tsx'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Item from '../components/Item.tsx'
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';

import Papa from 'papaparse';

import Studierendenzahlen5JahreDeepDiveTabelle from '../Module/Tabellen/DeepDiveStudierendenzahlen5Jahre.tsx'
import EntwicklungStudierendenanteilFBTabelle from '../Module/Tabellen/DeepDiveEntwicklungStudierendenanteilFB.tsx'

import DeepDiveStudierendenzahlenEntwicklungChart from '../Module/Charts/DeepDiveStudierendenzahlenEntwicklung.tsx'
import DeepDiveStudienanfaengerChart from '../Module/Charts/DeepDiveStudienanfaenger.tsx'

export default function () {

  const degrees = [
    "(Alle)",
    "Bachelor",
    "Master",
  ]
  const [degree, setDegree] = React.useState(degrees[0]);
  const degreeHandleChange = (event) => {
    setDegree(event.target.value);
  };

  const semesters = [
    "(Alle)",
    "Wintersemester",
    "Sommersemester",
  ]
  const [semester, setSemester] = React.useState(semesters[0]);
  const handleChange = (event) => {
    setSemester(event.target.value);
  };

  const kennzahls = [
    "In Regelstudienzeit",
    "Frauen",
    "International",
  ]
  const [kennzahl, setKennzahl] = React.useState(kennzahls[0]);
  const kennzahlHandleChange = (event) => {
    setKennzahl(event.target.value);
  };

  const fachbereichs = [
    "(Alle)",
    "Gestaltung",
    "Umweltplanung / Umweltrecht",
    "Bauen + Leben",
    "Wirtschaft",
    "Technik",
    "Informatik",
    "Umweltwirtschaft / Umweltrecht",
    "Andere",
  ]
  const [fachbereich, setFachbereich] = React.useState("Wirtschaft");
  const fachbereichHandleChange = (event) => {
    setFachbereich(event.target.value);
  };

  const [markerKPI, setMarkerKPI] = React.useState(10);
  const markerKPIHandleInputChange = (event) => {
    setMarkerKPI(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    Papa.parse('/Datasource/Studierendenstatistik_seit2020.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result: { data: any; }) => {
        let data = result.data;

        setData(data)
      }
    });

  }, [semester, degree, kennzahl, fachbereich, markerKPI]);

  return (
    <Layout children={
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}  >

          <Grid size={{ xs: 12, md: 8 }}>
            <Item>
              <Studierendenzahlen5JahreDeepDiveTabelle data={data} semester={semester} degree={degree} fachbereich={fachbereich} markerKPI={markerKPI} />
            </Item>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Item>
              <DeepDiveStudierendenzahlenEntwicklungChart data={data} semester={semester} degree={degree} kennzahl={kennzahl} fachbereich={fachbereich} />

            </Item>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}><Item>
            <DeepDiveStudienanfaengerChart data={data} semester={semester} degree={degree} kennzahl={kennzahl} fachbereich={fachbereich} />
          </Item></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Item>
            <EntwicklungStudierendenanteilFBTabelle data={data} semester={semester} degree={degree} fachbereich={fachbereich} markerKPI={markerKPI} />
          </Item></Grid>

          <Grid size={{ xs: 12, md: 6 }}><Item>

          </Item></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Item>
            <TextField
              sx={{ p: 1, width: "100%" }}
              id="Winter-Sommer"
              variant="standard"
              select
              label="Kennzahl"
              value={kennzahl}
              onChange={kennzahlHandleChange}


            // helperText="Please select your currency"
            >
              {kennzahls.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Item></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Item>
            <Grid container size={12}>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  sx={{ p: 1, width: "100%" }}
                  id="Winter-Sommer"
                  variant="standard"
                  select
                  label="Bachelor / Master"
                  value={degree}
                  onChange={degreeHandleChange}

                // helperText="Please select your currency"
                >
                  {degrees.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={2} columns={12}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      id="markerKPI"
                      label="KPI marker"
                      variant="standard"
                      sx={{ width: "100%", m: 1, }}
                      inputProps={{
                        type: "number",
                        min: "0",
                        max: "100",
                        readOnly: true,
                      }}
                      value={markerKPI}
                      onChange={markerKPIHandleInputChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ p: 2, }}>
                      <Slider
                        size="small"
                        aria-label="Small"
                        // valueLabelDisplay="auto"
                        color="primary"
                        sx={{
                          // flexGrow: 1,
                          // bgcolor: 'background.paper',
                          // boxShadow: 1,
                          // borderRadius: 2,
                          // margin: 2,
                          // width: "100%",
                        }}
                        value={typeof markerKPI === 'number' ? markerKPI : 0}
                        onChange={markerKPIHandleInputChange}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Item></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Item>
            <Grid container size={12}>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  sx={{ p: 1, width: "100%" }}
                  id="Winter-Sommer"
                  variant="standard"
                  select
                  label="Fachbereich"
                  value={fachbereich}
                  onChange={fachbereichHandleChange}

                // helperText="Please select your currency"
                >
                  {fachbereichs.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  sx={{ p: 1, width: "100%" }}
                  id="Winter-Sommer"
                  variant="standard"
                  select
                  label="Winter / Sommer"
                  value={semester}
                  onChange={handleChange}

                // helperText="Please select your currency"
                >
                  {semesters.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

          </Item></Grid>
        </Grid>
      </Box>
    } />
  );
}
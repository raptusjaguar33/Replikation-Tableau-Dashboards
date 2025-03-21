import * as React from 'react';
import Layout from '../components/Layout.tsx'
import Item from '../components/Item.tsx'
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

import Papa from 'papaparse';


import StudienanfaenerChart from '../Module/Charts/Rueckblick5JahreStudienanfaenger.tsx'
import EntwicklungStudierendenanteileChart from '../Module/Charts/Rueckblick5JahreEntwicklungStudierendenanteile.tsx'
import StudierendenzahlenEntwicklungChart from '../Module/Charts/Rueckblick5JahreStudierendenzahlenEntwicklung.tsx'

import StudierendenzahlenTabelle from '../Module/Tabellen/Studierendenzahlen5Jahre.tsx'


export default function Dashboard() {

  const semesters = [
    "(Alle)",
    "Wintersemester",
    "Sommersemester",
  ]
  const [semester, setSemester] = React.useState(semesters[0]);
  const handleChange = (event) => {
    setSemester(event.target.value);
  };

  const degrees = [
    "(Alle)",
    "Bachelor",
    "Master",
  ]
  const [degree, setDegree] = React.useState(degrees[0]);
  const degreeHandleChange = (event) => {
    setDegree(event.target.value);
  };


  const [markerKPI, setMarkerKPI] = React.useState(30);
  const markerKPIHandleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  }, [semester, degree, markerKPI]);


  return (
    <Layout children={
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>

        <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>

          <Grid size={{ xs: 12, md: 4 }}>
            <Item>
              <StudierendenzahlenEntwicklungChart data={data} semester={semester} degree={degree} />
            </Item>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2} columns={12}>
              <Grid size={12}>
                <Item>
                  <StudierendenzahlenTabelle data={data} semester={semester} degree={degree} markerKPI={markerKPI} />
                </Item>
              </Grid>
              <Grid container size={12}>
                <Grid size={{ xs: 12, md: 8 }}>
                  {/* <Grid size={8}> */}
                  <Item>
                    <StudienanfaenerChart data={data} semester={semester} degree={degree} />
                  </Item>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  {/* <Grid size={4}> */}
                  <Item>
                    <EntwicklungStudierendenanteileChart data={data} semester={semester} degree={degree} />
                  </Item>
                </Grid>
              </Grid>
            </Grid>

          </Grid>

        </Grid>

        <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Item><TextField sx={{ width: "100%" }} id="Winter-Sommer" variant="standard" select label="Winter / Sommer" value={semester} onChange={handleChange}>
                {semesters.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField></Item>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Item><TextField sx={{ width: "100%" }} id="Bachelor-Master" variant="standard" select label="Bachelor / Master" value={degree} onChange={degreeHandleChange}>
                {degrees.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField></Item>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Item>

              <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField id="markerKPI" label="KPI marker" variant="standard" sx={{ width: "100%", m: 1, }} inputProps={{ type: "number", min: "0", max: "100", readOnly: true, }} value={markerKPI} onChange={markerKPIHandleInputChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ p: 2, }}>
                    <Slider size="small" aria-label="Small" color="primary" sx={{}} value={typeof markerKPI === 'number' ? markerKPI : 0} onChange={markerKPIHandleInputChange} />
                  </Box>
                </Grid>
              </Grid>

            </Item>
          </Grid>
        </Grid>

      </Box>

    } />
  );
}
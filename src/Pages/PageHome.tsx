import * as React from 'react';
import Layout from '../components/Layout.tsx';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Item from '../components/Item.tsx';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Papa from 'papaparse';
import ZahlenFaktenStudierendeFachbereichChart from '../Module/Charts/ZahlenFaktenStudierendeFachbereich.tsx';
import ZahlenFaktenTop10Chart from '../Module/Charts/ZahlenFaktenTop10.tsx';
import ZahlenFaktenAngeboteneStudiengaengeTabelle from '../Module/Tabellen/ZahlenFaktenAngeboteneStudiengaenge.tsx';
import ZahlenFaktenStudierendenzahlenTabelle from '../Module/Tabellen/ZahlenFaktenStudierendenzahlen.tsx';

export default function () {
  const semesters = [
    "Wintersemester 2024/2025",
    "Sommersemester 2024",
    "Wintersemester 2023/2024",
    "Sommersemester 2023",
    "Wintersemester 2022/2023",
    "Sommersemester 2022",
    "Wintersemester 2021/2022",
    "Sommersemester 2021",
    "Wintersemester 2020/2021",
    "Sommersemester 2020",
  ];

  const [semester, setSemester] = React.useState(semesters[0]);
  const [previousSemester, setPreviousSemester] = React.useState(semesters[2]);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    Papa.parse('/Datasource/Studierendenstatistik_seit2020.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result: { data: any; }) => {
        let data = result.data;

        setData(data)

        // Finde den Index des aktuellen Semesters
        const currentIndex = semesters.indexOf(semester);

        // Bestimme das vorherige Semester (falls vorhanden)
        const previousSemester = semesters[currentIndex + 2];
        setPreviousSemester(previousSemester)

      }
    });

  }, [semester]);

  return (
    <Layout>
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Item>
              <TextField label="Semester" select value={semester} onChange={(e) => setSemester(e.target.value)} fullWidth>
                {semesters.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item>
              <ZahlenFaktenStudierendenzahlenTabelle data={data} semester={semester} previousSemester={previousSemester} />
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item>
              <ZahlenFaktenAngeboteneStudiengaengeTabelle data={data} semester={semester} previousSemester={previousSemester} />
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item>
              <ZahlenFaktenStudierendeFachbereichChart data={data} semester={semester} previousSemester={previousSemester} />
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item>
              <ZahlenFaktenTop10Chart data={data} semester={semester} previousSemester={previousSemester} />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

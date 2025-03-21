import React from "react";
import { Typography, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import * as aq from 'arquero';


function getSum(data: string | any[], key: string | number) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i][key]
  }
  return sum
}

function getAGG(data: string | any[], key: string | number, KeySum: string | number) {

  let sumS = getSum(data, KeySum)
  let sum = getSum(data, key)

  return sum / sumS
}

function getStudierendenZahlen(data: object | any[] | Map<any, any>, semester: string, previousSemester: string) {

  const studies = aq
    .from(data)
    .filter(aq.escape((d: { Semester: any; }) => d.Semester === semester))
    .objects();
  // (studies);

  let aktuell = {
    "Gesamtstudierende": getSum(studies, "Gesamtstudierende"),
    "International": getAGG(studies, "Ausländische Studierende", "Gesamtstudierende"),
    "Frauen": getAGG(studies, "Weibliche Studierende", "Gesamtstudierende"),
    "1. FS": getSum(studies, "Studienanfängerinnen und Studienanfänger (1. FS)"),
    "1. HS": getSum(studies, "Studienanfängerinnen und Studienanfänger (1. HS)"),
    "Regelstudienzeit": getAGG(studies, "Studierende in der Regelstudienzeit", "Gesamtstudierende"),
  }


  const previousStudies = aq
    .from(data)
    .filter(aq.escape((d: { Semester: any; }) => d.Semester === previousSemester))
    .objects();


  let previous = {
    "Gesamtstudierende": getSum(previousStudies, "Gesamtstudierende"),
    "International": getAGG(previousStudies, "Ausländische Studierende", "Gesamtstudierende"),
    "Frauen": getAGG(previousStudies, "Weibliche Studierende", "Gesamtstudierende"),
    "1. FS": getSum(previousStudies, "Studienanfängerinnen und Studienanfänger (1. FS)"),
    "1. HS": getSum(previousStudies, "Studienanfängerinnen und Studienanfänger (1. HS)"),
    "Regelstudienzeit": getAGG(previousStudies, "Studierende in der Regelstudienzeit", "Gesamtstudierende"),
  }

  return { aktuell, previous }
}


// Beispiel-Daten (könnten aus einer API oder Props kommen)
const exampleData = {
  aktuell: {
    Gesamtstudierende: 6444,
    International: 0.2644320297951583,
    Frauen: 0.3952513966480447,
    "1. FS": 1387,
    "1. HS": 949,
    Regelstudienzeit: 0.6890130353817505,
  },
  previous: {
    Gesamtstudierende: 6642,
    International: 0.2490213791026799,
    Frauen: 0.3843721770551039,
    "1. FS": 1496,
    "1. HS": 1055,
    Regelstudienzeit: 0.6752484191508582,
  },
};

const StyledTable = ({ data, semester, previousSemester }) => {
  const [table, setTable] = React.useState({});

  // Labels aus den Keys extrahieren
  let labels = Object.keys(exampleData.aktuell);

  React.useEffect(() => {
    var obj = getStudierendenZahlen(data, semester, previousSemester)

    labels = Object.keys(obj.aktuell);
    setTable(obj);

  }, [data, semester, previousSemester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

  return (

    <TableContainer component={Paper} sx={{ boxShadow: "none", /* maxWidth: 600,  */margin: "auto", mt: 2 }}>
      <Typography variant="h6" align="center" sx={{ mt: 2, mb: 1 }}>
        Studierendenzahlen
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="right" sx={{ /* fontWeight: "bold", */ width: "25%" }}></TableCell>
            <TableCell align="right" sx={{ /* fontWeight: "bold", */ width: "25%", color: "#666" }}>YoY</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {labels.map((label, index) => {
            const aktuell = table.aktuell ? table.aktuell[label] : NaN;
            const previous = table.previous ? table.previous[label] : NaN;

            // Falls der Wert eine Dezimalzahl ist, formatieren wir ihn als Prozent
            const formatValue = (val: number) => (val < 1 && val > 0 ? `${(val * 100).toFixed(2)}%` : val.toLocaleString());

            return (
              <TableRow key={label} sx={{ bgcolor: index % 2 === 0 ? "white" : "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", py: 1.2 }}>{label}</TableCell>
                <TableCell align="right" sx={{ py: 1.2, width: "25%" }}>{
                formatValue(aktuell)}
                </TableCell>
                <TableCell align="right" sx={{ color: "#999", fontSize: "0.9em", py: 1.2, width: "25%" }}>
                  {formatValue(previous)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Test-Rendering
// const App: React.FC = () => <StyledTable data={exampleData} />;

// export default App;
export default StyledTable;

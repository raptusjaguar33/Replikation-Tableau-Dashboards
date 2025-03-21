import React from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper, Typography } from "@mui/material";
import * as aq from 'arquero';

interface StudyProgram {
    campus: string;
    faculty: string;
    bachelor: number;
    master: number;
}

const StyledTable = ({ data, semester, previousSemester }) => {
    // const StudyProgramsTable: React.FC<Props> = ({ data }) => {

    // data = exampleData;
    const [table, setTable] = React.useState([]);

    React.useEffect(() => {


        if (data.length > 0) {
            const fachbereichGrouped = aq
                .from(data)
                .rename({ "Bachelor / Master": 'degree' })
                .filter(aq.escape((d: { Semester: string; }) => d.Semester === semester))
                // .filter(aq.escape((d: { degree: string; }) => d.degree === "Bachelor"))
                .groupby("Campus", "Fachbereich"/*,  "Bachelor / Master", "Studiengang" */)
                // .count()
                // // .rollup({ Studierende: aq.op.sum("Gesamtstudierende") })
                // // .orderby(aq.desc("Studierende"))
                .rollup({
                    bachelor: function () {
                        return null
                    },
                    master: (d: any) => {
                        return null
                    },
                })
                // .orderby(aq.desc("Campus"))
                .orderby("Campus", aq.desc("Fachbereich"))
                .objects();

            for (let i = 0; i < fachbereichGrouped.length; i++) {
                const element = fachbereichGrouped[i];

                element["master"] = aq.from(data)
                    .rename({ "Bachelor / Master": 'degree' })
                    .filter(aq.escape((d: { Semester: string; }) => d.Semester === semester))
                    .filter(aq.escape((d: { degree: string; }) => d.degree === "Master"))
                    .filter(aq.escape((d: { Campus: string; }) => d.Campus === element.Campus))
                    .filter(aq.escape((d: { Fachbereich: string; }) => d.Fachbereich === element.Fachbereich))
                    .groupby("Campus", "Fachbereich", "Studiengang")
                    .objects().length

                element["bachelor"] = aq.from(data)
                    .rename({ "Bachelor / Master": 'degree' })
                    .filter(aq.escape((d: { Semester: string; }) => d.Semester === semester))
                    .filter(aq.escape((d: { degree: string; }) => d.degree === "Bachelor"))
                    .filter(aq.escape((d: { Campus: string; }) => d.Campus === element.Campus))
                    .filter(aq.escape((d: { Fachbereich: string; }) => d.Fachbereich === element.Fachbereich))
                    .groupby("Campus", "Fachbereich", "Studiengang")
                    .objects().length;
            }

            setTable(fachbereichGrouped);

        } else {
            setTable([]);
        }



        // setTable(fachbereichGrouped);

    }, [data, semester, previousSemester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    // Gruppierung nach Campus
    const campusGroups = table.reduce((acc, item) => {
        acc[item.Campus] = acc[item.Campus] || [];
        acc[item.Campus].push(item);
        return acc;
    }, {} as Record<string, StudyProgram[]>);

    // Gesamtwerte berechnen
    const totalBachelor = table.reduce((sum, item) => sum + item.bachelor, 0);
    const totalMaster = table.reduce((sum, item) => sum + item.master, 0);
    const totalSum = totalBachelor + totalMaster;

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" align="center" sx={{ mt: 2, mb: 1 }}>
                Angebotene Studiengänge
            </Typography>

            <TableContainer sx={{ maxHeight: 440, maxWidth: "100%", boxShadow: "none" }}>
                <Table size="small" stickyHeader >
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Campus</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Fachbereich</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Bachelor</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Master</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Gesamtsumme</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(campusGroups).map(([campus, programs], campusIndex) => (
                            <>
                                {programs.map((program, index) => (
                                    <TableRow key={program.Fachbereich} sx={{ bgcolor: index % 2 === 0 ? "white" : "#f5f5f5" }}>
                                        {index === 0 ? (
                                            <TableCell rowSpan={programs.length} sx={{ fontWeight: "bold", verticalAlign: "top" }}>
                                                {campus}
                                            </TableCell>
                                        ) : null}
                                        <TableCell>{program.Fachbereich}</TableCell>
                                        <TableCell align="right">{program.bachelor}</TableCell>
                                        <TableCell align="right">{program.master}</TableCell>
                                        <TableCell align="right">{program.bachelor + program.master}</TableCell>
                                    </TableRow>
                                ))}
                            </>
                        ))}

                        <TableRow sx={{ bgcolor: "#eee", fontWeight: "bold" }}>
                            <TableCell colSpan={2}>Gesamtsumme</TableCell>
                            <TableCell align="right">{totalBachelor}</TableCell>
                            <TableCell align="right">{totalMaster}</TableCell>
                            <TableCell align="right">{totalSum}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

    );
};


// const App: React.FC = () => <StudyProgramsTable data={exampleData} />;

// export default App;
export default StyledTable;

import React from "react";
import { styled, Table, TableHead, TableBody, TableContainer, TableRow, TableCell, Paper, Typography } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import * as aq from 'arquero';
import { timeFormat, timeParse } from "d3-time-format";

const StyledTableCell = styled(TableCell)(() => ({ fontSize: 14 }));
const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': { backgroundColor: "#f5f5f5" },
    '&:nth-of-type(even)': { backgroundColor: "white" },
}));

const fmtYear = timeFormat("%Y"); // Format für Jahr
const parseDate = timeParse("%d.%m.%Y");

interface StudyProgram {
    Campus: string;
    Fachbereich: string;
    bachelor: number;
    master: number;
}

interface Props {
    data: any;
    semester: String | string;
    degree: String | string;
    markerKPI: String | string;
}

interface Column {
    id: 'campus' | 'fachbereich' | 'degree' | 'studiengang' | '2020' | '2021' | '2022' | '2023' | '2024';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'campus', label: 'Campus', minWidth: 100 },
    { id: 'fachbereich', label: 'Fachbereich', minWidth: 100 },
    { id: 'degree', label: 'Bachelor / Master', minWidth: 100 },
    { id: 'studiengang', label: 'Studiengang (Gruppe)', minWidth: 100 },
    { id: '2020', label: '2020', minWidth: 50, align: 'right', format: (value: number) => value.toFixed(0), },
    { id: '2021', label: '2021', minWidth: 50, align: 'right', format: (value: number) => value.toFixed(0), },
    { id: '2022', label: '2022', minWidth: 50, align: 'right', format: (value: number) => value.toFixed(0), },
    { id: '2023', label: '2023', minWidth: 50, align: 'right', format: (value: number) => value.toFixed(0), },
    { id: '2024', label: '2024', minWidth: 50, align: 'right', format: (value: number) => value.toFixed(0), },
];

function createData(campus: string, fachbereich: string, degree: string, studiengang: string, _2020: number, _2021: number, _2022: number, _2023: number, _2024: number,) {
    return { campus: campus, fachbereich: fachbereich, degree: degree, studiengang: studiengang, 2020: _2020, 2021: _2021, 2022: _2022, 2023: _2023, 2024: _2024 };
}

const StyledTable = ({ data, semester, degree, markerKPI }: Props) => {

    const [table, setTable] = React.useState([]);

    React.useEffect(() => {

        if (data.length > 0) {

            const studies = aq.from(data)
                .derive({
                    // year: aq.escape((d) => fmtYear(new Date(d.Stand))),
                    year: aq.escape((d) => {
                        const parsedDate = parseDate(d.Stand);
                        return parsedDate ? parsedDate.getFullYear() : null;
                    }),
                    "2020": aq.escape((d) => {
                        return d.year == "2020" ? d.Gesamtstudierende : null;
                    }),
                    "2021": aq.escape((d) => {
                        return d.year == "2021" ? d.Gesamtstudierende : null;
                    }),
                    "2022": aq.escape((d) => {
                        return d.year == "2022" ? d.Gesamtstudierende : null;
                    }),
                    "2023": aq.escape((d) => {
                        return d.year == "2023" ? d.Gesamtstudierende : null;
                    }),
                    "2024": aq.escape((d) => {
                        return d.year == "2024" ? d.Gesamtstudierende : null;
                    }),
                    // year: (d) => fmtYear(new Date(d.Stand))
                })

                .filter(aq.escape((d: { "Winter / Sommer": any; }) => semester !== "(Alle)" ? d["Winter / Sommer"] === semester : true))
                .filter(aq.escape((d: { "Bachelor / Master": any; }) => degree !== "(Alle)" ? d["Bachelor / Master"] === degree : true))
                // .filter(aq.escape((d: { "Studiengang (Gruppe)": any; }) => d["Studiengang (Gruppe)"] === "Architektur"))
                // .filter(aq.escape((d: { "year": any; }) => d["year"] === "2020"))
                .groupby("Campus", "Fachbereich", "Bachelor / Master", "Studiengang (Gruppe)")
                .rollup({
                    Gesamtstudierende: aq.op.sum("Gesamtstudierende"),
                    "2020": aq.op.sum("2020"),
                    "2021": aq.op.sum("2021"),
                    "2022": aq.op.sum("2022"),
                    "2023": aq.op.sum("2023"),
                    "2024": aq.op.sum("2024"),
                })
                .orderby("Campus", "Fachbereich", "Bachelor / Master", "Studiengang (Gruppe)")
                .objects();


            var test = [];
            studies.forEach(element => {
                test.push(createData(
                    element["Campus"],
                    element["Fachbereich"],
                    element["Bachelor / Master"],
                    element["Studiengang (Gruppe)"],
                    element["2020"],
                    element["2021"],
                    element["2022"],
                    element["2023"],
                    element["2024"],
                ))
            });

            setTable(test);
        }
        // 

    }, [data, semester, degree, markerKPI]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    // Gesamtwerte berechnen
    const years = ["2020", "2021", "2022", "2023", "2024"];
    const sum = years.reduce((acc, year) => {
        acc[year] = table.reduce((sum, item) => typeof item[year] === "number" ? sum + item[year] : sum, 0);
        return acc;
    }, {});

    function getFirstLabel(table: any[], index: number, key: string) {
        return index === 0 || table[index - 1][key] !== table[index][key] ? table[index][key] : "";
    }

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return null;
        let percentageChange = (current / previous) * 100;
        if (Math.abs(percentageChange - 100) > markerKPI) {
            return current > previous ?
                <ArrowDropUpIcon style={{ color: "green" }} /> :
                <ArrowDropDownIcon style={{ color: "red" }} />;
        }
        return null;
    };

    return (
        <>
            <Typography variant="h6" align="center" sx={{ mt: 2, mb: 1 }}>
                Studierendenzahlen der letzten 5 Jahre im Vergleich
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 350, boxShadow: "none", overflow: "auto", margin: "auto" }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <StyledTableCell key={column.id} style={{ minWidth: column.minWidth }}>
                                    {column.label}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {table.map((row, index) => (
                            <StyledTableRow key={index}>
                                <StyledTableCell>{getFirstLabel(table, index, "campus")}</StyledTableCell>
                                <StyledTableCell>{getFirstLabel(table, index, "fachbereich")}</StyledTableCell>
                                <StyledTableCell>{getFirstLabel(table, index, "degree")}</StyledTableCell>
                                <StyledTableCell>{getFirstLabel(table, index, "studiengang")}</StyledTableCell>
                                {[2020, 2021, 2022, 2023, 2024].map((year, i) => (
                                    <StyledTableCell key={year}>
                                        {row[year]} {i > 0 && calculateTrend(row[year], row[year - 1])}
                                    </StyledTableCell>
                                ))}
                            </StyledTableRow>
                        ))}
                        <StyledTableRow key={table.length}>
                            <StyledTableCell>Gesamtsumme:</StyledTableCell>
                            <StyledTableCell></StyledTableCell>
                            <StyledTableCell></StyledTableCell>
                            <StyledTableCell></StyledTableCell>
                            {[2020, 2021, 2022, 2023, 2024].map((year, i) => (
                                <StyledTableCell key={year}>
                                    {sum[year]}
                                </StyledTableCell>
                            ))}
                        </StyledTableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>

    );
};

export default StyledTable;

import React from "react";
import { Table, TableHead, TableBody, TableContainer, TableRow, TableCell, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as aq from 'arquero';
import { timeFormat, timeParse } from "d3-time-format";

const parseDate = timeParse("%d.%m.%Y");

const StyledTableCell = styled(TableCell)(({ theme, value, min, max }) => {
    const getColor = (val) => {
        const percentage = (val - min) / (max - min);
        const grayValue = 255 - percentage * (255 - 230);
        return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    };
    return {
        fontSize: 14,
        textAlign: "center",
        backgroundColor: getColor(value),
    };
});

interface Props {
    data: any;
    semester: String | string;
    fachbereich: String | string;
    degree: String | string;
    markerKPI: Number | number;
}

const data1 = [
    { category: "Dual", values: [6.51, 6.98, 7.55, 7.86, 7.97] },
    { category: "Frauen", values: [37.66, 38.61, 39.09, 38.60, 39.12] },
    { category: "In Regelstudienzeit", values: [70.77, 69.52, 68.03, 67.53, 69.18] },
    { category: "International", values: [16.16, 18.04, 20.31, 23.58, 26.46] },
];

const years = [2020, 2021, 2022, 2023, 2024];

const StudentTable = ({ data, semester, degree, markerKPI, fachbereich }: Props) => {

    const [table, setTable] = React.useState([]);

    React.useEffect(() => {

        if (data.length > 0) {

            console.log(data);

            const studies = aq.from(data)
                .derive({
                    year: aq.escape((d) => {
                        const parsedDate = parseDate(d.Stand);
                        return parsedDate ? parsedDate.getFullYear() : null;
                    }),
                    "DualZ": aq.escape((d) => {

                        // console.log(d);
                        return d.Dual == "dual" ? d.Gesamtstudierende : 0;
                    }),
                })

                .filter(aq.escape((d: { "Winter / Sommer": any; }) => semester !== "(Alle)" ? d["Winter / Sommer"] === semester : true))
                .filter(aq.escape((d: { "Bachelor / Master": any; }) => degree !== "(Alle)" ? d["Bachelor / Master"] === degree : true))
                // .filter(aq.escape((d: { "Fachbereich": any; }) => fachbereich !== "(Alle)" ? d["Fachbereich"] === fachbereich : true))
                .groupby("year")
                .rollup({
                    Gesamtstudierende: aq.op.sum("Gesamtstudierende"),
                    "Dual": aq.op.sum("DualZ"),
                    "International": aq.op.sum("Ausländische Studierende"),
                    "Frauen": aq.op.sum("Weibliche Studierende"),
                    "Regelstudienzeit": aq.op.sum("Studierende in der Regelstudienzeit"),
                })
                .orderby("year")
                .objects();

            for (let i = 0; i < studies.length; i++) {
                const element = studies[i];

                element["Dual"] = element["Dual"] / element["Gesamtstudierende"] * 100;
                element["International"] = element["International"] / element["Gesamtstudierende"] * 100;
                element["Frauen"] = element["Frauen"] / element["Gesamtstudierende"] * 100;
                element["Regelstudienzeit"] = element["Regelstudienzeit"] / element["Gesamtstudierende"] * 100;

            }

            console.log(studies);

            setTable([
                { category: "Dual", values: studies.map((d) => d["Dual"]) },
                { category: "Frauen", values: studies.map((d) => d["Frauen"]) },
                { category: "Regelstudienzeit", values: studies.map((d) => d["Regelstudienzeit"]) },
                { category: "International", values: studies.map((d) => d["International"]) },
            ]);
            // var test = [];
            // studies.forEach(element => {
            //     test.push(createData(
            //         element["Bachelor / Master"],
            //         element["Studiengang (Gruppe)"],
            //         element["Dual"],
            //         element["2020"],
            //         element["2021"],
            //         element["2022"],
            //         element["2023"],
            //         element["2024"],
            //     ))
            // });

            // setTable(test);

            // console.log(test);

            // Gesamtwerte berechnen

            // sum["2020"] = test.reduce((sum, item) => sum + (item["2020"] || 0), 0);
            // sum["2021"] = test.reduce((sum, item) => sum + (item["2021"] || 0), 0);
            // sum["2022"] = test.reduce((sum, item) => sum + (item["2022"] || 0), 0);
            // sum["2023"] = test.reduce((sum, item) => sum + (item["2023"] || 0), 0);
            // sum["2024"] = test.reduce((sum, item) => sum + (item["2024"] || 0), 0);

            // console.log(sum);
        }

    }, [data, semester, degree, markerKPI]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    return (

        <>
            <Typography variant="h6" align="center" sx={{ mt: 2, mb: 1 }}>
                Entwicklung Studierendenanteile FB
            </Typography>

            <TableContainer component={Paper} sx={{ /* maxWidth: 600, */ margin: "auto", mt: 2 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell></StyledTableCell>
                            {years.map((year) => (
                                <StyledTableCell key={year}>{year}</StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {table.map((row, index) => {
                            const min = Math.min(...row.values);
                            const max = Math.max(...row.values);
                            return (
                                <TableRow key={index}>
                                    <StyledTableCell>{row.category}</StyledTableCell>
                                    {row.values.map((value, i) => (
                                        <StyledTableCell key={i} value={value} min={min} max={max}>
                                            {value.toFixed(2)}%
                                        </StyledTableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>

    );
};

export default StudentTable;

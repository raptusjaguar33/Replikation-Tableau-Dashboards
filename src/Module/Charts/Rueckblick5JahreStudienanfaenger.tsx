import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import * as aq from 'arquero';

// Chart.js registrieren
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, degree, semester }) => {

    const [chartData, setChartData] = React.useState<any>(null);
    const chartRef = React.useRef();

    React.useEffect(() => {

        if (data.length > 0) {
            let data1: object = [];
            for (let i = 0; i < data.length; i++) {
                const element = data[i];

                let year = undefined;
                if (element.Stand) {
                    year = element.Stand.split(".")[2];
                    element.year = year
                }
                element.year = year
                data1.push(element)
            }

            const studies = aq.from(data)
                .filter(aq.escape((d: { "Winter / Sommer": any; }) => semester !== "(Alle)" ? d["Winter / Sommer"] === semester : true))
                .filter(aq.escape((d: { "Bachelor / Master": any; }) => degree !== "(Alle)" ? d["Bachelor / Master"] === degree : true))
                .select("year", "Winter / Sommer", "Gesamtstudierende", "Studienanfängerinnen und Studienanfänger (1. FS)", "Studienanfängerinnen und Studienanfänger (1. HS)")
                .groupby("year")
                .rollup({
                    FSWS: aq.op.array_agg("Winter / Sommer"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    FSWinterSommer: aq.op.array_agg("Studienanfängerinnen und Studienanfänger (1. FS)"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    HSWinterSommer: aq.op.array_agg("Studienanfängerinnen und Studienanfänger (1. HS)"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    FS: aq.op.sum("Studienanfängerinnen und Studienanfänger (1. FS)"),
                    HS: aq.op.sum("Studienanfängerinnen und Studienanfänger (1. HS)"),
                })
                .orderby("year")
                .objects();



            function WinterSommer(arr: string[], arr2: number[], key: string): number {
                let sum = 0;
                for (let index = 0; index < arr.length; index++) {
                    if (arr[index].trim().toLowerCase() === key.toLowerCase()) {
                        sum += arr2[index];
                    }
                }
                return sum;
            }


            for (let index = 0; index < studies.length; index++) {
                const element = studies[index];
                element["FSSommersemester"] = WinterSommer(element["FSWS"], element["FSWinterSommer"], "Sommersemester");
                element["FSWintersemester"] = WinterSommer(element["FSWS"], element["FSWinterSommer"], "Wintersemester");
                element["HSSommersemester"] = WinterSommer(element["FSWS"], element["HSWinterSommer"], "Sommersemester");
                element["HSWintersemester"] = WinterSommer(element["FSWS"], element["HSWinterSommer"], "Wintersemester");
                // element["Regelstudienzeit"] = element["Regelstudienzeit"] / element.Gesamtstudierende;
                // element["AusländischeStudierende"] = element["AusländischeStudierende"] / element.Gesamtstudierende;
                // element["WeiblicheStudierende"] = element["WeiblicheStudierende"] / element.Gesamtstudierende;
                delete element["FSWS"]
                delete element["FSWinterSommer"]
                delete element["HSWinterSommer"]

            }


            // Labels der X-Achse
            // const labels = ['2020', '2021', '2022', '2023', '2024'];
            const labels = [...new Set(studies.map((d) => d["year"]))];
            const datasets: any[] = [
                {
                    label: "1. Hochschulsemester - Sommersemester",
                    // data: [1073, 1000, 876, 1055, 949],
                    data: studies.map((item: { HSSommersemester: any; }) => item.HSSommersemester),
                    fill: false,
                    backgroundColor: "#E6E6E6",
                    // borderColor: "#115E67",
                    borderWidth: 1,
                    stack: 'Stack 0',
                },
                {
                    label: "1. Hochschulsemester - Wintersemester",
                    // data: [221, 285, 264, 311, 260],
                    data: studies.map((item: { HSWintersemester: any; }) => item.HSWintersemester),
                    fill: false,
                    backgroundColor: "#C1C1C1",
                    // borderColor: "#115E67",
                    borderWidth: 1,
                    stack: 'Stack 0',
                },
                {
                    label: "1. Fachsemester - Sommersemester",
                    data: studies.map((item: { FSSommersemester: any; }) => item.FSSommersemester),
                    // data: [1623, 1511, 1311, 1496, 1387],
                    fill: false,
                    backgroundColor: "#E6E6E6",
                    // borderColor: "#115E67",
                    borderWidth: 1,
                    stack: 'Stack 1',
                    yAxisID: 'y2',
                },
                {
                    label: "1. Fachsemester - Wintersemester",
                    // data: [580, 612, 528, 560, 520],
                    data: studies.map((item: { FSWintersemester: any; }) => item.FSWintersemester),
                    fill: false,
                    backgroundColor: "#C1C1C1",
                    // borderColor: "#115E67",
                    borderWidth: 1,
                    stack: 'Stack 1',
                    yAxisID: 'y2',
                },
            ];

            setChartData({ labels, datasets });

        }



    }, [data, degree, semester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        indexAxis: 'y',
        scales: {
            x: {
                stacked: true,
                ticks: {
                    display: false,
                },
                border: {
                    display: false
                },

            },
            y: {
                stacked: true,
                stack: 'demo',
                stackWeight: 1,
                title: {
                    display: true,
                    text: '1. Hochschulsemester'
                },
                grid: {
                    display: false,
                },
            },

            y2: {
                stacked: true,
                // type: 'category',
                // labels: ['ON', 'OFF'],
                offset: true,
                position: 'left',
                stack: 'demo',
                stackWeight: 1,
                title: {
                    display: true,
                    text: '1. Fachsemester'
                },
                grid: {
                    display: false,
                },

            }

        },

        plugins: {
            legend: {
                display: false,
                position: "top",
            },
            title: {
                display: true,
                text: "Studienanfänger (Sommer- & Wintersemester)",
            },
        },

    };

    return (
        <div style={{ height: "300px", width: "100%" }}> {/* Höhe fixiert auf 300px */}
            {
                chartData
                    ? <Bar ref={chartRef} data={chartData} options={options} />
                    : <p>Lade Daten...</p>
            }
        </div>
    );
};

export default BarChart;
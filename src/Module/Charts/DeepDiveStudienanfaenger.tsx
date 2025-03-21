import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from "chart.js";
import * as aq from 'arquero';
import { rename } from "fs";
import { log } from "console";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
export const options = {
    responsive: true, // Chart passt sich automatisch an den Container an
    maintainAspectRatio: false, // Ermöglicht flexible Höhenanpassung
    interaction: {
        mode: 'nearest',
        intersect: false,
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
    scales: {
        y: {
            beginAtZero: true,
            ticks: { display: false, },
            grid: { drawTicks: false, },
        },
        x: {
            grid: { display: false, },

        },
    },
};

export default function Chart({ data, semester, degree, kennzahl, fachbereich }) {

    const [chartData, setChartData] = React.useState<any>(null);
    const chartRef = React.useRef();

    React.useEffect(() => {

        if (data.length > 0) {
            // console.log(data);
            // let data1 = [];
            // for (let i = 0; i < data.length; i++) {
            //     const element = data[i];

            //     let year = undefined;
            //     if (element.Stand) {
            //         year = element.Stand.split(".")[2];
            //         element.year = year
            //     }
            //     element.year = year
            //     data1.push(element)
            // }

            const studies = aq.from(data)
                .filter(aq.escape((d: { "Winter / Sommer": any; }) => semester !== "(Alle)" ? d["Winter / Sommer"] === semester : true))
                .filter(aq.escape((d: { "Bachelor / Master": any; }) => degree !== "(Alle)" ? d["Bachelor / Master"] === degree : true))
                .filter(aq.escape((d: { "Fachbereich": any; }) => fachbereich !== "(Alle)" ? d["Fachbereich"] === fachbereich : true))
                .rename({ "Studienanfängerinnen und Studienanfänger (1. HS)": 'HS' })
                .rename({ "Studienanfängerinnen und Studienanfänger (1. FS)": 'FS' })
                .select("year", "HS", "FS", "Gesamtstudierende")
                .groupby("year")
                .rollup({
                    HS: aq.op.sum("HS"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    FS: aq.op.sum("FS"), // Zeigt alle Werte von "Dual" für jedes Jahr
                })
                .orderby("year")
                .objects();


            // Labels der X-Achse
            const labels = [...new Set(studies.map((d) => d["year"]))];
            const datasets: any[] = [
                {
                    label: "1. Fachsemester",
                    // data: [280, 300, 350, 364, 364],
                    data: studies.map((item) => item.FS),
                    borderColor: "rgba(0, 128, 128, 1)",
                    backgroundColor: "rgba(0, 128, 128, 0.5)",
                    borderWidth: 2,
                    pointStyle: "circle",
                },
                {
                    label: "1. Hochschulsemester",
                    // data: [200, 210, 250, 273, 273],
                    data: studies.map((item) => item.HS),
                    borderColor: "rgba(0, 128, 128, 0.6)",
                    backgroundColor: "rgba(0, 128, 128, 0.3)",
                    borderWidth: 2,
                    borderDash: [5, 5],
                },
            ];

            setChartData({ labels, datasets })
        }

    }, [data, semester, degree, kennzahl, fachbereich]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    return (
        <div style={{ width: "100%", height: "100%" }}>
            {
                chartData
                    ? <Line ref={chartRef} data={chartData} options={options} />
                    : <p>Lade Daten...</p>
            }

        </div>
    );
}

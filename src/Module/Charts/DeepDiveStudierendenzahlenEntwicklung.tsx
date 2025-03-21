import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as aq from 'arquero';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'nearest' as const,
        intersect: false,
    },
    stacked: false,
    plugins: {
        title: {
            display: true,
            text: 'Entwicklung Studierendenzahlen',
        },
        legend: {
            display: false,
        },
    },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { display: false, },
            grid: { drawTicks: false, },
            border: { display: false, },

        },
        x: {
            grid: {
                display: false
            },
        },
    },
};

const BarChart = ({ data, semester, degree, kennzahl, fachbereich }) => {
    const [chartData, setChartData] = React.useState<any>(null);
    const chartRef = React.useRef();


    React.useEffect(() => {

        if (data.length > 0) {
            // console.log(data);
            let data1 = [];
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
                .filter(aq.escape((d: { "Fachbereich": any; }) => fachbereich !== "(Alle)" ? d["Fachbereich"] === fachbereich : true))

                .select("year", "Studiengang", "Gesamtstudierende", "Fachbereich")
                .groupby("year")
                .rollup({
                    Studiengang: aq.op.array_agg("Studiengang"),
                    Gesamtstudierende: aq.op.array_agg("Gesamtstudierende"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    Gesamt: aq.op.sum("Gesamtstudierende"), // Zeigt alle Werte von "Dual" für jedes Jahr
                })
                .orderby("year")
                .objects();

            function sum(arr: string[], arr2: number[], key: string): number {
                let sum = 0;
                for (let index = 0; index < arr.length; index++) {
                    if (arr[index].trim().toLowerCase() === key.toLowerCase()) {
                        sum += arr2[index];
                    }
                }
                return sum;
            }

            var studiengang = {};

            for (let index = 0; index < studies.length; index++) {
                const element = studies[index];

                for (let d = 0; d < element["Studiengang"].length; d++) {
                    const gang = element["Studiengang"][d];
                    studiengang[gang] = true;

                    if (element[gang] === undefined) {
                        element[gang] = null;
                    }

                    element[gang] += Number(element["Gesamtstudierende"][d]);
                }

            }

            // Labels der X-Achse
            // const labels = ['2020', '2021', '2022', '2023', '2024'];
            const labels = [...new Set(studies.map((d) => d["year"]))];
            const datasets: any[] = [];

            for (const gang in studiengang) {
                if (Object.prototype.hasOwnProperty.call(studiengang, gang)) {
                    const element = studiengang[gang];
                    datasets.push({
                        label: gang,
                        // data: [561, 341, 891, 613],
                        data: studies.map((item) => item[gang]),
                        borderColor: '#B6CFD0',
                        backgroundColor: '#B6CFD0',
                        yAxisID: 'y',
                        pointRadius: 0, // Keine Punkte auf der Durchschnittslinie

                    });
                }
            }

            setChartData({ labels, datasets })
        }

    }, [data, semester, degree, kennzahl, fachbereich]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    return (
        <div style={{ height: "100%", width: "100%" }}> {/* Höhe fixiert auf 300px */}
            {
                chartData
                    ? <Line ref={chartRef} data={chartData} options={options} />
                    : <p>Lade Daten...</p>

            }
        </div>
    );
};

export default BarChart;

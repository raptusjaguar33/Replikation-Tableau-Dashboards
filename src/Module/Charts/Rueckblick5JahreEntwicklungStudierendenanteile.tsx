import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRef } from 'react';
import * as aq from 'arquero';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


// Das Plugin für die Hinzufügung von Beschriftungen hinter den letzten Punkten
const labelBehindLastPointPlugin = {
    id: 'labelBehindLastPoint',
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const datasets = chart.data.datasets;

        // Durch alle Datensätze iterieren
        datasets.forEach((dataset) => {


            if (dataset.data.length > 0) {
                // Der letzte Punkt jedes Datasets
                const lastIndex = dataset.data.length - 1;
                const lastData = dataset.data[lastIndex];
                const lastLabel = chart.data.labels[lastIndex];

                // Berechnet die Position des letzten Punktes auf der Canvas
                const x = chart.scales.x.getPixelForValue(lastLabel);
                const y = chart.scales.y.getPixelForValue(lastData);



                // Text, der hinter dem letzten Punkt gezeichnet wird
                const labelText = `Ø`;

                // Textfarbe und -stil
                ctx.save();
                ctx.fillStyle = 'black';  // Textfarbe
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                // Text hinter dem letzten Punkt zeichnen
                ctx.fillText(labelText, x, y);  // Verschiebe den Text nach rechts
                ctx.restore();
            }
        });
    },
};

// ChartJS.register(
//     labelBehindLastPointPlugin,
// );

export const options = {
    maintainAspectRatio: false,
    responsive: true,
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
            display: true,
            align: 'start',
            position: "bottom",
        },
    },
    scales: {
        y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                display: false,
                text: 'Gesamtstudierende'
            },

        },
        x: {
            grid: {
                display: false
            },
        },
    },
};


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

                .select("year", "Studierende in der Regelstudienzeit", "Weibliche Studierende", "Dual", "Ausländische Studierende", "Gesamtstudierende")
                .rename({ "Studierende in der Regelstudienzeit": "Regelstudienzeit" })
                .groupby("year")
                .rollup({
                    Gesamtstudierende: aq.op.sum("Gesamtstudierende"),
                    Regelstudienzeit: aq.op.sum("Regelstudienzeit"),
                    WeiblicheStudierende: aq.op.sum("Weibliche Studierende"),
                    Dual: aq.op.array_agg("Dual"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    Dual2: aq.op.array_agg("Gesamtstudierende"), // Zeigt alle Werte von "Dual" für jedes Jahr
                    AusländischeStudierende: aq.op.sum("Ausländische Studierende")
                })
                .orderby("year")
                .objects();

            function countDual(arr: string[], arr2: number[]): number {
                let sum = 0;
                for (let index = 0; index < arr.length; index++) {
                    if (arr[index].trim().toLowerCase() === "dual") {
                        sum += arr2[index];
                    }
                }
                return sum;
            }


            for (let index = 0; index < studies.length; index++) {
                const element = studies[index];
                element["Dual"] = countDual(element["Dual"], element["Dual2"]) / element.Gesamtstudierende;
                element["Regelstudienzeit"] = element["Regelstudienzeit"] / element.Gesamtstudierende;
                element["AusländischeStudierende"] = element["AusländischeStudierende"] / element.Gesamtstudierende;
                element["WeiblicheStudierende"] = element["WeiblicheStudierende"] / element.Gesamtstudierende;
                delete element["Dual2"]
            }


            // Labels der X-Achse
            // const labels = ['2020', '2021', '2022', '2023', '2024'];
            const labels = [...new Set(studies.map((d) => d["year"]))];
            const datasets: any[] = [
                {
                    label: 'In Regelstudienzeit',
                    data: studies.map((item: { Regelstudienzeit: any; }) => item.Regelstudienzeit),
                    borderColor: '#0E4D54',
                    backgroundColor: '#0E4D54',
                    yAxisID: 'y',
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'Frauen',
                    data: studies.map((item: { WeiblicheStudierende: any; }) => item.WeiblicheStudierende),
                    borderColor: '#AA557F',
                    backgroundColor: '#AA557F',
                    yAxisID: 'y',
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'International',
                    data: studies.map((item: { AusländischeStudierende: any; }) => item.AusländischeStudierende),
                    borderColor: '#59A14F',
                    backgroundColor: '#59A14F',
                    yAxisID: 'y',
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'Dual',
                    data: studies.map((item: { Dual: any; }) => item.Dual),
                    borderColor: '#FFBE7D',
                    backgroundColor: '#FFBE7D',
                    yAxisID: 'y',
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
            ];

            setChartData({ labels, datasets });

        }



    }, [data, degree, semester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern


    return (
        <div style={{ height: "300px", width: "100%" }}> {/* Höhe fixiert auf 300px */}
            {
                chartData
                    ? <Line ref={chartRef} options={options} data={chartData} />
                    : <p>Lade Daten...</p>
            }

        </div>
    );
};

export default BarChart;

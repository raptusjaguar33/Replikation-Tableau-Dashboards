import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as aq from 'arquero';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const newLegendClickHandler = function (e, legendItem, legend) {



    const index = legendItem.datasetIndex;
    const ci = legend.chart;
    if (ci.isDatasetVisible(index)) {
        ci.hide(index);
        legendItem.hidden = true;
    } else {
        ci.show(index);
        legendItem.hidden = false;
    }
}

const axisLabelClickPlugin = {
    id: "axisLabelClickPlugin",
    afterEvent(chart, args) {
        const event = args.event;
        const { ctx, scales: { x } } = chart;

        if (event.type === "click") {


            const clickX = event.x;
            const clickY = event.y;

            x.ticks.forEach((tick, index) => {
                const tickX = x.getPixelForTick(index);
                const tickY = x.bottom;

                // Berechne, ob der Klick in der Nähe eines Labels war
                if (Math.abs(clickX - tickX) < 20 && Math.abs(clickY - tickY) < 20) {
                    alert(`Du hast auf das Label "${tick.label}" geklickt!`);
                    console.log("Geklicktes Label:", tick.label);
                }
            });
        }
    },
};

const plugin = {
    id: 'custom_canvas_background_color',
    beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color;
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
    defaults: {
        color: 'lightGreen'
    }
}

// const averageLinePlugin = {
//     id: "averageLinePlugin",
//     afterDatasetDraw(chart) {


//         const { ctx, scales: { y } } = chart;

//         // **1. Alle Y-Werte aus allen Datensätzen sammeln**
//         let allValues = [];
//         chart.data.datasets.forEach(dataset => {
//             allValues = allValues.concat(dataset.data);
//         });

//         // **2. Durchschnitt berechnen**
//         const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
//         const avgY = y.getPixelForValue(avg); // Y-Pixelwert für den Durchschnitt

//         // **3. Horizontale Linie zeichnen**
//         ctx.save();
//         ctx.beginPath();
//         ctx.moveTo(chart.chartArea.left, avgY);
//         ctx.lineTo(chart.chartArea.right, avgY);
//         ctx.lineWidth = 2;
//         ctx.strokeStyle = "red"; // Farbe der Durchschnittslinie
//         ctx.setLineDash([6, 6]); // Gepunktete Linie
//         ctx.stroke();
//         ctx.restore();

//         // **4. Durchschnitts-Label hinzufügen**
//         // ctx.fillStyle = "red";
//         // ctx.font = "bold 14px Arial";
//         ctx.fillText(`Ø`, chart.chartArea.right, avgY);
//     },
// };

// Das Plugin für die Hinzufügung von Beschriftungen hinter den letzten Punkten
const labelBehindLastPointPlugin = {
    id: 'labelBehindLastPoint',
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const datasets = chart.data.datasets;

        // Durch alle Datensätze iterieren
        datasets.forEach((dataset) => {


            if (dataset.data.length > 0 && dataset.label == "Durchschnitt") {
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
                ctx.fillText(labelText, x + 5, y);  // Verschiebe den Text nach rechts
                ctx.restore();
            }
        });
    },
};

ChartJS.register(
    // axisLabelClickPlugin,
    labelBehindLastPointPlugin,
    // plugin,
    // averageLinePlugin // Durchschnittslinie registrieren
);


// Durchschnitt aller Y-Werte aus allen Datensätzen berechnen
const calculateAverageDataset = (data: any[]) => {
    let values: number[] = [];

    // Anzahl der Arrays
    const numArrays = data.length;

    // Initialisierung der Summe für jede Position
    const sums = [0, 0, 0, 0, 0];

    // Werte summieren
    data.forEach((item: { data: any[]; }) => {
        item.data.forEach((value, index) => {
            sums[index] += value;
        });
    });

    // Durchschnitt berechnen
    let averages = sums.map(sum => sum / numArrays);

    // Durchschnitts-Datenpunkte für jedes Label generieren
    return averages;
};


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
            position: "bottom",
            align: 'start',
            display: true,
            onClick: newLegendClickHandler,

        },
        // axisLabelClickPlugin, // Hier wird das Plugin eingebunden
        // plugin, // Hier wird das Plugin eingebunden
    },
    scales: {
        y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                display: true,
                text: 'Gesamtstudierende'
            }

        },
        x: {
            grid: {
                display: false
            },
        },
    },
};

export default function Chart({ data, degree, semester }) {

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
                .select("year", "Winter / Sommer", "Gesamtstudierende", "Fachbereich")
                .groupby("year")
                .rollup({
                    Fachbereich: aq.op.array_agg("Fachbereich"),
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


            for (let index = 0; index < studies.length; index++) {
                const element = studies[index];
                element["Gestaltung"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Gestaltung");
                element["Umweltplanung / Umweltrecht"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Umweltplanung / Umweltrecht");
                element["Bauen + Leben"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Bauen + Leben");
                element["Wirtschaft"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Wirtschaft");
                element["Technik"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Technik");
                element["Informatik"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Informatik");
                element["Umweltwirtschaft / Umweltrecht"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Umweltwirtschaft / Umweltrecht");
                element["Andere"] = sum(element["Fachbereich"], element["Gesamtstudierende"], "Andere");
                delete element["Fachbereich"]
                delete element["Gesamtstudierende"]
                // delete element["FSWinterSommer"]
                // delete element["HSWinterSommer"]

            }


            // Labels der X-Achse
            // const labels = ['2020', '2021', '2022', '2023', '2024'];
            const labels = [...new Set(studies.map((d) => d["year"]))];
            const datasets: any[] = [
                // **Neues Dataset für den Durchschnitt**
                {
                    label: 'Durchschnitt',
                    data: calculateAverageDataset([
                        { data: studies.map((item: { "Informatik": any; }) => item["Informatik"]) },
                        { data: studies.map((item: { "Wirtschaft": any; }) => item["Wirtschaft"]) },
                        { data: studies.map((item: { 'Bauen + Leben': any; }) => item['Bauen + Leben']) },
                        { data: studies.map((item: { 'Gestaltung': any; }) => item['Gestaltung']) },
                        { data: studies.map((item: { 'Umweltwirtschaft / Umweltrecht': any; }) => item['Umweltwirtschaft / Umweltrecht']) },
                        { data: studies.map((item: { 'Technik': any; }) => item['Technik']) },
                        { data: studies.map((item: { 'Umweltplanung / Umweltrecht': any; }) => item['Umweltplanung / Umweltrecht']) },
                    ]),
                    borderColor: '#104E55',
                    backgroundColor: '#104E55',
                    // borderWidth: 2,
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                    yAxisID: 'y',
                },
                {
                    label: 'Informatik',
                    // data: [561, 341, 891, 613],
                    data: studies.map((item: { "Informatik": any; }) => item["Informatik"]),
                    borderColor: '#B6CFD0',
                    backgroundColor: '#B6CFD0',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'Wirtschaft',
                    // data: [341, 891, 613, 123],
                    data: studies.map((item: { "Wirtschaft": any; }) => item["Wirtschaft"]),
                    borderColor: '#0E4D54',
                    backgroundColor: '#0E4D54',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'Bauen + Leben',
                    // data: [891, 613, 123, 513],
                    data: studies.map((item: { 'Bauen + Leben': any; }) => item['Bauen + Leben']),
                    borderColor: '#167C87',
                    backgroundColor: '#167C87',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'Gestaltung',
                    data: studies.map((item: { 'Gestaltung': any; }) => item['Gestaltung']),
                    borderColor: '#A50034',
                    backgroundColor: '#A50034',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie
                },
                {
                    label: 'Umweltwirtschaft / Umweltrecht',
                    data: studies.map((item: { 'Umweltwirtschaft / Umweltrecht': any; }) => item['Umweltwirtschaft / Umweltrecht']),
                    borderColor: '#003B5C',
                    backgroundColor: '#003B5C',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie

                },
                {
                    label: 'Technik',
                    data: studies.map((item: { 'Technik': any; }) => item['Technik']),
                    // data: [513, 10, 561, 341],
                    borderColor: '#D9C756',
                    backgroundColor: '#D9C756',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie

                },
                {
                    label: 'Umweltplanung / Umweltrecht',
                    data: studies.map((item: { 'Umweltplanung / Umweltrecht': any; }) => item['Umweltplanung / Umweltrecht']),
                    borderColor: '#A1D884',
                    backgroundColor: '#A1D884',
                    yAxisID: 'y',
                    borderDash: [6, 6], // Gepunktete Linie
                    pointRadius: 0, // Keine Punkte auf der Durchschnittslinie

                },

            ];

            setChartData({ labels, datasets });

        }



    }, [data, degree, semester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern


    return (
        <div style={{ height: "100%", width: "100%" }}> {/* Höhe fixiert auf 300px */}
            {
                chartData
                    ? <Line ref={chartRef} data={chartData} options={options} />
                    : <p>Lade Daten...</p>
            }
        </div>
    );
}
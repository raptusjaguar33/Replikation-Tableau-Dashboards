import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import * as aq from 'arquero';

// Chart.js registrieren
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, semester, previousSemester }) => {

    const chartRef = React.useRef();
    const [chartData, setChartData] = React.useState<any>(null);
    const [options, setOptions] = React.useState<any>(null);
    const [top10, setTop10] = React.useState<any>(null);

    React.useEffect(() => {
        const datasets = [];
        if (data.length > 0) {

            // Arquero: Top 10 Studiengänge nach Gesamtstudierenden
            var previoustop10 = aq
                .from(data)
                .filter(aq.escape((d: { Semester: string; }) => d.Semester === previousSemester))
                .groupby('Studiengang (Gruppe)', "Campus", "Fachbereich")
                .rollup({ Gesamtstudierende: aq.op.sum("Gesamtstudierende") })
                .rename({ Gesamtstudierende: 'Vorjahr' })

            var top10 = aq
                .from(data)
                .filter(aq.escape((d: { Semester: string; }) => d.Semester === semester))
                .groupby('Studiengang (Gruppe)', "Campus", "Fachbereich")
                .rollup({ Gesamtstudierende: aq.op.sum("Gesamtstudierende") })


            var top10Data = top10.join_left(previoustop10)
                .orderby(aq.desc("Gesamtstudierende"))
                .objects()

            top10 = top10Data.slice(0, 10);

            setTop10(top10)


            // Labels für X-Achse
            const labels = [...new Set(top10.map((d) => d["Studiengang (Gruppe)"]))];
            datasets.push({
                label: "Gesamt",
                data: top10.map(function (d) {
                    return d["Gesamtstudierende"] - d["Vorjahr"] > 0 ? d["Gesamtstudierende"] - Math.abs(d["Gesamtstudierende"] - d["Vorjahr"]) : d["Gesamtstudierende"]
                }),
                // data: bars,
                backgroundColor: function name(d) {
                    if (top10.length > 0) {
                        switch (top10[d.index]["Campus"]) {
                            case 'Hauptcampus':
                                return '#0E4D54';
                            case 'Campus Gestaltung':
                                return '#A50034';
                            case 'Umwelt-Campus Birkenfeld':
                                return '#A1D884';
                            default:
                                return 'grey'; // Für unbekannte oder nicht definierte Campus
                        }
                    }
                    return "#0F4C5C"
                },
                // borderColor: "#0F4C5C",
                // borderWidth: 1,
                stack: 'Stack 0',
            })

            datasets.push({
                label: "Differenz",
                data: top10.map((d) => Math.abs(d["Gesamtstudierende"] - d["Vorjahr"])), // Absoluter Wert der Differenz
                backgroundColor: top10.map((d) => d["Gesamtstudierende"] >= d["Vorjahr"] ? "#A6D785" : "#B22222"), // Grün für positiv, Rot für negativ
                // borderColor: "#000",
                // borderWidth: 1,
                stack: 'Stack 0', // Gleicher Stack wie "Gesamt"
            });

            const options = {
                maintainAspectRatio: false,
                responsive: true,
                indexAxis: 'y',
                aspectRatio: null,  // Höhe fixieren
                scales: {
                    x: {
                        stacked: true,
                        // ticks: { display: false, },
                        border: { display: false, },
                    },
                    y: {
                        stacked: true,
                        ticks: { display: true, },
                        grid: { display: false, },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                        position: "bottom",
                    },
                    title: {
                        display: true,
                        text: "Top10 Studiengänge mit Differenzanzeige",
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem: { dataIndex: any; }) {
                                const index = tooltipItem.dataIndex;
                                return `${top10[index]["Studiengang (Gruppe)"]}: ${top10[index]["Gesamtstudierende"]} (${top10[index]["Gesamtstudierende"] - top10[index]["Vorjahr"]})`;
                            }
                        }
                    }
                },
            };

            setOptions(options);
            setChartData({ labels, datasets });
        }

    }, [data, semester, previousSemester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    return (
        <div style={{ height: "300px", width: "100%" }}> {/* Höhe fixiert auf 300px */}
            {chartData ? <Bar ref={chartRef} data={chartData} options={options} /> : <p>Lade Daten...</p>}
        </div>
    );
};

export default BarChart;

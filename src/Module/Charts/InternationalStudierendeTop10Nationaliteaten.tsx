import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { readCSV } from "../../utils/readCSV"; // CSV-Importer
import * as aq from "arquero"; // Arquero importieren

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ selectedLocations }: { selectedLocations: string[] }) => {

    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            const data = await readCSV();

            const df = aq.from(data);

            // Schritt 1: Aggregieren und gruppieren nach Nationalität und Standort
            const grouped = df.groupby("Nationalität", "Standort")
                .rollup({ studierende: aq.op.sum("Studierende") })
                .objects(); // Gruppiert und summiert die Studierenden

            // Schritt 2: Umstrukturieren der Daten in das gewünschte Format
            const nationalities = {};

            grouped.forEach((entry: any) => {
                const nationalität = entry.Nationalität;
                const standort = entry.Standort;
                const studierende = entry.studierende;

                // Falls Nationalität noch nicht im nationalities-Objekt ist, initialisieren
                if (!nationalities[nationalität]) {
                    nationalities[nationalität] = {
                        Nationalität: nationalität,
                        total: 0, // Summe der Studierenden
                        Birkenfeld: 0,
                        Trier: 0,
                        "Idar-Oberstein": 0,
                    };
                }

                // Studierende zur jeweiligen Nationalität und Standort hinzufügen
                nationalities[nationalität].total += studierende;
                nationalities[nationalität][standort] = studierende;
            });

            // Schritt 3: Umwandeln des nationalities-Objekts in ein Array
            const formattedData = Object.values(nationalities);


            // Für das Diagramm: Top 10 Nationalitäten basierend auf der Gesamtzahl der Studierenden
            const top10 = formattedData.sort((a, b) => b.total - a.total).slice(0, 10);


            // Labels für X-Achse
            const labels = [...new Set(top10.map((d) => d.Nationalität))];

            // Standort-Daten für gestapeltes Bar Chart
            const standorte = selectedLocations;


            const datasets = standorte.map((standort, i) => ({
                label: standort,
                data: labels.map((land) => {
                    const eintrag = top10.find((d) => d.Nationalität === land);
                    return eintrag ? eintrag[standort] : 0;
                }),
                backgroundColor: ["#0E4D54", "#A1D884", "#A50034"][i], // Farben für Standorte
                borderColor: "#0E4D54",
                borderWidth: 1,
                stack: "Stack 0",
            }));



            setChartData({ labels, datasets });
        }

        fetchData();
    }, [selectedLocations]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    // Chart Optionen
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: { stacked: true, border: { display: false } },
            y: { stacked: true, grid: { display: false } }
        },
        plugins: {
            legend: { display: false, position: "right" },
            title: { display: true, text: "Top 10 Nationalitäten" }
        },
    };

    return (
        <div style={{ height: "300px", width: "100%" }}>
            {chartData ? <Bar data={chartData} options={options} /> : <p>Lade Daten...</p>}
        </div>
    );
};

export default BarChart;

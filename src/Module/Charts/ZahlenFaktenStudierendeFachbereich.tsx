import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from 'chart.js';
import { color } from 'chart.js/helpers';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { Chart } from 'react-chartjs-2';
import * as aq from 'arquero';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TreemapController, TreemapElement);

export default function TreemapChart({ data, semester, previousSemester }) {
    const [chartData, setChartData] = React.useState<any>(null);
    const [options, setOptions] = React.useState<any>(null);
    const [config, setConfig] = React.useState<any>(null);

    React.useEffect(() => {
        if (data.length > 0) {

            const fachbereichGrouped = aq
                .from(data)
                .filter(aq.escape((d: { Semester: string; }) => d.Semester === semester))
                .groupby("Fachbereich", "Campus")
                .rollup({ Studierende: aq.op.sum("Gesamtstudierende") })
                .orderby(aq.desc("Studierende"))
                .objects();


            // Optionen für das Diagramm
            const options = {
                plugins: {
                    title: {
                        display: true,
                        text: 'Studierende je Fachbereich und Campus',
                    },
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        displayColors: false,
                        callbacks: {
                            title(items: { raw: { _data: { name: any; }; }; }[]) {
                                return ''; // Titel des Tooltips
                            },
                            label(item: { raw: { _data: { Studierende: any; dataCoverage: any; Campus: any; Fachbereich: any; }; }; }) {
                                const {
                                    _data: { Studierende, Campus, Fachbereich },
                                } = item.raw;
                                return [
                                    `Campus: ${Campus}`,
                                    `Fachbereich: ${Fachbereich}`,
                                    `Gesamtstudierende: ${Studierende}`,
                                ];
                            },
                        },
                    },
                },
            };

            // Konfiguration des Treemap-Diagramms
            const config = {
                type: 'treemap',
                data: {
                    datasets: [
                        {
                            tree: fachbereichGrouped,
                            spacing: 1,
                            key: 'Studierende',
                            captions: {
                                align: 'center',
                                display: true,
                                color: 'red',
                                font: {
                                    size: 14,
                                },
                                hoverFont: {
                                    size: 16,
                                    weight: 'bold'
                                },
                                padding: 5
                            },
                            labels: {
                                display: true,
                                formatter: (context) => context.raw._data.Fachbereich,
                                align: 'left',
                                position: 'top',
                                font: [{ size: 20, weight: 'bold' }, { size: 12 }],
                                color: ['white', 'whiteSmoke'],
                                overflow: 'hidden',

                                // font: {
                                //     size: 12, // Schriftgröße für die Labels
                                //     weight: 'bold',
                                // },
                                // Position der Labels innerhalb des Rechtecks
                                // padding: {
                                //     top: 5, // Platzierung oben im Rechteck
                                //     left: 10, // Platzierung von links
                                // },
                            },
                            backgroundColor(context) {
                                if (context.type !== 'data') return 'transparent';

                                const { Campus } = context.raw._data;

                                // Setze die Farbe basierend auf dem Campus
                                switch (Campus) {
                                    case 'Hauptcampus':
                                        return color('#0E4D54').rgbString();
                                    case 'Campus Gestaltung':
                                        return color('#A50034').rgbString();
                                    case 'Umwelt-Campus Birkenfeld':
                                        return color('#A1D884').rgbString();
                                    default:
                                        return color('grey').rgbString(); // Für unbekannte oder nicht definierte Campus
                                }
                            },
                        },
                    ],
                },
            };


            setChartData(fachbereichGrouped)

            setOptions(options);
            setConfig(config);

        }
    }, [data, semester, previousSemester]); // Fetch neu, wenn sich die ausgewählten Standorte ändern

    return (
        <div style={{ width: '100%', height: '300px' }}>


            {chartData ? <Chart
                type="treemap"
                data={config.data}
                options={{
                    ...options,
                    responsive: true,
                    maintainAspectRatio: false
                }}
            /> : <p>Lade Daten...</p>}

        </div>
    );
}

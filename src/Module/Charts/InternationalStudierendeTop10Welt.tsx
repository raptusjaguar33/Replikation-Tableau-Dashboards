import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { readCSV } from "../../utils/readCSV";
import * as aq from "arquero";

const worldGeoJSON = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapping der englischen zu deutschen Ländernamen

const countryNameMap: Record<string, string> = {
    "Österreich": "Austria",
    "Jemen": "Yemen",
    "Afghanistan": "Afghanistan",
    "Albanien": "Albania",
    "Armenien": "Armenia",
    "Australien": "Australia",
    "Aserbaidschan": "Azerbaijan",
    "Belgien": "Belgium",
    "Bangladesch": "Bangladesh",
    "Burkina Faso": "Burkina Faso",
    "Bulgarien": "Bulgaria",
    "Bosnien und Herzegowina": "Bosnia and Herzegovina",
    "Bolivien": "Bolivia",
    "Brasilien": "Brasilien",
    "Weißrussland": "Belarus",
    "Kongo (Dem.Republik)": "Democratic Republic of the Congo",
    "Kanada": "Canada",
    "Schweiz": "Switzerland",
    "Sri Lanka": "Sri Lanka",
    "Kolumbien": "Colombia",
    "Costa Rica": "Costa Rica",
    "Dänemark": "Denmark",
    "Benin": "Benin",
    "Algerien": "Algeria",
    "Spanien": "Spain",
    "Kenia": "Kenya",
    "Tansania": "Tanzania",
    "Uganda": "Uganda",
    "Ecuador": "Ecuador",
    "Eritrea": "Eritrea",
    "El Salvador": "El Salvador",
    "Ägypten": "Egypt",
    "Äthiopien": "Ethiopia",
    "Frankreich": "France",
    "Finnland": "Finland",
    "Fidschi": "Fiji",
    "Vereinigtes Königreich": "United Kingdom",
    "Georgien": "Georgia",
    "Ghana": "Ghana",
    "Äquatorialguinea": "Equatorial Guinea",
    "Griechenland": "Greece",
    "Guinea": "Guinea",
    "Ungarn": "Hungary",
    "Hongkong": "Hong Kong",
    "Kroatien": "Croatia",
    "Italien": "Italy",
    "Israel": "Israel",
    "Indien": "India",
    "Iran": "Iran",
    "Irland": "Ireland",
    "Irak": "Iraq",
    "Island": "Iceland",
    "Japan": "Japan",
    "Jordanien": "Jordan",
    "Kirgisistan": "Kyrgyzstan",
    "Kasachstan": "Kazakhstan",
    "Luxemburg": "Luxembourg",
    "Libyen": "Libya",
    "Litauen": "Lithuania",
    "Marokko": "Morocco",
    "Malaysia": "Malaysia",
    "Republik Moldau": "Moldova",
    "Mexiko": "Mexico",
    "Mongolei": "Mongolia",
    "Nordmazedonien": "North Macedonia",
    "Mauritius": "Mauritius",
    "Myanmar": "Myanmar",
    "Norwegen": "Norway",
    "Namibia": "Namibia",
    "Nepal": "Nepal",
    "Niederlande": "Netherlands",
    "Ohne Angabe": "No information",
    "Oman": "Oman",
    "Portugal": "Portugal",
    "Peru": "Peru",
    "Pakistan, Islamische Rep.": "Pakistan",
    "Polen": "Polen",
    "Palästinens. Gebiete": "Palestinian Territories",
    "Taiwan": "Taiwan",
    "Chile": "Chile",
    "Kamerun": "Cameroon",
    "Indonesien": "Indonesia",
    "Mauretanien": "Mauritania",
    "Kosovo": "Kosovo",
    "Libanon": "Lebanon",
    "Rumänien": "Romania",
    "Korea, Republik": "South Korea",
    "Philippinen": "Philippines",
    "Togo": "Togo",
    "Russische Föderation": "Russia",
    "Singapur": "Singapore",
    "Slowenien": "Slovenia",
    "Somalia": "Somalia",
    "Serbien": "Serbia",
    "Südsudan": "South Sudan",
    "Staatenlos": "Stateless",
    "Arabische Republ.Syrien": "Syria",
    "Tadschikistan": "Tajikistan",
    "Thailand": "Thailand",
    "Turkmenistan": "Turkmenistan",
    "Tunesien": "Tunisia",
    "Türkei": "Turkey",
    "Ukraine": "Ukraine",
    "Vereinigte Arab. Emirate": "United Arab Emirates",
    "Ungeklärt": "",
    "Ver. Staaten von Amerika": "United States of America",
    "Usbekistan": "Uzbekistan",
    "Vietnam": "Vietnam",
    "China (VR)": "China",
    "Nigeria": "Nigeria",
    "St.Vincent u.d.Grenadines": "",
    "Venezuela": "Venezuela",
    "Südafrika": "South Africa",
};

// Hilfsfunktion zum Berechnen der Studierendenzahlen je Land und Standort
const processStudentData = (data: any, selectedLocations: string[]) => {
    const nationalities: Record<string, any> = {};

    data.forEach((entry: any) => {
        const { Nationalität, Standort, studierende } = entry;

        // Initialisiere Nationalität falls noch nicht vorhanden
        if (!nationalities[Nationalität]) {
            nationalities[Nationalität] = { Nationalität, total: 0, Birkenfeld: 0, Trier: 0, "Idar-Oberstein": 0 };
        }

        nationalities[Nationalität].total += studierende;
        nationalities[Nationalität][Standort] = studierende;
    });

    // Aggregiere Daten basierend auf den ausgewählten Standorten
    const formattedData = Object.values(nationalities);
    const updatedStudentData: Record<string, number> = {};

    formattedData.forEach((entry: any) => {
        const countryName = countryNameMap[entry.Nationalität] || entry.Nationalität;
        updatedStudentData[countryName] = selectedLocations.reduce((sum, location) => sum + (entry[location] || 0), 0);
    });

    return updatedStudentData;
};

const WorldMap: React.FC<{ selectedLocations: string[] }> = ({ selectedLocations }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [studentData, setStudentData] = useState<any>({});
    const [maxStudents, setMaxStudents] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    // useEffect(() => {
    //     const resizeObserver = new ResizeObserver((entries) => {
    //         if (!entries.length) return;
    //         const { width } = entries[0].contentRect;
    //         setDimensions({ width, height: width * 0.5 });
    //     });

    //     if (containerRef.current) {
    //         resizeObserver.observe(containerRef.current);
    //     }

    //     return () => resizeObserver.disconnect();
    // }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await readCSV();
                const df = aq.from(data);

                const grouped = df.groupby("Nationalität", "Standort")
                    .rollup({ studierende: aq.op.sum("Studierende") })
                    .objects();

                // Verarbeite die Daten
                const processedData = processStudentData(grouped, selectedLocations);

                // Berechne den maximalen Wert für die Farbskala
                const max = Math.max(...Object.values(processedData), 0);
                setMaxStudents(max);
                setStudentData(processedData);
            } catch (error) {
                console.error("Fehler beim Laden der CSV-Daten:", error);
            }
        }

        fetchData();
    }, [selectedLocations]);

    useEffect(() => {
        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const projection = d3.geoMercator().scale(width / 6).translate([width / 2, height / 1.5]);
        const pathGenerator = d3.geoPath().projection(projection);

        const tooltip = d3.select(tooltipRef.current)
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("color", "#fff")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none");

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", (event) => svg.selectAll("g").attr("transform", event.transform));

        svg.call(zoom);

        // GeoJSON-Daten laden
        d3.json(worldGeoJSON).then((topo: any) => {
            const data = feature(topo, topo.objects.countries);

            // Entferne alle existierenden Pfade
            svg.selectAll(".country").remove();
            const g = svg.append("g");
            const colorScale = d3.scaleLinear<string>().domain([0, maxStudents]).range(["#0E4D5411", "#0E4D54FF"]);

            // Füge neue Länderpfade hinzu
            g.selectAll<SVGPathElement, any>(".country")
                .data(data.features)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", pathGenerator)
                .attr("fill", (d) => {
                    const countryName = d.properties.name;
                    return studentData[countryName] ? colorScale(studentData[countryName]) : "#0E4D5411";
                })
                .attr("stroke", "#ffffff")
                .on("mouseover", function (event, d) {
                    const countryName = d.properties.name;
                    d3.select(this).attr("fill", "blue");
                    tooltip.style("visibility", "visible")
                        .html(`<strong>Nationalität:</strong> ${countryName}<br/><strong>Studierende:</strong> ${studentData[countryName] || 0}`)
                        .style("top", `${event.pageY + 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mousemove", (event) => {
                    // let left = event.pageY;
                    let top = event.clientY- svgRef.current.getBoundingClientRect().y;
                    // let top = 0;
                    // let left = event.pageX;
                    let left = event.clientX - svgRef.current.getBoundingClientRect().x;
                    // let left = 0;
                    
                    tooltip.style("top", `${top + 10}px`).style("left", `${left + 10}px`);
                })
                .on("mouseout", function (event, d) {
                    const countryName = d.properties.name;
                    d3.select(this).attr("fill", studentData[countryName] ? colorScale(studentData[countryName]) : "#0E4D5411");
                    tooltip.style("visibility", "hidden");
                });
        }).catch((error: any) => {
            console.error("Fehler beim Laden der GeoJSON-Datei:", error);
        });
    }, [studentData, maxStudents, dimensions]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "auto", position: "relative", overflow: "hidden" }}>
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
            <div ref={tooltipRef} style={{ position: "absolute", visibility: "hidden" }}></div>
        </div>
    );
};

export default WorldMap;
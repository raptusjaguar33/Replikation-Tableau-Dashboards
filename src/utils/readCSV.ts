import Papa from "papaparse";

export async function readCSV() {
  const response = await fetch("/Datasource/Auslaendische_Studierende_20241.csv");
  const csvText = await response.text();
  const { data } = Papa.parse(csvText, { header: true });
  return data;
}

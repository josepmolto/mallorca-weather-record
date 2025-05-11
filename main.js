const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const stations = require("./stations.json");
const { stat } = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const DATE = "2025-05-09";
const URL =
  "https://api.weather.com/v2/pws/dailysummary/3day?apiKey=e1f10a1e78da46f5b10a1e78da96f525&stationId=VALUE&numericPrecision=decimal&format=json&units=m";
const FOLDER_NAME = "./data";

async function downloadAndSave(stationId, townName) {
  try {
    await fs.mkdir(FOLDER_NAME, { recursive: true });

    const url = URL.replace("VALUE", stationId);
    const response = await axios.get(url);
    const fullPath = path.join(FOLDER_NAME, `${townName}.json`);

    // await fs.writeFile(
    //   fullPath,
    //   JSON.stringify(response.data, null, 2),
    //   "utf8"
    // );

    return response.data;
    console.log(`✅ File saved to ${fullPath}`);
  } catch (error) {
    console.error("❌ Error fetching or saving data:", error.message);
  }
}

function mapStationData(townName, stationData) {
  //   console.log(stationData);
  if (!stationData.summaries) {
    return {
      station: "TEST",
      date: DATE,
      maxTemperature: "-",
      minTemperature: "-",
      maxHumidity: "-",
      minHumidity: "-",
      maxWind: "-",
      totalPrecipitation: "-",
    };
  }
  for (const summary of stationData.summaries) {
    if (!summary.obsTimeLocal.startsWith(DATE)) {
      continue;
    }

    return {
      station: townName,
      date: DATE,
      maxTemperature: summary.metric.tempHigh,
      minTemperature: summary.metric.tempLow,
      maxHumidity: summary.humidityHigh,
      minHumidity: summary.humidityLow,
      maxWind: summary.metric.windspeedHigh,
      totalPrecipitation: summary.metric.precipTotal,
    };
  }
}

const csvWriter = createCsvWriter({
  path: path.join(__dirname, "data", "station-summary.csv"),
  header: [
    { id: "station", title: "Station" },
    { id: "date", title: "Date" },
    { id: "maxTemperature", title: "Max Temperature (°C)" },
    { id: "minTemperature", title: "Min Temperature (°C)" },
    { id: "maxHumidity", title: "Max Humidity (%)" },
    { id: "minHumidity", title: "Min Humidity (%)" },
    { id: "Max Wind", title: "Max Wind (km/h)" },
    { id: "totalPrecipitation", title: "Total Precipitation (l)" },
  ],
});

async function main() {
  const stationsData = [];
  for (const townName in stations) {
    const id = stations[townName];

    if (!id) {
      continue;
    }

    const stationData = await downloadAndSave(id, townName.toUpperCase());
    const mappedData = mapStationData(townName, stationData);

    stationsData.push(mappedData);
  }
  csvWriter
    .writeRecords(stationsData)
    .then(() => console.log("✅ CSV file written successfully."))
    .catch((err) => console.error("❌ Error writing CSV:", err));
}

main();

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const stations = require("./stations.json");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const DATE = getYesterdayDate();
const URL =
  "https://api.weather.com/v2/pws/dailysummary/3day?apiKey=e1f10a1e78da46f5b10a1e78da96f525&stationId=VALUE&numericPrecision=decimal&format=json&units=m";
const FOLDER_DATA = createAndGetFolderData();

async function downloadStationSummaryData(stationId, townName) {
  try {
    const url = URL.replace("VALUE", stationId);
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
  }
}

function getYesterdayDate() {
  let date = new Date();
  date.setDate(date.getDate() - 1);

  const dateString = `${date.getFullYear()}-${padDate(
    date.getMonth() + 1
  )}-${padDate(date.getDate())}`;

  return dateString;

  function padDate(num) {
    return num.toString().padStart(2, 0);
  }
}

function createAndGetFolderData() {
  const dateSplitted = DATE.split("-");
  const folderPath = path.join(
    "./data",
    dateSplitted[0],
    dateSplitted[1],
    dateSplitted[2]
  );
  fs.mkdirSync(folderPath, { recursive: true });

  return folderPath;
}

function getDefaultResponse(townName) {
  return {
    station: townName,
    date: DATE,
    maxTemperature: "-",
    minTemperature: "-",
    maxHumidity: "-",
    minHumidity: "-",
    maxWind: "-",
    totalPrecipitation: "-",
  };
}

function mapStationData(townName, stationData) {
  if (!stationData.summaries) {
    return getDefaultResponse(townName);
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
  return getDefaultResponse(townName);
}

async function main() {
  console.log(`[*] Extracting summary at ${DATE}`);
  const stationsData = [];
  for (const townName in stations) {
    const id = stations[townName];

    if (!id) {
      stationData.push(getDefaultResponse(townName));
      continue;
    }

    const stationData = await downloadStationSummaryData(
      id,
      townName.toUpperCase()
    );
    const mappedData = mapStationData(townName, stationData);

    stationsData.push(mappedData);
  }

  const csvWriter = createCsvWriter({
    path: path.join(FOLDER_DATA, "station-summary.csv"),
    header: [
      { id: "station", title: "Station" },
      { id: "date", title: "Date" },
      { id: "maxTemperature", title: "Max Temperature (°C)" },
      { id: "minTemperature", title: "Min Temperature (°C)" },
      { id: "maxHumidity", title: "Max Humidity (%)" },
      { id: "minHumidity", title: "Min Humidity (%)" },
      { id: "maxWind", title: "Max Wind (km/h)" },
      { id: "totalPrecipitation", title: "Total Precipitation (l)" },
    ],
  });
  csvWriter
    .writeRecords(stationsData)
    .then(() => console.log("✅ CSV file written successfully."))
    .catch((err) => console.error("❌ Error writing CSV:", err));
}

main();

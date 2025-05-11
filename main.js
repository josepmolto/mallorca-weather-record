const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const stations = require("./stations.json");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const DATE = getYesterdayDate();
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

const csvWriter = createCsvWriter({
  path: path.join(__dirname, "data", "station-summary.csv"),
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

async function main() {
  console.log(`[*] Extracting summary at ${DATE}`);
  const stationsData = [];
  for (const townName in stations) {
    const id = stations[townName];

    if (!id) {
      stationData.push(getDefaultResponse(townName));
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

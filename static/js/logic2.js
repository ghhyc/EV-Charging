// call the '/get-json' api to retrieve the from databse
d3.json("/evMap").then(evStationCluster);

// console.log(evStationCluster);
// ===============================
function evStationMarkers(jsonData) {
  var stationCoordinates = [];

  for (i = 0; i < jsonData.length; i++) {
    var marker = L.marker([
      jsonData[i].latitude,
      jsonData[i].longitude,
    ]).bindPopup("<h3>Station ID: " + jsonData[i].stationID + "</h4>");

    stationCoordinates.push(marker);
  }

  mapMaker(L.layerGroup(stationCoordinates));
}

function evStationCluster(jsonData) {
  var clusterMarkers = L.markerClusterGroup();

  // console.log(jsonData);

  for (i = 0; i < jsonData.length; i++) {
    clusterMarkers.addLayer(
      L.marker([jsonData[i].latitude, jsonData[i].longitude]).bindPopup(
        "<h3>Station ID: " + jsonData[i].stationID + "</h4>"
      )
    );
  }

  mapMaker(clusterMarkers);
}

function mapMaker(stationLocations) {
  // Create the tile layer that will be the background of our map.
  var tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  // Create a baseMaps object to hold the tile layer.
  var baseMaps = {
    Map: tile,
  };

  // console.log(stationLocations);

  // Create an overlayMaps object to hold the earthquakeLocations layer.
  var overlayMaps = {
    "EV stations Maps": stationLocations,
  };

  // Create the map object with options.
  var myMap = L.map("map", {
    center: [44.52, -103.67],
    zoom: 4,
    //  layer: [baseMaps, overlayMaps],
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);
  tile.addTo(myMap);
  stationLocations.addTo(myMap);
}

// ============== graph ===================================================

// this is the beginning of our async function, need to use it for our api call
anychart.onDocumentReady(async function () {
  // modify the data structure to work with AnyChart
  var inputChart = [];

  // need to await the data otherwise we end up trying to use empty array as data
  await d3.json("/state-emission/overview").then(function (jsonData) {
    for (i = 0; i < jsonData.length; i++) {
      var entityArray = [];
      entityArray.push(
        jsonData[i].state,
        jsonData[i].percentage,
        jsonData[i].absolute
      );
      inputChart.push(entityArray);
    }
  });

  // console.log(inputChart)

  // Creating the chart
  // https://playground.anychart.com/docs/v8/samples/BCT_Column_Chart_02

  var data = anychart.data.set(inputChart);

  // map the data
  var seriesData_1 = data.mapAs({ x: 0, value: 1 });
  var seriesData_2 = data.mapAs({ x: 0, value: 2 });

  // create the chart using AnyChart
  var chart = anychart.column();

  // create the first series, set the data and name
  var series1 = chart.column(seriesData_1);
  series1.name("Percentage Change");

  // create the second series, set the data and name
  var series2 = chart.column(seriesData_2);
  series2.name("Absolute Change");

  // set the chart title
  chart.title("State Level: Emission Change from 2000 to 2018");

  // set the titles of the axes
  chart.xAxis().title("States");
  chart.yAxis().title("Changes: Percentage (%) and Absolute ");

  // set the container id
  chart.container("graph-container");

  // initiate drawing the chart
  chart.draw();
});

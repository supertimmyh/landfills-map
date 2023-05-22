// import "mapbox-gl-js/v2.14.1/mapbox-gl.css";
// import "mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css";

mapboxgl.accessToken = "pk.eyJ1IjoiZW5lcmd5YnJpZ2h0IiwiYSI6ImNsaGY4NHQ4dDE0MjMzY3B4anJ3emozcGkifQ.4HLYo0tER7OlLcun_1wonQ";

var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/light-v9", //stylesheet location
  center: [-103.5917, 40.6699], // starting position
  zoom: 3, // starting zoom
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  })
);

map.on("load", function () {
  map.getSource();

  // Add a new source from our GeoJSON data and set the
  // 'cluster' option to true.
  map.addSource("solar-potential", {
    type: "geojson",
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    data: "https://gist.githubusercontent.com/supertimmyh/627d31cb63b0b8d65e820f65c240cd46/raw/7ca99b46498ce3e6b30cb12f523ab84df293de08/solar-potential-on.geojson",
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  // Use the earthquakes source to create five layers:
  // One for unclustered points, three for each cluster category,
  // and one for cluster labels.
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "solar-potential",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "solar-potential",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  });

  // Add a layer for the clusters' count labels
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "solar-potential",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });
});

map.on("click", function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ["unclustered-point"] });
  map.getCanvas().style.cursor = features.length ? "pointer" : "";

  if (!features.length) {
    return;
  }

  var feature = features[0];

  // Populate the popup and set its coordinates
  // based on the feature found.

  var popup = new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      "<b>Site ID&nbsp;:</b> " +
        feature.properties.SiteID +
        "<br />" +
        "<b>Site Name&nbsp;:</b> " +
        feature.properties.SiteName +
        "<br />" +
        "<b>Program&nbsp;:</b> " +
        feature.properties.Program +
        "<br />" +
        "<b>Site&nbsp;: </b> " +
        feature.properties.Site_CNRS +
        "<br />" +
        "<b>Address&nbsp;: </b> " +
        "<br />" +
        feature.properties.Address +
        "<br />" +
        feature.properties.City +
        "<br />" +
        feature.properties.County +
        "<br />" +
        feature.properties.State +
        "&nbsp;" +
        feature.properties.BUREAU_ZipCode +
        "<br />" +
        feature.properties.PAYS +
        "<br />" +
        "<b>Site Information&nbsp;:</b> <a href='" +
        feature.properties.SiteInfo +
        "' target='_blank'>" +
        feature.properties.SiteInfo +
        "</a>" +
        "<br />" +
        "<b>Utility Scale Solar PV&nbsp;:</b> " +
        feature.properties.UtilPV +
        "<br />" +
        "<b>Distribution Solar PV&nbsp;:</b> " +
        feature.properties.DistribPV +
        "<br />" +
        "<b>OffgridPV Solar PV&nbsp;:</b> " +
        feature.properties.OffgridPV +
        "<br />" +
        "<b>Available Acreage (Acres)&nbsp;:</b>" +
        feature.properties.Acreage +
        "<br />" +
        "<b>Potential PV Capacity (MW)&nbsp;:</b>" +
        feature.properties.EstPVCap +
        "<br />" +
        "<b>Nearest Transmission Line kV (kilovolts)&nbsp;:</b>" +
        feature.properties.TLkV +
        "<br />"
    )
    .addTo(map);
});

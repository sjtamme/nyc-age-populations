const options = {
    scrollWheelZoom: true,
    center: [40.7, -73.9],
    zoom: 10,
    zoomSnap: .1,
    dragging: true,
    zoomControl: true
}

const map = L.map('map', options);

const tiles = L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    ext: 'png'
}).addTo(map);


const newyorkLayer = $.getJSON("data/nyc_tracts.geojson", function (counties) {

    // counties is accessible here
    console.log(counties);

    Papa.parse('data/populations.csv', {

        download: true,
        header: true,
        complete: function (data) {

            processData(counties, data);

            // data is accessible to us here
            console.log('data: ', data);

            // note that counties is also accessible here!
            console.log('counties: ', counties);

        }
    }); // end of Papa.parse()

});

$.when(newyorkLayer).done(function () {
    // load, filter, and style the state outline 
    $.getJSON("data/nyc_tracts.geojson", function (data) {
            var tractLayer = L.geoJson(data, {
                style: function (feature) {
                    return {
                        color: '#20282e', // Gray
                        weight: 1.7,
                        fillOpacity: 0,
                        interactive: false
                    };
                }
            })
            // Add layer to map!
            tractLayer.addTo(map)
        })
        .fail(function () {
            // the data file failed to load
            console.log("Add data/nyc_tracts.geojson")
        });
})

function processData(counties, data) {

    /*  const letters = ["a", "b", "c", "d", "e"];
      const numbers = [1, 2, 3, 4, 5];

      letters.forEach((i) => {
          numbers.forEach((j) => {
              console.log(i, j); // what are these outputs?
          })
      }) */

    // loop through all the counties
    for (let i of counties.features) {

        // for each of the CSV data rows
        for (let j of data.data) {

            // if the county fips code and data fips code match
            if (i.properties.GEOID === j.GEOID) {

                // re-assign the data for that county as the county's props
                i.properties = j;

                // no need to keep looping, break from inner loop
                break;
                // console.log the values
                // console.log('county geoid: ', i.properties.GEOID);
                // console.log('data geoid: ', j.GEOID);
            }
        }
    }

    // empty array to store all the data values
    const rates = [];

    // iterate through all the counties
    counties.features.forEach(function (county) {

        // iterate through all the props of each county
        for (const prop in county.properties) {

            // if the attribute is a number and not one of the fips codes or name
            if (prop != "COUNTYFP" && prop != "OBJECTID" && prop != "STATEFP" && prop != "TRACTCE" &&
                prop != "NAME" && prop != "ALAND") {

                // push that attribute value into the array
                rates.push(Number(county.properties[prop]));
            }
        }
    });

    // verify the result!
    console.log(rates);

    var breaks = chroma.limits(rates, 'q', 5);

    var colorize = chroma.scale(chroma.brewer.OrRd).classes(breaks).mode('lab');

    drawMap(counties, colorize);

    drawLegend(breaks, colorize);

}

function drawMap(counties, colorize) {

    const dataLayer = L.geoJson(counties, {
        style: function (feature) {
            return {
                color: 'black',
                weight: 1,
                fillOpacity: 1,
                fillColor: '#1f78b4'
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on('mouseover', function () {
                layer.setStyle({
                    color: 'yellow',
                    weight: 2
                }).bringToFront();
            });
            layer.on('mouseout', function () {
                layer.setStyle({
                    color: 'black',
                    weight: 1
                });
            });
        }
    }).addTo(map);

    createSliderUI(dataLayer, colorize);

    updateMap(dataLayer, colorize, '2014');
}


function updateMap(dataLayer, colorize, currentYear) {

    dataLayer.eachLayer(function (layer) {

        var props = layer.feature.properties;

        layer.setStyle({
            fillColor: colorize(Number(props[currentYear]))
        });

        //popup build
        let popup = ''
        if (props["NAME"]) {
            popup = `<b>${props["NAME"]}</b><br />
                ${props[currentYear]}% Unemployed in ${currentYear}`;
        } else {
            popup = 'No Data'
        }

        layer.bindPopup(popup);

    });

}



function drawLegend(breaks, colorize) {

    const legendControl = L.control({
        position: 'topright'
    });

    legendControl.onAdd = function (map) {

        const legend = L.DomUtil.create('div', 'legend');
        return legend;

    };

    legendControl.addTo(map);

    const legend = $('.legend').html("<h3><span>2014</span>Population Percent </h3><ul>");

    for (let i = 0; i < breaks.length - 1; i++) {

        const color = colorize(breaks[i], breaks);

        const classRange = `<li><span style="background:${color}"></span>
             ${breaks[i].toLocaleString()} &mdash;
             ${breaks[i + 1].toLocaleString()} </li>`

        $('.legend ul').append(classRange);
    }

    // Add legend item for missing data
    $('.legend ul').append(`<li><span style="background:lightgray"></span>No data</li>`)

    legend.append("</ul>");

}



function createSliderUI(dataLayer, colorize) {

    const sliderControl = L.control({
        position: 'bottomleft'
    });

    sliderControl.onAdd = function (map) {

        const slider = L.DomUtil.get("ui-controls");

        L.DomEvent.disableScrollPropagation(slider);

        L.DomEvent.disableClickPropagation(slider);

        return slider;

    }

    sliderControl.addTo(map);

    $(".year-slider")
        .on("input change", function () {
            const currentYear = this.value;
            $('.legend h3 span').html(currentYear);
            updateMap(dataLayer, colorize, currentYear);
        });

}
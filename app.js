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

    console.log(counties);

    Papa.parse('data/populations.csv', {

        download: true,
        header: true,
        complete: function (data) {

            processData(counties, data);

            console.log('data: ', data);
            console.log('counties: ', counties);

        }
    });
});

let currentYear = 2014
let ageGroup = '0-14'

$.when(newyorkLayer).done(function () {
    $.getJSON("data/nyc_tracts.geojson", function (data) {
            var dataLayer = L.geoJson(data, {
                style: function (feature) {
                    return {
                        color: '#20282e',
                        weight: .2,
                        fillOpacity: 0,
                        interactive: false
                    };
                }
            })
            dataLayer.addTo(map)
        })
        .fail(function () {
            console.log("Add data/nyc_tracts.geojson")
        });
})


function processData(counties, data) {

    for (let county of counties.features) {

        let joined = false

        for (let csv of data.data) {

            if (county.properties.GEOID === csv.GEOID) {

                county.properties = csv;

                joined = true

                break;

                // console.log('county geoid: ', i.properties.GEOID);
                // console.log('data geoid: ', j.GEOID);

            }
        }
    }

    const rates = [];

    counties.features.forEach(function (county) {

        for (const prop in county.properties) {

            if (prop != "COUNTYFP" && prop != "OBJECTID" && prop != "STATEFP" && prop != "TRACTCE" &&
                prop != "NAME" && prop != "ALAND" && prop != "GEOID") {

                rates.push(Number(county.properties[prop]));
                //    console.log(county.properties[prop]);
            }
        }
    });

    console.log(rates);

    var breaks = chroma.limits(rates, 'q', 7);
    console.log(breaks);
    var colorize = chroma.scale(chroma.brewer.RdPu).classes(breaks).mode('lab');

    drawMap(counties, colorize);


    // drawLegend(breaks, colorize);

}



function drawMap(counties, colorize) {

    console.log(counties)
    console.log(colorize)
    const dataLayer = L.geoJson(counties, {
        style: function (feature) {
            return {
                color: 'black',
                weight: 0.1,
                fillOpacity: 1,
                fillColor: '#1f78b4'
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on('mouseover', function () {
                layer.setStyle({
                    //     color: 'yellow',
                    weight: .3
                }).bringToFront();
            });
            layer.on('mouseout', function () {
                layer.setStyle({
                    color: 'black',
                    weight: .4
                });
            });
        }
    }).addTo(map);

    createSliderUI(dataLayer, colorize);

    updateMap(dataLayer, colorize, '2014', ageGroup);
}




function updateMap(dataLayer, colorize, currentYear, ageGroup) {

    dataLayer.eachLayer(function (layer) {

        var props = layer.feature.properties;
        // console.log(props)
        layer.setStyle({
            fillColor: colorize(Number(props[`${currentYear}_${ageGroup}`]))
        });
    });

}


/*
function drawLegend(breaks, colorize) {

    const legendControl = L.control({
        position: 'topright'
    });

    legendControl.onAdd = function (map) {

        const legend = L.DomUtil.create('div', 'legend');
        return legend;

    };

    legendControl.addTo(map);

    const legend = $('.legend').html("<h3><span>2014</span>Population </h3><ul>");

    for (let i = 0; i < breaks.length - 1; i++) {

        const color = colorize(breaks[i], breaks);

        const classRange = `<li><span style="background:${color}"></span>
             ${breaks[i].toLocaleString()} &mdash;
             ${breaks[i + 1].toLocaleString()} </li>`

        $('.legend ul').append(classRange);
    }

    $('.legend ul').append(`<li><span style="background:lightgray"></span>No data</li>`)

    legend.append("</ul>");

} 
*/


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
            console.log(this)
            const currentYear = this.value;
            $('.legend h3 span').html(currentYear);
            updateMap(dataLayer, colorize, currentYear, ageGroup);
        });

}

// dropdown - look at bootstrap examples
$('.dropdown-toggle').dropdown()
    .on("click", function () {
        console.log(this)
        const ageGroup = this.value;
        //$('.legend h3 span').html(ageGroup);
        updateMap(dataLayer, colorize, currentYear, ageGroup);
    });
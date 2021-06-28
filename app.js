const options = {
    scrollWheelZoom: true,
    center: [40.7, -73.9],
    zoom: 11.4,
    zoomSnap: .1,
    dragging: true,
    zoomControl: false
}

const map = L.map('map', options);


const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            let dataLayer = L.geoJson(data, {
                style: function (feature) {
                    return {
                        color: '#20282e',
                        weight: .04,
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
    $.getJSON("data/borough_boundaries.geojson", function (boros) {
        let boroLayer = L.geoJson(boros, {
            style: function (feature) {
                return {
                    color: 'gray',
                    weight: 1.4,
                    fillOpacity: 0,
                    interactive: false
                };
            }
        })
        boroLayer.addTo(map)
        
    })
})





function processData(counties, data) {

    for (let county of counties.features) {

        let joined = false

        for (let csv of data.data) {

            if (county.properties.GEOID === csv.GEOID) {

                county.properties.pop = csv;

                joined = true

                break;

                // console.log('county geoid: ', i.properties.GEOID);
                // console.log('data geoid: ', j.GEOID);

            }
        }
    }

    const rates = [];

    counties.features.forEach(function (county) {

        for (const prop in county.properties.pop) {

            if (!prop.includes('_totpop') && prop != "GEOID") {

                const p = county.properties.pop[prop]
                const y = prop.substring(0, 4)
                const d = p / county.properties.pop[`${y}_totpop`]

                // var density = Number(county.properties.pop[prop]) / (Number(county.properties["ALAND"]) * 0.000247105); 

                //  rates.push(density);
                rates.push(d);

            }
        }
    });

    console.log(rates);

    var breaks = chroma.limits(rates, 'q', 7);
    console.log(breaks);
    var colorize = chroma.scale(chroma.brewer.RdPu).classes(breaks).mode('lab');


    drawMap(counties, colorize);
    drawLegend(breaks, colorize);

} //end processdata




function drawMap(counties, colorize) {

    console.log(counties)
    console.log(colorize)
    const dataLayer = L.geoJson(counties, {
        style: function (feature) {
            return {
                // color: 'black',
                weight: 0.1,
                fillOpacity: 1,
                fillColor: '#1f78b4'
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on('mouseover', function () {
                layer.setStyle({
                    color: 'black',
                    weight: 1.5,
                    // fillColor: 'yellow'
                });
                layer.on('mouseout', function () {
                    layer.setStyle({
                        color: '#20282e',
                        weight: 0,
                    })
                })
            });
        }
    }).addTo(map);

    createSliderUI(dataLayer, colorize);
    addUi(dataLayer, colorize);
    updateMap(dataLayer, colorize, currentYear, ageGroup);
} //end drawMap




function updateMap(dataLayer, colorize, currentYear, ageGroup) {

    console.log(`${currentYear}_${ageGroup}`)

   /* boroLayer.eachLayer(function (layer) {
    var boro_name = boroLayer.features.properties.boro_name
    }); */

    dataLayer.eachLayer(function (layer) {

        var props = layer.feature.properties;
        const total = props.pop[`${currentYear}_totpop`.toLocaleString()]

        const ratio = Number(props.pop[`${currentYear}_${ageGroup}`] / total) // ratio

        // could gather more info here
        if (total > 5) {
            layer.setStyle({
                fillColor: colorize(ratio)
            });
        } else {
            layer.setStyle({
                fillOpacity: 0,
                weight: 0
            });
        }

        let tooltip = ''
        if (total == 0) {
            tooltip = 'No Data';
        } else {
            tooltip = (`<b>Age Group Population Percent:</b> ${(ratio * 100).toFixed()}% <br>
                    <b>Total Population of Tract:</b> ${total}`);
        }

        layer.bindTooltip(tooltip);

    });

} //end updateMap



function drawLegend(breaks, colorize) {

    const legendControl = L.control({
        position: 'bottomright'
    });

    legendControl.onAdd = function (map) {

        const legend = L.DomUtil.create('div', 'legend');
        return legend;

    };

    legendControl.addTo(map);

    const legend = $('.legend').html("<h3><span>2014</span>Percent of Population</h3><ul>");

    for (let i = 0; i < breaks.length - 1; i++) {

        const color = colorize(breaks[i], breaks);

        const classRange = `<li><span style="background:${color}"></span>
            
        ${(breaks[i] * 100).toFixed(1)}% &mdash;
        ${(breaks[i + 1] * 100).toFixed(1)}% </li>`

        $('.legend ul').append(classRange);
    }

    // $('.legend ul').append(`<li><span style="background:lightgray"></span>No data</li>`)

    // legend.append("</ul>");

} //end drawLegend




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
            currentYear = this.value;
            $('.legend h3 span').html(currentYear);
            updateMap(dataLayer, colorize, currentYear, ageGroup);
        });

} //end createSliderUI


function addUi(dataLayer, colorize) {
    var selectControl = L.control({
        position: "topright"
    });

    selectControl.onAdd = function () {
        return L.DomUtil.get("dropdown-ui");
    };

    selectControl.addTo(map);
    $('#dropdown-ui select').change(function () {
        ageGroup = this.value;
        console.log(ageGroup);
        updateMap(dataLayer, colorize, currentYear, ageGroup);
    });
}
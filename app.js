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
/*
const tiles = L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    ext: 'png'
}).addTo(map);  */


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
        const boroLayer = L.geoJson(boros, {
            style: function (feature) {
                return {
                    color: '#20282e',
                    weight: 0,
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

                    /////////////* !!!!!!!!!!!!! NORMALIZE DATA HERE??  *///////////////

                var density = Number(county.properties.pop[prop]) / (Number(county.properties["ALAND"])* 0.000247105);
                // console.log(county);

                rates.push(density);

                //    console.log(county.properties[prop]);
            }
        }
    });

    console.log(rates);

    

    //var popDensity = (rates / ("ALAND * 0.0000003861"));

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
                    // color: 'yellow',
                    weight: .3
                }).bringToFront();
            });
        }
    }).addTo(map);

    createSliderUI(dataLayer, colorize);
    addUi(dataLayer, colorize);
    updateMap(dataLayer, colorize, currentYear, ageGroup);
} //end drawMap




function updateMap(dataLayer, colorize, currentYear, ageGroup) {

    dataLayer.eachLayer(function (layer) {

        var props = layer.feature.properties;
        // console.log(props)
        const density = Number(props.pop[`${currentYear}_${ageGroup}`])/(Number(props["ALAND"])* 0.000247105)
        layer.setStyle({
            fillColor: colorize(density)
        });
        layer.bindPopup(`density ${density}`)
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

    const legend = $('.legend').html("<h3><span>2014</span>Population</h3><ul>");

    for (let i = 0; i < breaks.length - 1; i++) {

        const color = colorize(breaks[i], breaks);

        const classRange = `<li><span style="background:${color}"></span>
            
             < ${breaks[i + 1].toLocaleString()} </li>`

        $('.legend ul').append(classRange);
    }

    $('.legend ul').append(`<li><span style="background:lightgray"></span>No data</li>`)

    legend.append("</ul>");

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
            const currentYear = this.value;
            $('.legend h3 span').html(currentYear);
            updateMap(dataLayer, colorize, currentYear, ageGroup);
        });

} //end createSliderUI



/* !!!!!!!!!!DROPDOWN ATTEMPT #1!!!!!!!!!!!!! */
function addUi(dataLayer, colorize) {
    var selectControl = L.control({
        position: "topright"
    });

    selectControl.onAdd = function () {
        return L.DomUtil.get("dropdown-ui");
    };

    selectControl.addTo(map);
    $('#dropdown-ui select').change(function () {
        const ageGroup = this.value;
        console.log(ageGroup);
        updateMap(dataLayer, colorize, currentYear, ageGroup);
    });
}


/* 1!!!!!!!!!!! DROPDOWN ATTEMPT #2!!!!!!!!!!!!!!!! 

    // dropdown - look at bootstrap examples
    $('.dropdown-menu')
        .on("click", function () {
            // console.log(this)
            const ageGroup = this.value;
            console.log(ageGroup)
            $('.dropdown-menu').html(ageGroup);
            updateMap(dataLayer, colorize, currentYear, ageGroup);
        });

        */
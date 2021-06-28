# Map Proposal

The topic for my final project is going to be the population in New York City, divided into different age ranges. My tentative title for the map is “Changing Ages in NYC.” One objective for the map is for users to be able to sort through various age groups (0-20, 20-30, 30-45, 45-60, 60-75, 75+) and see the population for each group, as well as the total population. Another objective is for users to be able to cycle through the year they are looking at. The map will show the populations of each age range/generation from 2014 to 2019 (or possibly 2020).  


The specific scenario I picture for my map users involve a family, the Smiths. The Smiths are looking to move to New York City. The parents have both been offered job opportunities in the city, and the kids (ages 4, 10, and 14) are excited. The Smiths have also been taking care of Katrina Smiths’ 85-year-old mother. They recently heard that NYC has become a city mostly full of 20-somethings, so Katrina Googles (on her laptop or mobile phone) the age of NYC residents. She is a novice map user, but she sees my public map and goes to it. She’s excited to see that she can use a slider to see how the population has changed in the past few years. Maybe the city really is growing more towards people in their 20s. She can see if the population seems to be getting younger, older, or staying the same. A legend shows her the colors associated with the various age ranges, and popups show the different neighborhoods around the city.


My data will come from the US Census Bureau census tracts. The specific tables of information for New York City that I will be using can be found here:  https://data.census.gov/cedsci/table?q=new%20york%20city&tid=ACSST1Y2019.S0101. I will be using the 1-year estimates for each year from 2014 to 2020 (hopefully). 


My anticipated method of thematic representation is a proportional symbols map. The user interface will have a drop-down menu for users to click on each age range/generation in order to see the percent share of age groups in various census tracts. I will calculate this by taking each age range and dividing it by the total population. Another UI component will be a slider at the bottom of the map for users to slide between the various years and see how the percentages have changed over time.


The technology stack I will be using might include QGIS if I need to wrangle or re-organize my data, since my data will be stored in CSV format. JS libraries I will need to use include Leaflet and either Leaflet Omnivore or Papa Parse to convert my CVS data into GeoJSON format. My course instructor advised me to create my base map in Mapbox. This will allow me to create a raster base map to match my theme, which I can then use in Leaflet. I may use a Bootstrap layout to display the page. HTML and CSS will also be used to create my webpage, and the map will be hosted on GitHub Pages.

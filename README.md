# nyc-age-populations
My final project is a map of New York City's populations of various age ranges. UI elements let the user look at the different age ranges, as well as different years (from 2014-2018).

I pulled the data from: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-data.2017.html (all the years can be seen along the top). The data includes tracts and data on population by age. 
Here is the tract metadata document: https://www2.census.gov/geo/tiger/TIGER_DP/2018ACS/Metadata/TRACT_METADATA_2018.txt (this is for 2018, but the same codes are used for each year).

For data wrangling, I used QGIS to filter the geojson to just NYC census tracts. I wrangled the data to create one CSV file that contains each year and each age group I want to map. I joined the files together using the GEOID attributes.

Still to do:
- get working dropdown menu
- normalize data using land area



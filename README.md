# nyc-age-populations

I currently have the geometry in one file and the attributes in CSV files by year, and I will join them using the GEOID attribute. I was able to pull out the data I want from each year, but I am not sure how to narrow the data down to just NYC - it shows the data for all of NY. While there are about 2,000 tracts in NYC, the data includes all 4,918 tracts in the state of NY. Because of this, I went ahead and used the entire state's geometry. 

Regarding the CSV files, I will need to add the male and female columns together for each age group, as well as some of the age groups for each tract so that there are fewer age ranges to look through. I will also need to join all of the years together so that there is one CSV file to join.


I pulled the data from: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-data.2017.html (all the years can be seen along the top). The data includes tracts and data on population by age. 
Here is the tract metadata document: https://www2.census.gov/geo/tiger/TIGER_DP/2018ACS/Metadata/TRACT_METADATA_2018.txt (this is for 2018, but the same codes are used for each year).


The map (once I get my data wrangled) will show the NYC population of different age ranges from 2014-2018. A UI drop down will allow users to choose what age range they want to view, and a UI slider will let them move through different years.

At the moment, I am using a template from a previous module as the web page, but I plan to choose a different template once I get the data and map figured out.

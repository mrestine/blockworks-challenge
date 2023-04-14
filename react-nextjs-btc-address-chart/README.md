## BTC Address Balance Chart Challenge

> **note from Matt**: hi Blockworks team! I've published my response to this challenge, though not without a couple of caveats I'd like to note. They're covered here in this readme in these quote blocks. 

Create an area or line chart that displays an all-time historic view on btc address balances.

Draw 5 lines in different colors displaying balances
- over $1k
- over $10k
- over $100k
- over $1M
- over $10M

Display a legend that labels each line color.

See "Example Implementation" to get an idea of how the chart should look like.
An ideal implementation would include all features you can see in the example.

> There are a couple of features I noticed that I left missing from my implementation. I left the Recharts tooltip which covers all lines and didn't overwrite it with the black styling. I prefer the more verbose tooltip.

### Implementation Notes:

* Use a charting engine you feel most comfortable with
* Use the static data provided (`data/Coin_Metrics_Network_Data_2023-02-02T14-32.csv`) to build an API method
(`pages/api/btc-addresses`)
  * Format the CSV and return JSON timeseries for your charting engine
  * Call the API to load the data inside of your react component
* Make the chart look nice and clean (either by utilizing the example as a design template or give it your personal UI touch)

> I used Recharts. The brunt of the file parsing code is in lib/btcAddresses, so I could share it with the component file for use in SSR. More on that in a second.

## Bonus Points

* Add buttons and filter functionality to filter the chart by YTD, 12M, 3M and 1M.
* Improve performance by leveraging server side rendering

> Originally, I had all the data grabbed from the lib in GetStaticProps, but nextjs starting dropping me warnings about payload size. I changed the default filter to 12 months, allowing me to truncate the 13-year trove of data to a paltry 366 rows inside GetStaticProps. I also memoized the indices where the other filters start within that 12-month block to reduce client-side calculations. The rest of the data is fetched from the api after page load without blocking the rendering.

## Example Implementation

![chart1.png](chart1.png)

![chart2.png](chart2.png)

![chart3.png](chart3.png)

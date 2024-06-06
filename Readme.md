# Node.js Initial API

This is a simple Node.js Express API application that fetches repository data from GitHub and calculates scores based on specified metrics.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

* Clone the repository
    * ```git clone https://github.com/yeshwanth581/condoGroup-assignment.git```

* Install dependencies
    * ```npm install```

* Run the unit and e2e tests
    * ```npm run test```

* Run the app in dev mode
    * ```npm run dev```

* Run the app in prod mode
    * ```npm run build```
    * ```npm run start```
    
* Run the app in docker container
    * For dev env: ```docker-compose up app-dev``` 
    * For prod env: ```docker-compose up app-prod``` 

### Notes:
1. DB
    1. The DB has 3 tables users, stocks, stockTrades
    2. The users table have username and hashed pwd.
2. Auth
    1. Post registration(/register), once the user login using the same creds a JWT token is retrned in resp.
    2. This header is to be passed as Authentication header which check and authorizes user.
    3. A auth middleware handles the validation of token for each api req except /login, /register
    4. For faster access of JWT keys we are using Redis instead of validating via DB.
3. Finnhub webscockets
    1. We have by default subscribed to a single stock. Since subscribing to all stocks will not be enough for us to handle.
    2. But post that rest of the logic is there in such a way that it accepts multiple stocks and they can be subscribed in the middle and still data will be ingested to DB.
    3. The stocks data is stored in two tables in DB. one is stocks which has a id and stock symbol info. Anoter table is stockTrades which have all the trades referencing to stock Id. The split of tables is done so that if there is a change in stock symbol we can just alter a single record, instead of million records.
    4. Also to insert the trades we need respective stock id info. if it is available we will use the id, else we will create and use the id. For faster access of id for the stock by symoble, we are using redis to fetch data quickly.
3. /:symbol/getCandleStickData?startDate=<start>&endDate=<end>
    1. The stocks symbol is to be passed mandatorily. So included it in path param
    2. The start and end dates are taken as timestamp values in epoch format(1717694173000).
    3. Once we fetch all the data in the DB we are running the logic to aggregate the data.
    4. We can furthur optimize this by storing aggregated data in redis for faster access for particular stock. We can normalize the data range and we can re-use for future purposes if the user input date is same or overlapping.(This is a optimization which was not implemented)
    5. If possible it will be great to get aggregated info from DB itself instead of doing in Node.js. We can have a PL/SQl code that returns that info or create seperate views for ranges of 1day, 1hr, 30min etc and fetch info much faster.4
--- To be implemented ---
4. stock symbol updates:
    1. To update the stock symbol and the ability to subscribe based on user input can be acheieved like below:
        1. Create a websockets server which has the capability to take the symbol as input and subscribe.
        2. if there is a change in symbol from finnhub, we can update the record in DB and send a event to user via websocket.
5. Frontend:
    1. We can use web-sockets to see current trading data for a symbol.
    2. I would take a symbol as input and will trigger getAggregatedCandleStick endpoint and subscribe to trade events via webscoket post login.
    3. This way I can dispaly the cahrt and also live stock price in single UI
6. .env
    1. The env file can be encrypted using the git-crypt lock, unlock and can be commited to repo. Here i;m commiting as plain text.
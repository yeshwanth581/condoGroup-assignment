# Node.js Initial API

This is a simple Node.js Express API application that fetches repository data from GitHub and calculates scores based on specified metrics.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

* Clone the repository
    * ```git clone https://github.com/yeshwanth581/redcare-pharmacy-assignment.git```

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
1. Implemented two endpoints ```/getAllRepos``` and ```/getRepoInfo```.
2. ```getAllRepos```
    1. This endpoint is used to fetch all repos based on user inputs for language and repo creation date.
    2. API has the capability to sort, order, adjust the results via pagination(limit,page,order,sortBy)
    3. A score is calcualted based on stars, forks, recency of updates for a repo. The weight percentage is stars(50%), forks(30%), recency(20%)
    4. Using the ```excludedScoreCriteria``` query param we can ignore at max 2 of 3 criteria for scoring. Ex: ...&excludedScoreCriteria=forks,recency or ...&excludedScoreCriteria=stars
    5. In the API resp along with repo info, there will be info about the score of the repo and breakdown of them to explain how the score is calcualted.
    6. Based on the ```excludedScoreCriteria``` param data the breakdown values and weights will be adjusted. This gives user the flexibility to selectively consider score based on their interests.
3. ```getRepoInfo```
    1. The reason why this endpoint is implemented is i didnt wanted to show old score on the initial search as it will require more resources, So I felt it would be better to get this info for one repo at a time than for all repos in the initial search.
    2. This endpoint will give info about a particular repo.
    3. For sake of simplicity the resp is similar to ```/getAllRepos``` resp with additional ```oldScore, diffPercentage```
    4. The ```oldScore``` key will give info about the score based on lastSearch for this repo.
    5. The ```diffPercentage``` will give the change percentage of scores(current and previous). The positive percentage infers a increase in score and negative infers opposite.
    6. We can also use ```excludedScoreCriteria``` query param to get score info for old, current repo data conditionally for flexible comparision. Based on this data the score is dynamically calculated betwen both info.
    7. We can use DB too, to store data of previous search. But I felt it is a overkill so went with a in-memory cache DB to store previous search data.

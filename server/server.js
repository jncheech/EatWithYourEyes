require('dotenv').config();

const express = require('express');

const port = process.env.PORT || 5000;

const { YelpSearch } = require('./yelp-search');


var app = express();

app.get('/search/:page', (req, res) => {
    
    var promise = new Promise( (resolve,reject) => {
        YelpSearch.queryAPI(req.query.location, req.params.page, resolve, reject);
    })

    promise
    .then( (resp) => {
        let restaurantData = {};
        let result = resp.result;
        let maxResults = resp.maxResults;
        
        for (let loc in result) {
            restaurantData[loc] = result[loc];
        }
        
        res.json({ 
            results: restaurantData, 
            maxPage: Math.ceil(maxResults/5)
        });

    })
    .catch( (err) => { 
        res.json({
            errorMessage: "There was an error in the request, please check your search terms or try again"
        })
    });
    
});

app.listen(port, () => {
   console.log(`now listening on port ${port}`);
});

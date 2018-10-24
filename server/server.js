require('dotenv').config();

const express = require('express');
const path = require('path');

const { YelpSearch } = require('./yelp-search');

const port = process.env.PORT || 5000;
var app = express();  

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/search/:page', (req, res) => {
    
    var promise = new Promise( (resolve,reject) => {
        YelpSearch.queryAPI(req.query.location, req.params.page, resolve, reject);
    });

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/public/index.html'));
});

app.listen(port, () => {
   console.log(`now listening on port ${port}`);
});

require('dotenv').config();
const API_KEY = process.env.YELP_API_KEY;
const axios = require('axios');
const express = require('express');

const port = process.env.PORT || 5000;
const config =  {'Authorization' : `Bearer ${API_KEY}` };

var app = express();

var storedBusinesses = {};
var storedUrls = {};

app.get('/search/:page', (req, res) => {
    let location = req.query.location;
    
    var promise = new Promise( (resolve,reject) => {
        console.log(`lookup for ${location}`);
        console.log(storedBusinesses[location]);
        if (parseInt(req.params.page) > 0 && storedBusinesses[location].length > 5) {
            console.log('next page?');
            var limit = storedBusinesses[location].length > 5 ? 5 : storedBusinesses[location].length;
            var urls = [];
            
            // console.log('page limit' , limit * req.params.page);
            for (let i = 0 + (5 * req.params.page); i < 5 + (5 * req.params.page); i++) {
                // console.log('stored business', storedBusinesses[i]);
                if (storedBusinesses[location][i]){
                    if (!storedUrls[storedBusinesses[location][i]]) {
                        console.log(`store search for ${storedBusinesses[location][i]}`)
                        urls.push(`https://api.yelp.com/v3/businesses/${storedBusinesses[location][i]}`) ;
                    } else {
                        console.log(`${storedBusinesses[location][i]} is stored`);
                    }
                }
            }
            // console.log('urls', urls);

            let promiseArray = urls.map( url => axios.get(url, { headers: config } ));
                axios.all(promiseArray)
                    .then( results => {
                        results.map( r => {
                            storedUrls[location][encodeURI(r.data.alias)] = {};
                            storedUrls[location][encodeURI(r.data.alias)]['name'] = r.data.name;
                            storedUrls[location][encodeURI(r.data.alias)]['rating'] = r.data.rating;
                            storedUrls[location][encodeURI(r.data.alias)]['photos'] = [];
                            r.data.photos.forEach( (photo) => {
                                storedUrls[location][encodeURI(r.data.alias)]['photos'].push(photo);
                            })
                        });
                        let promiseResolve = {
                            result: storedUrls[location],
                            maxResults: storedBusinesses[location].length
                        }
                        resolve(promiseResolve);
                    })
                    .catch( err => {
                        console.log(err);
                        reject(err);
                    });

        } else if (typeof storedBusinesses[location] === 'undefined' || typeof storedUrls[location] === 'undefined'){
                storedBusinesses[location] = [];
                console.log(`wide business search for ${location}`);
                axios.get('https://api.yelp.com/v3/businesses/search', {
                    headers: config,
                    params: {
                        term: 'food',
                        location: location,
                        limit: 50
                    }
                }).then( res => {
                    console.log(res);
    
                    res.data.businesses.forEach( (business) => {
                        storedBusinesses[location].push(encodeURI(business.alias));
                    });
    
                    var limit = res.data.businesses.length > 5 ? 5 : res.data.businesses.length;
                    var urls = [];
    
                    for (let i = 0; i < limit; i++) {
                        console.log(`store search for ${storedBusinesses[location][i]}`)
                        urls.push(`https://api.yelp.com/v3/businesses/${storedBusinesses[location][i]}`) ;
                    }
    
                    let promiseArray = urls.map( url => axios.get(url, { headers: config } ));
                    axios.all(promiseArray)
                        .then( results => {
                            storedUrls[location] = [];
                            results.map( r => {
                                storedUrls[location][encodeURI(r.data.alias)] = {};
                                storedUrls[location][encodeURI(r.data.alias)]['name'] = r.data.name;
                                storedUrls[location][encodeURI(r.data.alias)]['rating'] = r.data.rating;
                                storedUrls[location][encodeURI(r.data.alias)]['photos'] = [];
                                r.data.photos.forEach( (photo) => {
                                    storedUrls[location][encodeURI(r.data.alias)]['photos'].push(photo);
                                })
                            });
                            // console.log('stored Urls', storedUrls[location]);
                            let promiseResolve = {
                                result: storedUrls[location],
                                maxResults: storedBusinesses[location].length
                            }
                            resolve(promiseResolve);
                        })
                        .catch( err => {
                            console.log(err);
                            reject(err);
                        });
                }).catch( err => {
                    reject(err);
                })
            } else {
                console.log('businesses stored already for location', location);
                // console.log(storedBusinesses);
                // console.log('stored urls', storedUrls[location]);
                let promiseResolve = {
                    result: storedUrls[location],
                    maxResults: storedBusinesses[location].length
                }
                resolve(promiseResolve);
            }
    })

    promise.then( (resp) => {
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

    }, (err) => {
        console.log(err);
    })
    
});

app.listen(port, () => {
   console.log(`now listening on port ${port}`);
});

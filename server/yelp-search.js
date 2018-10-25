const API_KEY = process.env.YELP_API_KEY;
const axios = require('axios');
const { memcache } = require('./memcache');

const config =  {'Authorization' : `Bearer ${API_KEY}` };

var YelpSearch = {
    
    queryAPI: function(location, page, success, fail) {
        
        let key_a = memcache.keyify('stored_businesses', location);
        let storedBusinesses = memcache.getCache(key_a) || {};
        
        let key_b = memcache.keyify('stored_urls', location);
        let storedUrls = memcache.getCache(key_b) || {};
        
        if (parseInt(page) > 0 && storedBusinesses[location].length > 5) {
            console.log('Additional pages');
            this.getAdditionalPages(location, page, success, fail);
        } else if (typeof storedBusinesses[location] === 'undefined' || typeof storedUrls[location] === 'undefined'){
            console.log('Wide search');
            this.getWideBusinesses(location, success, fail);
        } else {
            console.log('Businesses stored already for location', location);            
            success(this.constructResolvedPromise(location));
        }
    },
    getAdditionalPages: function(location, page, success, fail) {
        console.log('next page?', page);
        var urls = [];
        let storedBusinesses = {};
        let storedUrls = {};
        for (let i = 0 + (5 * page); i < 5 + (5 * page); i++) {
            let key = memcache.keyify('stored_businesses', location);
            storedBusinesses = memcache.getCache(key);
            if (storedBusinesses[location][i]){
                
                let key = memcache.keyify('stored_urls', location);
                storedUrls = memcache.getCache(key);
                if (!storedUrls[storedBusinesses[location][i]]) {
                    console.log(`Store search for ${storedBusinesses[location][i]}`)
                    urls.push(`https://api.yelp.com/v3/businesses/${storedBusinesses[location][i]}`) ;
                } else {
                    console.log(`${storedBusinesses[location][i]} is stored`);
                }
            }
        } 

        let promiseArray = urls.map( url => axios.get(url, { headers: config } ));
        if (promiseArray.length == 0) {
            success(this.constructResolvedPromise(location));
            return;
        }
        
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
            
            let key = memcache.keyify('stored_urls', location);
            memcache.setCache(key, storedUrls);
            success(this.constructResolvedPromise(location));
        })
        .catch( err => {
            console.log(err);
            fail(err);
        });
    },
    getWideBusinesses: function(location, success, fail) {
        let storedBusinesses = {};
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
            
            let key = memcache.keyify('stored_businesses', location);
            
            res.data.businesses.forEach( (business) => {
                storedBusinesses[location].push(encodeURI(business.alias));
            });
            
            memcache.setCache(key, storedBusinesses, 7 * 24 * 60 * 60 * 1000);

            var limit = res.data.businesses.length > 5 ? 5 : res.data.businesses.length;
            var urls = [];

            for (let i = 0; i < limit; i++) {
                console.log(`store search for ${storedBusinesses[location][i]}`)
                urls.push(`https://api.yelp.com/v3/businesses/${storedBusinesses[location][i]}`) ;
            }

            let promiseArray = urls.map( url => axios.get(url, { headers: config } ));
            axios.all(promiseArray)
                .then( results => {
                    let storedUrls = {}
                    storedUrls[location] = [];
                    results.map( r => {
                        let key = memcache.keyify('stored_urls', location);
                        storedUrls[location][encodeURI(r.data.alias)] = {};
                        storedUrls[location][encodeURI(r.data.alias)]['name'] = r.data.name;
                        storedUrls[location][encodeURI(r.data.alias)]['rating'] = r.data.rating;
                        storedUrls[location][encodeURI(r.data.alias)]['photos'] = [];
                        r.data.photos.forEach( (photo) => {
                            storedUrls[location][encodeURI(r.data.alias)]['photos'].push(photo);
                        });
                        memcache.setCache(key, storedUrls, 7 * 24 * 60 * 60 * 1000);
                    });
                    success(this.constructResolvedPromise(location));
                })
                .catch( err => {
                    console.log(err);
                    fail(err);
                });
        }).catch( err => {
            fail(err);
        })
    },
    constructResolvedPromise: function(location)  {
        let key_a = memcache.keyify('stored_businesses', location);
        let storedBusinesses = memcache.getCache(key_a);
        
        let key_b = memcache.keyify('stored_urls', location);
        let storedUrls = memcache.getCache(key_b);
        
        return {
            result: storedUrls[location],
            maxResults: storedBusinesses[location].length
        }
    }
}

module.exports = { YelpSearch };
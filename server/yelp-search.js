const API_KEY = process.env.YELP_API_KEY;
const axios = require('axios');
const config =  {'Authorization' : `Bearer ${API_KEY}` };

var YelpSearch = {
    storedBusinesses: {},
    storedUrls: {},
    queryAPI: function(location, page, success, fail) {
        console.log('inside query api');
        console.log('location', location);
        if (parseInt(page) > 0 && this.storedBusinesses[location].length > 5) {
            console.log('additional pages');
            this.getAdditionalPages(location, page, success, fail);
        } else if (typeof this.storedBusinesses[location] === 'undefined' || typeof this.storedUrls[location] === 'undefined'){
            console.log('wide search');
            this.getWideBusinesses(location, success, fail);
        } else {
            console.log('businesses stored already for location', location);            
            success(this.constructResolvedPromise(location));
        }
    },
    getAdditionalPages: function(location, page, success, fail) {
        console.log('next page?');
        var urls = [];
        for (let i = 0 + (5 * page); i < 5 + (5 * page); i++) {
            if (this.storedBusinesses[location][i]){
                if (!this.storedUrls[this.storedBusinesses[location][i]]) {
                    console.log(`store search for ${this.storedBusinesses[location][i]}`)
                    urls.push(`https://api.yelp.com/v3/businesses/${this.storedBusinesses[location][i]}`) ;
                } else {
                    console.log(`${this.storedBusinesses[location][i]} is stored`);
                }
            }
        } 

        let promiseArray = urls.map( url => axios.get(url, { headers: config } ));
            axios.all(promiseArray)
            .then( results => {
                results.map( r => {
                    this.storedUrls[location][encodeURI(r.data.alias)] = {};
                    this.storedUrls[location][encodeURI(r.data.alias)]['name'] = r.data.name;
                    this.storedUrls[location][encodeURI(r.data.alias)]['rating'] = r.data.rating;
                    this.storedUrls[location][encodeURI(r.data.alias)]['photos'] = [];
                    r.data.photos.forEach( (photo) => {
                        this.storedUrls[location][encodeURI(r.data.alias)]['photos'].push(photo);
                    })
                });
                success(this.constructResolvedPromise(location));
            })
            .catch( err => {
                console.log(err);
                fail(err);
            });
    },
    getWideBusinesses: function(location, success, fail) {
        this.storedBusinesses[location] = [];
        console.log(`wide business search for ${location}`);
        axios.get('https://api.yelp.com/v3/businesses/search', {
            headers: config,
            params: {
                term: 'food',
                location: location,
                limit: 50
            }
        }).then( res => {
            res.data.businesses.forEach( (business) => {
                this.storedBusinesses[location].push(encodeURI(business.alias));
            });

            var limit = res.data.businesses.length > 5 ? 5 : res.data.businesses.length;
            var urls = [];

            for (let i = 0; i < limit; i++) {
                console.log(`store search for ${this.storedBusinesses[location][i]}`)
                urls.push(`https://api.yelp.com/v3/businesses/${this.storedBusinesses[location][i]}`) ;
            }

            let promiseArray = urls.map( url => axios.get(url, { headers: config } ));
            axios.all(promiseArray)
                .then( results => {
                    this.storedUrls[location] = [];
                    results.map( r => {
                        this.storedUrls[location][encodeURI(r.data.alias)] = {};
                        this.storedUrls[location][encodeURI(r.data.alias)]['name'] = r.data.name;
                        this.storedUrls[location][encodeURI(r.data.alias)]['rating'] = r.data.rating;
                        this.storedUrls[location][encodeURI(r.data.alias)]['photos'] = [];
                        r.data.photos.forEach( (photo) => {
                            this.storedUrls[location][encodeURI(r.data.alias)]['photos'].push(photo);
                        })
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
        return {
            result: this.storedUrls[location],
            maxResults: this.storedBusinesses[location].length
        }
    }
}

module.exports = { YelpSearch };
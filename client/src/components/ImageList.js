import React, { Component } from 'react';

import FoodImage from './FoodImage';
import Loader from './Loader';

export default class ImageList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let imgArray = [];
        
        Object.keys(this.props.items).map( (key) => {
            let restaurant = this.props.items[key];
            let restaurantName = restaurant.name;
            let restaurantRating = restaurant.rating;
            let restaurantPhotos = restaurant.photos;
            
            restaurantPhotos.map( (src, i) => {
                imgArray.push(
                    <FoodImage 
                        src={src} 
                        alias={key} 
                        name={restaurantName}
                        rating={restaurantRating} />);                      
            })
        })
        return(
            
            <div className="image-list">
                { imgArray.length > 0 &&
                    imgArray
                }
                { (this.props.searching) && 
                    <Loader />
                }
                
            </div>
        )
    }
}
import React from 'react';
import StarRating from './StarRating';

const FoodImage = (props) => {
    let url = `https://www.yelp.com/biz/${props.alias}`;
    return (
        <div className="image-post">
            <a href={url} target="_blank" title={props.alias}>
                <img src={props.src} alt={props.alias}/>
            
                <div className="image-caption">
                    <span>{props.name}</span>
                    <StarRating rating={props.rating}/>
                </div>
            </a>
        </div>
    )
}

export default FoodImage;
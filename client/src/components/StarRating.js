import React from 'react';

const StarRating = (props) => {
    let half = !Number.isInteger(props.rating) ? true : false
    let ratings = [];
    for (let i = 0; i < Math.floor(props.rating); i++){
        ratings.push(<div class="star full">&#x2605;</div>)
    }
    if (half) ratings.push(<div class="star half">&#x2605;</div>);
    for (let i =0; i < Math.floor(5 - props.rating); i++){
        ratings.push(<div class="star empty">&#x2605;</div>)
    }
    return (
        <div className="rating">
            { ratings }
        </div>
    );
}

export default StarRating;



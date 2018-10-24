import React from 'react';
import spinner from './../assets/img/ajax-loader.gif';

const Loader = () => {
    return(
        <div className="loader-wrap">
            <img src={spinner} />
        </div>
    )
}

export default Loader;
import React from 'react';

const Notifcation = (props) => {
    return (
        <div className={`wrapper-notification show ${props.type}`}>
            <span>{props.message}</span>
        </div>
    )
}

export default Notifcation;
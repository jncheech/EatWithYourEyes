import React, { Component } from 'react';

export default class SearchBar extends Component {
    constructor(props){
        super(props);
        this.state = {
            location: ''
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSearch(this.state.location);
    }

    handleInputChange(event){
        this.setState({
            ...this.state,
            location: event.target.value
        })
    }

    render() {
        return(
            <div className="search-bar">
                <form onSubmit={this.handleSubmit}>
                    <input placeholder="Where do you want to eat? (City, State)" value={this.state.location} onChange={this.handleInputChange}/>
                </form>
            </div>
        )
    }

}
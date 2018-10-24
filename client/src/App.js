import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

import ImageList from './components/ImageList';
import SearchBar from './components/SearchBar';
import Notification from './components/Notification';

class App extends Component {
  state = {
      locations: [],
      searching: false,
      city: '',
      page: 0,
      maxPage: 0
  };

  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }
  
  handleScroll = (e) => {
    
    const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight) {
        if (!this.state.searching) {
          let location = this.state.city;
          let page = this.state.page + 1;
          if (page <= this.state.maxPage){
            this.setState({
              ...this.state,
              page: page
            }, () => {
              this.retrieveSources(location,page);
            })
          }
        }  
    } 
  }

  retrieveSources = (location, page) => {
    console.log(`retrieving ${location} with page ${page}`);
    this.setState({
      ...this.state,
      searching: true
    })
    axios.get(`/search/${page}`, {
      params: {
        location
      }
    }).then( res => {
      if (res.data.results) {
        this.setState({
          ...this.state,
          locations: res.data.results,
          searching: false,
          page: page,
          maxPage: res.data.maxPage,
          error: false,
          errorMessage: ''
        })
      } else {
        this.setState({
          ...this.state,
          error: true,
          errorMessage: res.data.errorMessage,
          searching: false
        })
      }
    }).catch( err => {
      console.log(err);
    })  
  }
  
  handleSearch = (location) => {
    this.setState({
      ...this.state,
      searching: true,
      city: location,
      locations: []
    }, () => {
      this.retrieveSources(location, 0)
    })
  }

  render() {
    return (
      <React.Fragment>
        <div className="App" onScroll={this.handleScroll}>
          <Notification type={this.state.error ? 'error' : ''} message={this.state.errorMessage} />
          { this.state.locations.length == 0 ? <h1>"I eat with my eyes." - My Wife</h1> : ""}
          <SearchBar onSearch={this.handleSearch}/>
          <ImageList searching={this.state.searching} items={this.state.locations}/>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
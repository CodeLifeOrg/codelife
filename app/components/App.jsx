import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";

class App extends Component {

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {

    return (
      <div> 
        { this.props.children }
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(() => ({}), mapDispatchToProps)(App);

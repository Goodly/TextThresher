import React, {Component} from 'react';
import style from "./styles.scss";

export default class HandleEnd extends Component {

  render() {

    var arrowup = {
      borderBottom: "15px solid " + this.props.color
    }

    var arrowdown = {
      borderTop: "15px solid " + this.props.color
    }

    var div_height = {
      height: "30px",
    }
    return (
        <span style={{position: 'absolute'}} >
          <div className="end-arrow-up" style={arrowup}>
            <div className="end-arrow-up-icon"
              onClick={this.props.onClick}
            >
              {"-"}
            </div>
          </div>
          <div className="end-arrow-down" style={arrowdown}>
            <div className="end-arrow-down-icon">
              {this.props.caseNum}
            </div>
          </div>
      </span>
    )
  }
};

HandleEnd.displayName = 'HandleEnd';
HandleEnd.PropTypes = {
  highlight: React.PropTypes.object,
  color: React.PropTypes.string,
  caseNum: React.PropTypes.number,
  caseMax: React.PropTypes.number
};

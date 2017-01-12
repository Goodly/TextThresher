import React, {Component} from 'react';
import style from "./styles.scss";


export default class HandleStart extends Component {
  render() {
    /*
    bottom: "-12px",
    left: "0px",

    bottom: "17px",
    left: "0px",



    var arrowup = {
      width: "0",
      height: "0",
      position: "absolute",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: "15px solid " + this.props.color,
      cursor: "pointer"
    }
    var arrowdown = {
      width: "0",
      height: "0",
      position: "absolute",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "15px solid " + this.props.color,
      color: "white",
      fontSize: "12",
      cursor: "pointer"
    }

    var iconup = {
      position: "absolute",
      bottom: "-22px",
      left: "-3px",
      color: "white",
      fontSize: "13px",
    }

    var icondown = {
      position: "absolute",
      top: "-27px",
      left: "-4.5px",
      color: "white",
      fontSize: "16px",
    }*/

    //style={{lineHeight: "1.5", width: "1px", whiteSpace:"nowrap"}}
    /*
    <span >
      <div style={arrowup}>
        <div style={iconup}>
          {this.props.caseNum}
        </div>
      </div>
      <div style={arrowdown} >
        <div style={icondown}>
          {"+"}
        </div>
      </div>
    </span>
    */
    var arrowup = {
      borderBottom: "15px solid " + this.props.color
    }

    var arrowdown = {
      borderTop: "15px solid " + this.props.color
    }

    return (
      <span style={{position: 'absolute'}} >
        <div className="start-arrow-up" style={arrowup}>
          <div className="start-arrow-up-icon">
            {this.props.caseNum}
          </div>
        </div>
        <div className="start-arrow-down" style={arrowdown}>
          <div className="start-arrow-down-icon">
            {"+"}
          </div>
        </div>
      </span>
    )
  }
};

HandleStart.displayName = 'HandleStart';

HandleStart.PropTypes= {
  highlight: React.PropTypes.object,
  color: React.PropTypes.string,
  caseNum: React.PropTypes.number,
  caseMax: React.PropTypes.number
}

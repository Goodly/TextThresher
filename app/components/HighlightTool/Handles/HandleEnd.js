import React, {Component} from 'react';
import style from "./styles.scss";

export default class HandleEnd extends Component {

  render() {
    /*
    left: "0px",
    bottom: "-12px",
    right: "-10px",

    bottom: "17px",
    right: "-10px",





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
      left: "0px",
      cursor: "pointer"
    }

    var iconup = {
      position: "absolute",
      bottom: "-22px",
      right: "-2px",
      color: "white",
      fontSize: "13px",
    }

    var icondown = {
      position: "absolute",
      top: "-24px",
      right: "-2.5px",
      color: "white",
      fontSize: "13px",
    }*/

    var arrowup = {
      borderBottom: "15px solid " + this.props.color
    }

    var arrowdown = {
      borderTop: "15px solid " + this.props.color
    }


    var new_case = this.props.caseNum - 1;
    if (new_case === 0) {
      new_case = 1;
    }
    //npm react-draggable
    //$( "#draggable" ).draggable({ axis: "x" });
    //onclick={highlight.changeCaseHighlight(this.props.highlight, new_case)}
    //{this.props.caseNum}
    //{"-"}
    /*
    <span>
        <div style={arrowup}>
          <div style={iconup}>
            {"-"}
          </div>
        </div>
        <div style={arrowdown}>
          <div style={icondown}>
            {this.props.caseNum}
          </div>
        </div>
    </span>

    */

    var div_height = {
      height: "30px",
    }
    return (
        <span style={{position: 'absolute'}} >
          <div className="end-arrow-up" style={arrowup}>
            <div className="end-arrow-up-icon">
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

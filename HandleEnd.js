import React, {Component} from 'react';

export default HandleEnd extends Component {


  displayName: 'HandleEnd',

  PropTypes: {
    highlight: React.PropTypes.object,
    color: React.PropTypes.string,
    caseNum: React.PropTypes.number,
    caseMax: React.PropTypes.number
  },

  render() {
    var arrowup = {
      width: "0",
      height: "0",
      position: "absolute",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: "15px solid " + this.props.color,
      bottom: "-12px",
      right: "-10px",
      cursor: "pointer"
    }
    var arrowdown = {
      width: "0",
      height: "0",
      position: "absolute",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "15px solid " + this.props.color,
      bottom: "17px",
      right: "-10px",
      color: "white",
      fontSize: "12",
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
    }


    var new_case = this.props.caseNum - 1;
    if (new_case == 0) {
      new_case = 1;
    }
    //npm react-draggable
    //$( "#draggable" ).draggable({ axis: "x" });
    //onclick={highlight.changeCaseHighlight(this.props.highlight, new_case)}
    //{this.props.caseNum}
    //{"-"}

    var div_height = {
      height: "30px",
    }
    return (
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
    )
  }
});

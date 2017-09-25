import React, {Component} from 'react';
import style from "./styles.scss";


export default class HandleStart extends Component {

  constructor(props) {
    super(props);
  }
  
  static propTypes = {
    highlight: React.PropTypes.object,
    color: React.PropTypes.string,
    caseNum: React.PropTypes.number,
    caseMax: React.PropTypes.number
  }

  render() {
    var arrowup = {
      borderBottom: "15px solid " + this.props.color,
      
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
          <div className="start-arrow-down-icon"
            onClick={this.props.onClick}
          >
            {"+"}
          </div>
        </div>
      </span>
    )
  }
}
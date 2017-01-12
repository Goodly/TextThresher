import React, {Component} from 'react';
import style from './styles.scss';

export default class HandleEnd extends Component {
  constructor(props){
    super(props);

  }
  render(){
    var new_case = this.props.caseNum - 1;
    if (new_case == 0) {
      new_case = 1;
    }

    var arrowup = {
      borderBottom: this.props.color
    }
    var arrowdown = {
      borderTop: this.props.color
    }

    return (
      <span>
          <div className="end-arrow-up">
            <div className="end-arrow-icon-up">
              {"-"}
            </div>
          </div>
          <div className="end-arrow-down">
            <div className="end-arrow-icon-down">
              {this.props.caseNum}
            </div>
          </div>
      </span>
    );
  }
}

HandleEnd.PropTypes = {
  highlight: React.PropTypes.object,
  color: React.PropTypes.string,
  caseNum: React.PropTypes.number,
  caseMax: React.PropTypes.number
};

HandleEnd.displayName = 'HandleEnd';

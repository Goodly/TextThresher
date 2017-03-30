import React, {Component} from 'react';
import style from './styles.scss';

export default class HandleStart extends Component {
  constructor(props){
    super(props);

  }
  render(){
    var new_case = this.props.caseNum - 1;
    if (new_case == 0) {
      new_case = 1;
    }
    return (
      <span >
        <div className="start-arrow-up">
          <div className="start-arrow-up-icon">
            {this.props.caseNum}
          </div>
        </div>
        <div className="start-arrow-down" >
          <div className="start-arrow-down-icom">
            {"+"}
          </div>
        </div>
      </span>
    );
  }
}

HandleStart.PropTypes = {
  highlight: React.PropTypes.object,
  color: React.PropTypes.string,
  caseNum: React.PropTypes.number,
  caseMax: React.PropTypes.number
};

HandleStart.displayName = 'HandleStart';

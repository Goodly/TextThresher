import React from 'react';
import PropTypes from 'prop-types';

export class Pager extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    result: PropTypes.object.isRequired,
    fetchArticles: PropTypes.func.isRequired,
  }

  render() {
    let elem = [];
    let result = this.props.result;
    if (result.previous !== null) {
      elem.push(
        <a key="prev"
           onClick={ (e) => {
             this.props.fetchArticles(result.previous);
             e.preventDefault();
           }}
           style={{'cursor': 'pointer'}}
           className="previous-group-button">
           Previous Group
        </a>);
    };
    if (result.next !== null) {
      elem.push(
        <a key="next"
           onClick={ (e) => {
             this.props.fetchArticles(result.next);
             e.preventDefault();
           }}
           style={{'cursor': 'pointer', 'float': 'right'}}
           className="next-group-button">
           Next Group
        </a>);
    };
    return (
      <div className="prev-next-pager clearfix">
        {elem}
      </div>
    );
  }
}

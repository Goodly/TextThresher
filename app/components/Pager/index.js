import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as articleViewActions from 'actions/articleView';
import fetchArticleView from 'django/articleView';

const mapStateToProps = state => {
  return {
    database: state.articleView.database,
  };
}

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(articleViewActions, dispatch)
)
export class Pager extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    resetIndex: PropTypes.func.isRequired,
  }

  render() {
    let elem = [];
    let result = this.props.database.result;
    if (result.previous !== null) {
      elem.push(
        <a key="prev"
           onClick={ (e) => {
             fetchArticleView(this.props, result.previous)
               .then( () => {this.props.resetIndex()} );
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
             fetchArticleView(this.props, result.next)
               .then( () => {this.props.resetIndex()} );
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

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
    onChange: PropTypes.func.isRequired,
  }

  render() {
    let reduxActions = {
      initArticleView: this.props.initArticleView,
      storeArticleView: this.props.storeArticleView,
      errorArticleView: this.props.errorArticleView,
    };
    let elem = [];
    let result = this.props.database.result;
    if (result.previous !== null) {
      elem.push(
        <a key="prev"
           onClick={ (e) => {
             fetchArticleView(reduxActions, result.previous);
             e.preventDefault();
           }}>
           Previous Group
        </a>);
    };
    if (result.next !== null) {
      elem.push(
        <a key="next"
           onClick={ (e) => {
             fetchArticleView(reduxActions, result.next);
             e.preventDefault();
           }}
           style={{'float': 'right'}}>
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

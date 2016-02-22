import React from 'react';
import Article from 'components/annotation/article';
import Topics from 'components/annotation/topics';
import TopicPicker from 'components/annotation/topicPicker';

import data from 'assets/tua.json';

export default React.createClass({
  displayName: 'Tua',

  childContextTypes: {
    params: React.PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      params: this.props.params
    };
  },

  propTypes: {
    params: React.PropTypes.object.isRequired
  },

  getInitialState() {
    // TODO: receive this data as an action
    return { tua: data.results };
  },

  render() {
    const {tua_id}: string = this.props.params;
    let tua = this.state.tua[tua_id];
    let article = tua.article;
    let topics = tua.analysis_type.topics;

    return (
      <div className='tua'>
        <div className='text-wrapper'>
          <Article topics={topics} article={article}/>
        </div>
        <Topics topics={topics}/>
        <TopicPicker topics={topics}/>
      </div>
    );
  }

});

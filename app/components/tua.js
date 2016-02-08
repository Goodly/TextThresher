import React from 'react';
import Article from 'components/article';
import Topics from 'components/topics';
import TopicHeader from 'components/topicHeader';
import TopicPicker from 'components/topicPicker';

import AppStore from 'store/appStore';

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
    return AppStore.getState();
  },

  render() {
    const {tua_id}: string = this.props.params;
    let tua = this.state.tua[tua_id];
    let article = tua.article;
    let topics = tua.analysis_type.topics;

    return (
      <div className='tua'>
        <div className='text-wrapper'>
          <TopicHeader topics={topics}/>
          <Article article={article}/>
        </div>
        <Topics topics={topics}/>
        <TopicPicker topics={topics}/>
      </div>
    );
  }

});

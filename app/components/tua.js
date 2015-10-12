import React from 'react';
import {RouteHandler} from 'react-router';
import objectAssign from 'object-assign';
import ListenerMixin from 'alt/mixins/ListenerMixin';

import Article from 'components/article';
import Topics from 'components/topics';
import TopicHeader from 'components/topicHeader';

import AppStore from 'store/appStore';

export default React.createClass({
  displayName: 'Tua',
  mixins: [ListenerMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    tua: React.PropTypes.array.isRequired,
    params: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return AppStore.getState();
  },

  render() {
    const {tua_id}: string = this.context.router.getCurrentParams();
    let tua = this.props.tua[tua_id];
    let article = tua.article;
    let topics = tua.analysis_type.topics;

    return (
      <div className='tua'>
        <TopicHeader topics={topics}/>
        <Article article={article}/>
        <Topics topics={topics}/>
      </div>
    );
  }

});

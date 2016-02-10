import React from 'react';
import jquery from 'jquery';

import 'CollapsibleList.scss';

export default React.createClass({
  displayName: 'CollapsibleList',

  propTypes: {
    // Array of objects { name: string, children: Array<Object> }
    variables: React.PropTypes.array.isRequired
  },

  getDefaultProps: function() {
    return {
      variables: [
        { name: 'variable 1',
          children: [
            { name: 'subvariable a', children: [] },
            { name: 'subvariable b', children: [] }
          ] },
        { name: 'variable 2',
          children: [
            { name: 'subvariable c', children: [] },
            { name: 'subvariable d', children: [
              { name: 'subvariable i', children: [] },
              { name: 'subvariable ii', children: [] }
            ] }
          ] }
      ]
    };
  },

  componentDidMount() {
    var $ = jquery;

    function deleteMeSomeday() {
      function collapse(elem) {
        $(elem).parent().children().toggle();
        $(elem).toggle()
               .toggleClass('variable-list__collapsible--closed');
      }

      $(document).ready(() => {
        $('.variable-list .variable-list__collapsible')
          // this is hacky - this code will run / chain for each CollapsibleList
          // that gets rendered.
          // they'll all try to attach this click handler, so hacky unbind
          .unbind('click')
          .click(function() {
            collapse(this);
          });
      });
    }
    deleteMeSomeday();
  },

  render() {
    function renderMarkup(variable) {
      if (variable.children.length <= 0) {
        return (
          <li>{ variable.name }</li>
        );
      }
      else
      {
        return (
          <li><span className='variable-list__collapsible'>{ variable.name }</span>
            <ul>
            { variable.children.map(child => {
              return renderMarkup(child);
            })}
            </ul>
          </li>
        );
      }
    }

    return (
      <div className='variable-list'>
        <ul>
          {this.props.variables.map(variable => {
            return renderMarkup(variable);
          })}
        </ul>
      </div>
    );
  }

});

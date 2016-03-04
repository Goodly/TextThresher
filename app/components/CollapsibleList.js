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
          id: 1,
          children: [
            { name: 'subvariable a', id: 2, children: [] },
            { name: 'subvariable b', id: 3, children: [] }
          ] },
        { name: 'variable 2',
          id: 4,
          children: [
            { name: 'subvariable c', id: 5, children: [] },
            { name: 'subvariable d', id: 6, children: [
              { name: 'subvariable i', id: 7, children: [] },
              { name: 'subvariable ii', id: 8, children: [] }
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
          <li key={variable.id}>{variable.name}</li>
        );
      }
      else
      {
        return (
          <li key={variable.id}>
            <span className='variable-list__collapsible'>{variable.name}</span>
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

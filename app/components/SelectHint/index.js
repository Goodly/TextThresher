import React, { Component } from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

function HintOption(props) {
  return <option value={props.hint_set.hint_type}>
           {props.hint_set.hint_type}
         </option>;
}

const mapStateToProps = state => {
  return {
    displayHintSelectControl: state.task.displayHintSelectControl,
  };
}

class SelectHint extends Component {

  constructor(props) {
    super(props);
  }

  static propTypes = {
    currTask: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
  }

  render() {
    if ( ! this.props.displayHintSelectControl) {
      return <div />;
    };
    if (this.props.currTask && this.props.currTask.hints) {
      let availableHints = this.props.currTask.hints.slice();
      // Add an initial blank option
      availableHints.unshift({hint_type: 'None'});
      return (
        <div className="display-hint-types-control">
          <label htmlFor="id_hint_type">
            Select hint type to show:
          </label>
          <select id="id_hint_type" className="select-hint-control"
            onChange={ this.props.onChange }
          >
            { availableHints.map(
              (hint_set, i) => <HintOption key={i} hint_set={hint_set} />
            )}
          </select>
        </div>
      );
    } else {
      return <div>No hints available.</div>;
    };
  }
}

export default connect(mapStateToProps)(SelectHint);

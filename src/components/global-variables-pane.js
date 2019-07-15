import React from 'react';
import PropTypes from 'prop-types';
import { Pane, Datepicker } from '@folio/stripes/components';
import LocationUnitsAccordionSet from './location-units-accordion-set';
import TitlesVolumesSegmentedControl from './titles-volumes-segmented-control';

export default class GlobalVariablesPane extends React.Component {
  static propTypes = {
    globalVariables: PropTypes.shape({
      isChecked: PropTypes.object.isRequired,
      titlesShouldBeUsed: PropTypes.bool.isRequired
    }).isRequired,
    institutions: PropTypes.array.isRequired,
    onGlobalVariablesChange: PropTypes.func.isRequired
  };

  // Updates a global variable.
  handleGlobalVariableChange(name, value) {
    this.props.onGlobalVariablesChange({
      ...this.props.globalVariables,
      [name]: value
    });
  }

  render() {
    return (
      <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
        <TitlesVolumesSegmentedControl titlesShouldBeUsed={this.props.globalVariables.titlesShouldBeUsed} onTitlesShouldBeUsedChange={titlesShouldBeUsed => { this.handleGlobalVariableChange("titlesShouldBeUsed", titlesShouldBeUsed); }} />
        <LocationUnitsAccordionSet institutions={this.props.institutions} isChecked={this.props.globalVariables.isChecked} onIsCheckedChange={isChecked => { this.handleGlobalVariableChange("isChecked", isChecked); }} />
        <Datepicker label="From" onChange={event => { this.handleGlobalVariableChange('from', event.target.value)}} value={this.props.globalVariables.from} />
        <Datepicker label="To" onChange={event => { this.handleGlobalVariableChange('to', event.target.value)}} value={this.props.globalVariables.to} />
      </Pane>
    );
  }
}

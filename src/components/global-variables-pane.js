import React from 'react';
import PropTypes from 'prop-types';
import { Pane } from '@folio/stripes/components';
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

  // Binds event handlers.
  constructor(props) {
    super(props);
    this.handleIsCheckedChange = this.handleIsCheckedChange.bind(this);
    this.handleTitlesShouldBeUsedChange = this.handleTitlesShouldBeUsedChange.bind(this);
  }

  // Updates the checked states of the location units.
  handleIsCheckedChange(isChecked) {
    this.props.onGlobalVariablesChange({
      ...this.props.globalVariables,
      isChecked
    });
  }

  // Updates the state of the titles-volumes segmented control.
  handleTitlesShouldBeUsedChange(titlesShouldBeUsed) {
    this.props.onGlobalVariablesChange({
      ...this.props.globalVariables,
      titlesShouldBeUsed
    });
  }

  render() {
    return (
      <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
        <LocationUnitsAccordionSet institutions={this.props.institutions} isChecked={this.props.globalVariables.isChecked} onIsCheckedChange={this.handleIsCheckedChange} />
        <TitlesVolumesSegmentedControl titlesShouldBeUsed={this.props.globalVariables.titlesShouldBeUsed} onTitlesShouldBeUsedChange={this.handleTitlesShouldBeUsedChange} />
      </Pane>
    );
  }
}

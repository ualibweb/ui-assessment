import React from 'react';
import PropTypes from 'prop-types';
import { Pane, ButtonGroup, Button } from '@folio/stripes/components';
import LocationUnitsAccordionSet from './location-units-accordion-set';

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
  }

  // Updates the checked states of the location units.
  handleIsCheckedChange(isChecked) {
    this.props.onGlobalVariablesChange({
      ...this.props.globalVariables,
      isChecked
    });
  }

  // Determines the style of a button.
  getButtonStyle(isTitlesButton) {
    return isTitlesButton === this.props.globalVariables.titlesShouldBeUsed ? "primary" : "default";
  }

  // Updates the state of the titles-volumes segmented control.
  handleButtonClick(isTitlesButton) {
    this.props.onGlobalVariablesChange({
      ...this.props.globalVariables,
      titlesShouldBeUsed: isTitlesButton
    });
  }

  render() {
    return (
      <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
        <LocationUnitsAccordionSet institutions={this.props.institutions} isChecked={this.props.globalVariables.isChecked} onIsCheckedChange={this.handleIsCheckedChange} />
        <ButtonGroup>
          <Button buttonStyle={this.getButtonStyle(true)} onClick={() => { this.handleButtonClick(true); }}>Titles</Button>
          <Button buttonStyle={this.getButtonStyle(false)} onClick={() => { this.handleButtonClick(false); }}>Volumes</Button>
        </ButtonGroup>
      </Pane>
    );
  }
}

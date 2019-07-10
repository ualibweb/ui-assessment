import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button } from '@folio/stripes/components';

export default class TitlesVolumesSegmentedControl extends React.Component {
  static propTypes = {
    titlesShouldBeUsed: PropTypes.bool.isRequired,
    onTitlesShouldBeUsedChange: PropTypes.func.isRequired
  };

  // Determines the style of a button.
  getButtonStyle(isTitlesButton) {
    return isTitlesButton === this.props.titlesShouldBeUsed ? "primary" : "default";
  }

  // Updates the state of the titles-volumes segmented control.
  handleButtonClick(isTitlesButton) {
    this.props.onTitlesShouldBeUsedChange(isTitlesButton);
  }

  render() {
    return (
      <ButtonGroup>
        <Button buttonStyle={this.getButtonStyle(true)} onClick={() => { this.handleButtonClick(true); }}>Titles</Button>
        <Button buttonStyle={this.getButtonStyle(false)} onClick={() => { this.handleButtonClick(false); }}>Volumes</Button>
      </ButtonGroup>
    );
  }
}

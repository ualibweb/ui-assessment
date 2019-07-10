import React from 'react';
import PropTypes from 'prop-types';
import { Pane, AccordionSet, Accordion, Checkbox, ButtonGroup, Button } from '@folio/stripes/components';

export default class GlobalVariablesPane extends React.Component {
  static propTypes = {
    globalVariables: PropTypes.shape({
      isChecked: PropTypes.object.isRequired,
      titlesShouldBeUsed: PropTypes.bool.isRequired
    }).isRequired,
    institutions: PropTypes.array.isRequired,
    onGlobalVariablesChange: PropTypes.func.isRequired
  };

  /* Toggles the checked state of the institution and initializes or
  deletes the checked states of the campuses and libraries under the
  institution, depending on whether the institution is being checked or
  unchecked. */
  handleInstitutionCheckboxChange(id, institutionIndex) {
    const isChecked = {...this.props.globalVariables.isChecked};
    const institutionIsBeingChecked = !isChecked[id];

    // Toggle the checked state of the institution.
    isChecked[id] = institutionIsBeingChecked;

    // Update the checked states of the campuses and libraries.
    this.props.institutions[institutionIndex].campuses.forEach(institutionIsBeingChecked ? campus => { isChecked[campus.id] = false; } : campus => {
      delete isChecked[campus.id];
      campus.libraries.forEach(library => { delete isChecked[library.id]; });
    });

    // Lift up the checked states.
    this.props.onGlobalVariablesChange({...this.props.globalVariables, isChecked});
  }

  /* Toggles the checked state of the campus and initializes or deletes
  the checked states of the libraries under the campus, depending on
  whether the campus is being checked or unchecked. */
  handleCampusCheckboxChange(id, institutionIndex, campusIndex) {
    const isChecked = {...this.props.globalVariables.isChecked};
    const campusIsBeingChecked = !isChecked[id];

    // Toggle the checked state of the campus.
    isChecked[id] = campusIsBeingChecked;

    // Update the checked states of the libraries.
    if (campusIsBeingChecked) this.props.institutions[institutionIndex].campuses[campusIndex].libraries.forEach(library => { isChecked[library.id] = false; });
    else this.props.institutions[institutionIndex].campuses[campusIndex].libraries.forEach(library => { delete isChecked[library.id]; });

    // Lift up the checked states.
    this.props.onGlobalVariablesChange({...this.props.globalVariables, isChecked});
  }

  // Toggles the checked state of the library.
  handleLibraryCheckboxChange(id) {
    this.props.onGlobalVariablesChange({
      ...this.props.globalVariables,
      isChecked: {
        ...this.props.globalVariables.isChecked,
        [id]: !this.props.globalVariables.isChecked[id]
      }
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
    const isChecked = this.props.globalVariables.isChecked;

    const institutionCheckboxes = [];
    const campusCheckboxes = [];
    const libraryCheckboxes = [];

    // Create the checkboxes.
    this.props.institutions.forEach((institution, institutionIndex) => {
      const institutionIsChecked = isChecked[institution.id];

      // Create a checkbox for the institution.
      institutionCheckboxes.push(<Checkbox checked={institutionIsChecked} key={institution.id} label={institution.name} onChange={() => { this.handleInstitutionCheckboxChange(institution.id, institutionIndex); }} />);

      // If the institution is checked, look at its campuses.
      if (institutionIsChecked) institution.campuses.forEach((campus, campusIndex) => {
        const campusIsChecked = isChecked[campus.id];

        // Create a checkbox for the campus.
        campusCheckboxes.push(<Checkbox checked={campusIsChecked} key={campus.id} label={campus.name} onChange={() => { this.handleCampusCheckboxChange(campus.id, institutionIndex, campusIndex); }} />);

        // If the campus is checked, look at its libraries.
        if (campusIsChecked) campus.libraries.forEach(library => {
          // Create a checkbox for the library.
          libraryCheckboxes.push(<Checkbox checked={isChecked[library.id]} key={library.id} label={library.name} onChange={() => {this.handleLibraryCheckboxChange(library.id); }} />);
        });
      });
    });

    return (
      <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
        <AccordionSet>
          <Accordion label="Institutions" separator={false}>
            {institutionCheckboxes}
          </Accordion>
          {campusCheckboxes.length !== 0 ? <Accordion label="Campuses" separator={false}>
            {campusCheckboxes}
          </Accordion> : null}
          {libraryCheckboxes.length !== 0 ? <Accordion label="Libraries" separator={false}>
            {libraryCheckboxes}
          </Accordion> : null}
        </AccordionSet>
        <ButtonGroup>
          <Button buttonStyle={this.getButtonStyle(true)} onClick={() => { this.handleButtonClick(true); }}>Titles</Button>
          <Button buttonStyle={this.getButtonStyle(false)} onClick={() => { this.handleButtonClick(false); }}>Volumes</Button>
        </ButtonGroup>
      </Pane>
    );
  }
}

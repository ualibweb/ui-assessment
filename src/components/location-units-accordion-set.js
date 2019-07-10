import React from 'react';
import PropTypes from 'prop-types';
import { AccordionSet, Accordion, Checkbox } from '@folio/stripes/components';

export default class LocationUnitsAccordionSet extends React.Component {
  static propTypes = {
    isChecked: PropTypes.object.isRequired,
    institutions: PropTypes.array.isRequired,
    onIsCheckedChange: PropTypes.func.isRequired
  };

    /* Toggles the checked state of the institution and initializes or
  deletes the checked states of the campuses and libraries under the
  institution, depending on whether the institution is being checked or
  unchecked. */
  handleInstitutionCheckboxChange(id, institutionIndex) {
    const isChecked = {...this.props.isChecked};
    const institutionIsBeingChecked = !isChecked[id];

    // Toggle the checked state of the institution.
    isChecked[id] = institutionIsBeingChecked;

    // Update the checked states of the campuses and libraries.
    this.props.institutions[institutionIndex].campuses.forEach(institutionIsBeingChecked ? campus => { isChecked[campus.id] = false; } : campus => {
      delete isChecked[campus.id];
      campus.libraries.forEach(library => { delete isChecked[library.id]; });
    });

    // Lift up the checked states.
    this.props.onIsCheckedChange(isChecked);
  }

  /* Toggles the checked state of the campus and initializes or deletes
  the checked states of the libraries under the campus, depending on
  whether the campus is being checked or unchecked. */
  handleCampusCheckboxChange(id, institutionIndex, campusIndex) {
    const isChecked = {...this.props.isChecked};
    const campusIsBeingChecked = !isChecked[id];

    // Toggle the checked state of the campus.
    isChecked[id] = campusIsBeingChecked;

    // Update the checked states of the libraries.
    this.props.institutions[institutionIndex].campuses[campusIndex].libraries.forEach(campusIsBeingChecked ? library => { isChecked[library.id] = false; } : library => { delete isChecked[library.id]; });

    // Lift up the checked states.
    this.props.onIsCheckedChange(isChecked);
  }

  // Toggles the checked state of the library.
  handleLibraryCheckboxChange(id) {
    this.props.onIsCheckedChange({
      ...this.props.isChecked,
      [id]: !this.props.isChecked[id]
    });
  }

  render() {
    const institutionCheckboxes = [];
    const campusCheckboxes = [];
    const libraryCheckboxes = [];

    // Create the checkboxes.
    this.props.institutions.forEach((institution, institutionIndex) => {
      const institutionIsChecked = this.props.isChecked[institution.id];

      // Create a checkbox for the institution.
      institutionCheckboxes.push(<Checkbox checked={institutionIsChecked} key={institution.id} label={institution.name} onChange={() => { this.handleInstitutionCheckboxChange(institution.id, institutionIndex); }} />);

      // If the institution is checked, look at its campuses.
      if (institutionIsChecked) institution.campuses.forEach((campus, campusIndex) => {
        const campusIsChecked = this.props.isChecked[campus.id];

        // Create a checkbox for the campus.
        campusCheckboxes.push(<Checkbox checked={campusIsChecked} key={campus.id} label={campus.name} onChange={() => { this.handleCampusCheckboxChange(campus.id, institutionIndex, campusIndex); }} />);

        // If the campus is checked, look at its libraries.
        if (campusIsChecked) campus.libraries.forEach(library => {
          // Create a checkbox for the library.
          libraryCheckboxes.push(<Checkbox checked={this.props.isChecked[library.id]} key={library.id} label={library.name} onChange={() => {this.handleLibraryCheckboxChange(library.id); }} />);
        });
      });
    });

    return (
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
    );
  }
}

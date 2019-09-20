import React from 'react';
import PropTypes from 'prop-types';
import { AccordionSet, Accordion, Checkbox } from '@folio/stripes/components';

export default class LocationUnitsAccordionSet extends React.Component {
  static propTypes = {
    institutions: PropTypes.array.isRequired,
    isSelected: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  /* Toggles the state of the institution and initializes or deletes the
  state of the campuses and libraries under the institution, depending
  on whether the institution is being selected or unselected. */
  handleInstitutionCheckboxChange(id, institutionIndex) {
    const isSelected = {...this.props.isSelected};
    const institutionIsBeingSelected = !isSelected[id];

    // Toggle the state of the institution.
    isSelected[id] = institutionIsBeingSelected;

    // Update the states of the campuses and libraries.
    this.props.institutions[institutionIndex].campuses.forEach(institutionIsBeingSelected ? campus => {
      isSelected[campus.id] = false;
    } : campus => {
      delete isSelected[campus.id];
      campus.libraries.forEach(library => {
        delete isSelected[library.id];
      });
    });

    // Lift up state.
    this.props.onChange(isSelected);
  }

  /* Toggles the state of the campus and initializes or deletes the
  states of the libraries under the campus, depending on whether the
  campus is being selected or unselected. */
  handleCampusCheckboxChange(id, institutionIndex, campusIndex) {
    const isSelected = {...this.props.isSelected};
    const campusIsBeingSelected = !isSelected[id];

    // Toggle the state of the campus.
    isSelected[id] = campusIsBeingSelected;

    // Update the states of the libraries.
    this.props.institutions[institutionIndex].campuses[campusIndex].libraries.forEach(campusIsBeingSelected ? library => {
      isSelected[library.id] = false;
    } : library => {
      delete isSelected[library.id];
    });

    // Lift up state.
    this.props.onChange(isSelected);
  }

  // Toggles the state of the library.
  handleLibraryCheckboxChange(id) {
    this.props.onChange({
      ...this.props.isSelected,
      [id]: !this.props.isSelected[id]
    });
  }

  render() {
    const institutionCheckboxes = [];
    const campusCheckboxes = [];
    const libraryCheckboxes = [];

    // Create the checkboxes.
    this.props.institutions.forEach((institution, institutionIndex) => {
      const institutionIsSelected = this.props.isSelected[institution.id];

      // Create a checkbox for the institution.
      institutionCheckboxes.push(<Checkbox selected={institutionIsSelected} key={institution.id} label={institution.name} onChange={() => { this.handleInstitutionCheckboxChange(institution.id, institutionIndex); }} />);

      // If the institution is selected, look at its campuses.
      if (institutionIsSelected) institution.campuses.forEach((campus, campusIndex) => {
        const campusIsSelected = this.props.isSelected[campus.id];

        // Create a checkbox for the campus.
        campusCheckboxes.push(<Checkbox selected={campusIsSelected} key={campus.id} label={campus.name} onChange={() => { this.handleCampusCheckboxChange(campus.id, institutionIndex, campusIndex); }} />);

        // If the campus is selected, create checkboxes for its libraries.
        if (campusIsSelected) campus.libraries.forEach(library => {
          libraryCheckboxes.push(<Checkbox selected={this.props.isSelected[library.id]} key={library.id} label={library.name} onChange={() => {this.handleLibraryCheckboxChange(library.id); }} />);
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
};

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Paneset, Pane, AccordionSet, Accordion, Checkbox } from '@folio/stripes/components';

export default class Application extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      locationUnits: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        loadedAt: PropTypes.instanceOf(Date),
        records: PropTypes.array.isRequired
      })
    }).isRequired
  };

  static manifest = {
    locationUnits: {
      type: 'okapi',
      path: 'assessment/location-units'
    }
  };

  // Initialize state.
  constructor(props) {
    super(props);

    this.state = {
      locationUnitsLoadedAt: null
    };
  }

  /* Determines and records whether the location units have been loaded
  or not and initializes the checked state of the institutions'
  checkboxes. */
  static getDerivedStateFromProps(props, state) {
    const locationUnits = props.resources.locationUnits;
    const locationUnitsLoadedAt = locationUnits !== null && locationUnits.hasLoaded ? locationUnits.loadedAt.getTime() : null;

    return locationUnitsLoadedAt !== state.locationUnitsLoadedAt ? (() => {
      const checkedInstitutions = {};
      locationUnits.records.forEach(institution => { checkedInstitutions[institution.id] = false; });
      return {
        locationUnitsLoadedAt,
        checked: {
          institutions: checkedInstitutions
        }
      };
    })() : null;
  }

  /* Toggles the checked state of the institution's checkbox and
  initializes or deletes the checked states of the the checkboxes of the
  campuses and libraries under the institution, depending on whether the
  institution's checkbox is being checked or unchecked. */
  handleInstitutionCheckboxChange(id, i) {
    this.setState(state => {
      const checkboxIsBeingChecked = !state.checked.institutions[id];
      const checkedCampuses = {...state.checked.campuses};
      const checkedLibraries = {...state.checked.libraries};

      this.props.resources.locationUnits.records[i].campuses.forEach(campus => {
        if (checkboxIsBeingChecked) checkedCampuses[campus.id] = false;
        else {
          delete checkedCampuses[campus.id];
          campus.libraries.forEach(library => { delete checkedLibraries[library.id]; });
        }
      });

      return {
        checked: {
          ...state.checked,
          institutions: {
            ...state.checked.institutions,
            [id]: checkboxIsBeingChecked
          },
          campuses: checkedCampuses
        }
      };
    });
  }

  /* Toggles the checked state of the campus's checkbox and initializes
  or deletes the checked states of the checkboes of the libraries under
  the campus, depending on whether the campus's checkbox is being
  checked or unchecked. */
  handleCampusCheckboxChange(id, institutionIndex, campusIndex) {
    this.setState(state => {
      const checkboxIsBeingChecked = !state.checked.campuses[id];
      const checkedLibraries = {...state.checked.libraries};

      this.props.resources.locationUnits.records[institutionIndex].campuses[campusIndex].libraries.forEach(library => {
        if (checkboxIsBeingChecked) checkedLibraries[library.id] = false;
        else delete checkedLibraries[library.id];
      });

      return {
        checked: {
          ...state.checked,
          campuses: {
            ...state.checked.campuses,
            [id]: checkboxIsBeingChecked
          },
          libraries: checkedLibraries
        }
      };
    });
  }

  // Toggles the checked state of the library's checkbox.
  handleLibraryCheckboxChange(id) {
    this.setState(state => ({
      checked: {
        ...state.checked,
        libraries: {
          ...state.checked.libraries,
          [id]: !state.checked.libraries[id]
        }
      }
    }));
  }

  render() {
    const locationUnitsAccordionSet = this.state.locationUnitsLoadedAt !== null ? (function() {
      const checkboxes = {
        institutions: [],
        campuses: [],
        libraries: []
      };

      // Populate the checkbox arrays.
      this.props.resources.locationUnits.records.forEach((institution, institutionIndex) => {
        // Get the checked state of the institution's checkbox.
        const institutionCheckboxIsChecked = this.state.checked.institutions[institution.id];

        // Create a checkbox for the institution.
        checkboxes.institutions.push(<Checkbox checked={institutionCheckboxIsChecked} key={institution.id} label={institution.name} onChange={() => { this.handleInstitutionCheckboxChange(institution.id, institutionIndex); }} />);

        if (institutionCheckboxIsChecked) institution.campuses.forEach((campus, campusIndex) => {
          // Get the checked state of the campus's checkbox.
          const campusCheckboxIsChecked = this.state.checked.campuses[campus.id];

          // Create a checkbox for the campus.
          checkboxes.campuses.push(<Checkbox checked={this.state.checked.campuses[campus.id]} key={campus.id} label={campus.name} onChange={() => { this.handleCampusCheckboxChange(campus.id, institutionIndex, campusIndex); }} />);

          if (campusCheckboxIsChecked) campus.libraries.forEach(library => {
            checkboxes.libraries.push(<Checkbox checked={this.state.checked.libraries[library.id]} key={library.id} label={library.name} onChange={() => {this.handleLibraryCheckboxChange(library.id); }} />);
          });
        });
      });

      return (
        <AccordionSet>
          <Accordion label="Institutions" separator={false}>
            {checkboxes.institutions}
          </Accordion>
          {checkboxes.campuses.length !== 0 ? <Accordion label="Campuses" separator={false}>
            {checkboxes.campuses}
          </Accordion> : null}
          {checkboxes.libraries.length !== 0 ? <Accordion label="Libraries" separator={false}>
            {checkboxes.libraries}
          </Accordion> : null}
        </AccordionSet>
      );
    }).bind(this)() : null;

    return (
      <Paneset>
        <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
          {locationUnitsAccordionSet}
        </Pane>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />} />
      </Paneset>
    );
  }
}

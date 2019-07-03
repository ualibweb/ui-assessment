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
  initializes the checked state of the institution's campuses'
  checkboxes. */
  handleInstitutionCheckboxChange(id, i) {
    this.setState(state => {
      const checkboxWasChecked = !state.checked.institutions[id];
      const checkedCampuses = {...state.checked.campuses};

      this.props.resources.locationUnits.records[i].campuses.forEach(campus => {
        if (checkboxWasChecked) checkedCampuses[campus.id] = false;
        else delete checkedCampuses[campus.id];
      });

      return {
        checked: {
          ...state.checked,
          institutions: {
            ...state.checked.institutions,
            [id]: checkboxWasChecked
          },
          campuses: checkedCampuses
        }
      }
    });
  }

  // Toggles the checked state of the campus's checkbox.
  handleCampusCheckboxChange(id) {
    this.setState(state => ({
      checked: {
        ...state.checked,
        campuses: {
          ...state.checked.campuses,
          [id]: !state.checked.campuses[id]
        }
      }
    }));
  }

  render() {
    const locationUnits = this.props.resources.locationUnits;
    const locationUnitsAccordionSet = this.state.locationUnitsLoadedAt !== null ? (function() {
      const institutions = locationUnits.records;
      const checkedInstitutions = institutions.filter(institution => this.state.checked.institutions[institution.id]);
      const campusCheckboxes = [];

      checkedInstitutions.forEach(institution => {
        institution.campuses.forEach(campus => { campusCheckboxes.push(<Checkbox checked={this.state.checked.campuses[campus.id]} key={campus.id} label={campus.name} onChange={() => { this.handleCampusCheckboxChange(campus.id); }} />); });
      });

      return (
        <AccordionSet>
          <Accordion label="Institutions" separator={false}>
            {institutions.map((institution, i) => <Checkbox checked={this.state.checked.institutions[institution.id]} key={institution.id} label={institution.name} onChange={() => { this.handleInstitutionCheckboxChange(institution.id, i); }} />)}
          </Accordion>
          {campusCheckboxes.length !== 0 ? <Accordion label="Campuses" separator={false}>
            {campusCheckboxes}
          </Accordion> : null}
        </AccordionSet>
      );
    }).bind(this)() : null;

    return (
      <Paneset>
        <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
          <AccordionSet>
            {locationUnitsAccordionSet}
          </AccordionSet>
        </Pane>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />} />
      </Paneset>
    );
  }
}

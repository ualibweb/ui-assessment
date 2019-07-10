import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Paneset, Pane } from '@folio/stripes/components';
import GlobalVariablesPane from '../components/global-variables-pane';

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

  // Initializes state and binds event handlers.
  constructor(props) {
    super(props);

    this.state = {
      locationUnitsLoadedAt: null,
      globalVariables: {
        isChecked: {},
        titlesShouldBeUsed: true
      }
    };

    this.handleGlobalVariablesChange = this.handleGlobalVariablesChange.bind(this);
  }

  /* Initializes the checked state of the institutions. */
  static getDerivedStateFromProps(props, state) {
    const locationUnits = props.resources.locationUnits;
    const locationUnitsLoadedAt = locationUnits !== null && locationUnits.hasLoaded ? locationUnits.loadedAt.getTime() : null;

    if (locationUnitsLoadedAt !== state.locationUnitsLoadedAt) {
      const isChecked = {};
      locationUnits.records.forEach(institution => { isChecked[institution.id] = false; });
      return {
        locationUnitsLoadedAt,
        globalVariables: {
          ...state.globalVariables,
          isChecked
        }
      };
    } else return null;
  }

  // Updates the global variables.
  handleGlobalVariablesChange(globalVariables) {
    this.setState({globalVariables});
  }

  render() {
    const locationUnits = this.props.resources.locationUnits;
    const locationUnitsHaveLoaded = locationUnits !== null && locationUnits.hasLoaded;

    return (
      <Paneset>
        {locationUnitsHaveLoaded && <GlobalVariablesPane globalVariables={this.state.globalVariables} institutions={locationUnits.records} onGlobalVariablesChange={this.handleGlobalVariablesChange} />}
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />} />
      </Paneset>
    );
  }
}

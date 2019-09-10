import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Switch, Route } from 'react-router-dom';
import { Paneset, Pane, NavList, NavListItem } from '@folio/stripes/components';
import GlobalVariablesPane from '../components/global-variables-pane';
import CollectionsByLCCNumberReport from './collections-by-lcc-number-report';
import CollectionsByMaterialTypeReport from './collections-by-material-type-report';

export default class Application extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      path: PropTypes.string.isRequired
    }).isRequired,
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

  // Initializes state, binds an event handler, and connects a component.
  constructor(props) {
    super(props);

    const dateFormat = 'MM/DD/YYYY';

    this.state = {
      locationUnitsLoadedAt: null,
      globalVariables: {
        isChecked: {},
        titlesShouldBeUsed: true,
        from: moment().subtract(30, 'days').format(dateFormat),
        to: moment().format(dateFormat)
      }
    };

    this.handleGlobalVariablesChange = this.handleGlobalVariablesChange.bind(this);
    this.connectedCollectionsByLCCNumberReport = this.props.stripes.connect(CollectionsByLCCNumberReport);
    this.connectedCollectionsByMaterialTypeReport = this.props.stripes.connect(CollectionsByMaterialTypeReport);
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
    const checkedLibraries = [];

    // Populate checkedLibraries.
    if (locationUnitsHaveLoaded) {
      locationUnits.records.forEach(institution => {
        institution.campuses.forEach(campus => {
          campus.libraries.forEach(library => {
            if (this.state.globalVariables.isChecked[library.id]) {
              checkedLibraries.push(library.id);
            }
          });
        });
      });
    }

    return (
      <Paneset>
        {locationUnitsHaveLoaded && <GlobalVariablesPane globalVariables={this.state.globalVariables} institutions={locationUnits.records} onGlobalVariablesChange={this.handleGlobalVariablesChange} />}
        {checkedLibraries.length !== 0 && <Pane defaultWidth="15%" fluidContentWidth paneTitle="Reports">
          <NavList>
            <NavListItem to={`${this.props.match.path}/collections-by-lcc-number`}>Collections by LCC Number</NavListItem>
            <NavListItem to={`${this.props.match.path}/collections-by-material-type`}>Collections by Material Type</NavListItem>
          </NavList>
        </Pane>}
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />}>
          {checkedLibraries.length !== 0 && <Switch>
            <Route exact path={`${this.props.match.path}/collections-by-lcc-number`} render={() => <this.connectedCollectionsByLCCNumberReport libraries={checkedLibraries} titlesShouldBeUsed={this.state.globalVariables.titlesShouldBeUsed} />} />
            <Route exact path={`${this.props.match.path}/collections-by-material-type`} render={() => <this.connectedCollectionsByMaterialTypeReport libraries={checkedLibraries} titlesShouldBeUsed={this.state.globalVariables.titlesShouldBeUsed} />} />
          </Switch>}
        </Pane>
      </Paneset>
    );
  }
}

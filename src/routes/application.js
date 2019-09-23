import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Switch, Route } from 'react-router-dom';
import { Paneset, Pane, NavList, NavListItem } from '@folio/stripes/components';
import GlobalVariablesPane from '../components/global-variables-pane';
import CollectionsByLCCNumberReport from './collections-by-lcc-number-report';
import CollectionsByMaterialTypeReport from './collections-by-material-type-report';
import CirculationByLCCNumberReport from './circulation-by-lcc-number-report';
import CirculationByMaterialTypeReport from './circulation-by-material-type-report';
import CirculationByPatronGroupReport from './circulation-by-patron-group-report';
import reportTypes from '../json/report-types';
import collectionTypes from '../json/collection-types.json';
import circulationTypes from '../json/circulation-types.json';

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

  constructor(props) {
    super(props);

    const toMoment = moment();

    this.dateFormat = 'YYYY-MM-DD';
    this.state = {
      locationUnitsLoadedAt: null,
      locationUnitIsSelected: {},
      reportType: reportTypes.collections,
      collectionTypeIsSelected: {},
      circulationTypeIsSelected: {},
      from: toMoment.subtract(30, 'days').format(this.dateFormat),
      to: toMoment.format(this.dateFormat)
    };
    this.reports = {
      [reportTypes.collections]: [
        {
          endpoint: 'collections-by-lcc-number',
          title: 'Collections by LCC Number',
          component: CollectionsByLCCNumberReport
        },
        {
          endpoint: 'collections-by-material-type',
          title: 'Collections by Material Type',
          component: CollectionsByMaterialTypeReport
        }
      ],
      [reportTypes.circulation]: [
        {
          endpoint: 'circulation-by-lcc-number',
          title: 'Circulation by LCC Number',
          component: CirculationByLCCNumberReport
        },
        {
          endpoint: 'circulation-by-material-type',
          title: 'Circulation by Material Type',
          component: CirculationByMaterialTypeReport
        },
        {
          endpoint: 'circulation-by-patron-group',
          title: 'Circulation by Patron Group',
          component: CirculationByPatronGroupReport
        }
      ]
    };
    this.handleGlobalVariableChange = this.handleGlobalVariableChange.bind(this);

    Object.keys(collectionTypes).forEach(collectionTypeKey => {
      this.state.collectionTypeIsSelected[collectionTypeKey] = false;
    });

    Object.keys(circulationTypes).forEach(circulationTypeKey => {
      this.state.circulationTypeIsSelected[circulationTypeKey] = false;
    });

    Object.values(this.reports).forEach(value => {
      value.forEach(report => {
        report.component = this.props.stripes.connect(report.component);
      });
    });
  }

  static getDerivedStateFromProps(props, state) {
    const locationUnits = props.resources.locationUnits;
    const locationUnitsLoadedAt = locationUnits !== null && locationUnits.hasLoaded ? locationUnits.loadedAt.getTime() : null;

    if (locationUnitsLoadedAt !== state.locationUnitsLoadedAt) {
      const locationUnitIsSelected = {};

      locationUnits.records.forEach(institution => {
        locationUnitIsSelected[institution.id] = false;
      });

      return {
        locationUnitsLoadedAt,
        locationUnitIsSelected
      };
    } else {
      return null;
    }
  }

  handleGlobalVariableChange(name, value) {
    this.setState({
      [name]: value
    });
  }

  render() {
    const locationUnitsResource = this.props.resources.locationUnits;
    const locationUnitsHaveLoaded = locationUnitsResource !== null && locationUnitsResource.hasLoaded;
    const selectedLibraries = [];
    const selectedTypes = {
      [reportTypes.collections]: [],
      [reportTypes.circulation]: []
    };

    let locationUnits = null;
    let reportsPane = null;
    let reportsSwitch = null;

    // Populate selectedLibraryIds.
    if (locationUnitsHaveLoaded) {
      locationUnits = locationUnitsResource.records;

      locationUnits.forEach(institution => {
        institution.campuses.forEach(campus => {
          campus.libraries.forEach(library => {
            if (this.state.locationUnitIsSelected[library.id]) {
              selectedLibraries.push(library.id);
            }
          });
        });
      });
    }

    // Populate selectedTypes[reportTypes.collections].
    Object.keys(collectionTypes).forEach(key => {
      if (this.state.collectionTypeIsSelected[key] === true) {
        selectedTypes[reportTypes.collections].push(key);
      }
    });

    // Populate selectedTypes[reportTypes.circulation].
    Object.keys(circulationTypes).forEach(key => {
      if (this.state.circulationTypeIsSelected[key] === true) {
        selectedTypes[reportTypes.circulation].push(key);
      }
    });


    if (selectedLibraries.length > 0) {
      reportsPane = (
        <Pane defaultWidth="15%" fluidContentWidth paneTitle="Reports">
          <NavList>
            {this.reports[this.state.reportType].map((report, i) => <NavListItem to={`${this.props.match.path}/${report.endpoint}`} key={i}>{report.title}</NavListItem>)}
          </NavList>
        </Pane>
      );
      reportsSwitch = (
        <Switch>
          {this.reports[this.state.reportType].map((report, i) => <Route exact path={`${this.props.match.path}/${report.endpoint}`} render={() => <report.component libraries={selectedLibraries} types={selectedTypes[this.state.reportType]} from={this.state.from} to={this.state.to} />} key={i} />)}
        </Switch>
      );
    }

    return (
      <Paneset>
        <GlobalVariablesPane institutions={locationUnits} locationUnitIsSelected={this.state.locationUnitIsSelected} reportType={this.state.reportType} collectionTypeIsSelected={this.state.collectionTypeIsSelected} circulationTypeIsSelected={this.state.circulationTypeIsSelected} from={this.state.from} to={this.state.to} dateFormat={this.dateFormat} onGlobalVariableChange={this.handleGlobalVariableChange} />
        {reportsPane}
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />}>
          {reportsSwitch}
        </Pane>
      </Paneset>
    );
  }
};

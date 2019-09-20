import React from 'react';
import PropTypes from 'prop-types';
import { Pane, Datepicker } from '@folio/stripes/components';
import LocationUnitsAccordionSet from './location-units-accordion-set';
import ReportTypesSegmentedControl from './report-types-segmented-control';
import TypesAccordion from './types-accordion';
import arrayify from '../functions/arrayify';
import reportTypes from '../json/report-types.json';
import _collectionTypes from '../json/collection-types.json';
import _circulationTypes from '../json/circulation-types.json';

const collectionTypes = arrayify(_collectionTypes, 'key');
const circulationTypes = arrayify(_circulationTypes, 'key');

export default class GlobalVariablesPane extends React.Component {
  static propTypes = {
    institutions: PropTypes.array,
    locationUnitIsSelected: PropTypes.object.isRequired,
    reportType: PropTypes.number.isRequired,
    collectionTypeIsSelected: PropTypes.object.isRequired,
    circulationTypeIsSelected: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    dateFormat: PropTypes.string.isRequired,
    onGlobalVariableChange: PropTypes.func.isRequired
  };

  getEventHandler(name, value) {
    function handleEvent(value) {
      this.props.onGlobalVariableChange(name, value);
    };

    return handleEvent.bind(this);
  }

  getDatepickerEventHandler(name) {
    function handleDatepickerEvent(event) {
      this.props.onGlobalVariableChange(name, event.target.value);
    }

    return handleDatepickerEvent.bind(this);
  }

  render() {
    return (
      <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
        {this.props.institutions !== null && <LocationUnitsAccordionSet institutions={this.props.institutions} isSelected={this.props.locationUnitIsSelected} onChange={this.getEventHandler('locationUnitIsSelected')} />}
        <ReportTypesSegmentedControl value={this.props.reportType} onChange={this.getEventHandler('reportType')} />
        {this.props.reportType === reportTypes.collections ? <TypesAccordion label="Collection Types" types={collectionTypes} isSelected={this.props.collectionTypeIsSelected} onChange={this.getEventHandler('collectionTypeIsSelected')} /> : <React.Fragment>
          <TypesAccordion label="Circulation Types" types={circulationTypes} isSelected={this.props.circulationTypeIsSelected} onChange={this.getEventHandler('circulationTypeIsSelected')} />
          <Datepicker label="From" value={this.props.from} dateFormat={this.props.dateFormat} onChange={this.getDatepickerEventHandler('from')} />
          <Datepicker label="To" value={this.props.to} dateFormat={this.props.dateFormat} onChange={this.getDatepickerEventHandler('to')} />
        </React.Fragment>}
      </Pane>
    );
  }
};

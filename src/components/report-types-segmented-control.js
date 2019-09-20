import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button } from '@folio/stripes/components';
import reportTypes from '../json/report-types.json';

export default class ReportTypesSegmentedControl extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  };

  getButtonStyle(reportType) {
    return reportType === this.props.value ? "primary" : "default";
  }

  getClickHandler(reportType) {
    function handleClick() {
      this.props.onChange(reportType);
    }

    return handleClick.bind(this);
  }

  render() {
    return (
      <ButtonGroup>
        <Button buttonStyle={this.getButtonStyle(reportTypes.collections)} onClick={this.getClickHandler(reportTypes.collections)}>Collections</Button>
        <Button buttonStyle={this.getButtonStyle(reportTypes.circulation)} onClick={this.getClickHandler(reportTypes.circulation)}>Circulation</Button>
      </ButtonGroup>
    );
  }
}

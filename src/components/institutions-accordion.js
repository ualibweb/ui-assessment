import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Checkbox } from '@folio/stripes/components';

export default class InstitutionsAccordion extends React.Component {
  static propTypes = {
    checked: PropTypes.arrayOf(PropTypes.bool).isRequired,
    institutions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    onCheckedChange: PropTypes.func.isRequired
  };

  handleAllCheckboxChange(allChecked) {
    this.props.onCheckedChange(this.props.checked.map(() => !allChecked));
  }

  handleInstitutionCheckboxChange(i) {
    this.props.onCheckedChange(this.props.checked.map((value, j) => j === i ? !value : value));
  }

  render() {
    const checked = this.props.checked;
    const allChecked = (() => {
      for (let i = 0; i < checked.length; ++i) {
        if (checked[i] === false) {
          return false;
        }
      }

      return true;
    })();

    return (
      <Accordion label="Institutions" separator={false}>
        <Checkbox checked={allChecked} label="All" onChange={() => { this.handleAllCheckboxChange(allChecked); }} />
        {this.props.institutions.map((institution, i) => <Checkbox checked={checked[i]} key={institution.id} label={institution.name} onChange={() => { this.handleInstitutionCheckboxChange(i); }} />)}
      </Accordion>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Checkbox } from '@folio/stripes/components';

export default class TypesAccordion extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.exact({
      key: PropTypes.string,
      text: PropTypes.string
    })).isRequired,
    isSelected: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  getCheckHandler(key) {
    function handleCheck() {
      this.props.onChange({
        ...this.props.isSelected,
        [key]: !this.props.isSelected[key]
      });
    }

    return handleCheck.bind(this);
  }

  render() {
    const checkboxes = this.props.types.map(type => <Checkbox checked={this.props.isSelected[type.key]} key={type.key} label={type.text} onChange={this.getCheckHandler(type.key)} />);

    return (
      <Accordion label={this.props.label} separator={false}>
        {checkboxes}
      </Accordion>
    );
  }
};

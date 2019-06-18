import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router-dom/Link';
import { Pane, Paneset } from '@folio/stripes/components';

export default class Application extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  render() {
    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />} />
      </Paneset>
    );
  }
}

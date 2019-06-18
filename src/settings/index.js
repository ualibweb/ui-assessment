import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Settings } from '@folio/stripes/smart-components';
import GeneralSettings from './general-settings';

export default class AssessmentSettings extends React.Component {
  pages = [
    {
      route: 'general',
      label: <FormattedMessage id="ui-assessment.settings.general" />,
      component: GeneralSettings
    }
  ];

  render() {
  return <Settings {...this.props} pages={this.pages} paneTitle={<FormattedMessage id="ui-assessment.meta.title" />} />;
  }
}

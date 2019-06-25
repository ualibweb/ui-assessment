import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Paneset, Pane, AccordionSet } from '@folio/stripes/components';
import InstitutionsAccordion from '../components/institutions-accordion';

export default class Application extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired
    }).isRequired,
    resources: PropTypes.shape({
      institutions: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        loadedAt: PropTypes.instanceOf(Date),
        records: PropTypes.array.isRequired
      })
    }).isRequired
  };

  static manifest = {
    institutions: {
      type: 'okapi',
      path: 'assessment/location-units/institutions'
    }
  }

  constructor(props) {
    super(props);

    // Set initial state.
    this.state = {
      institutions: {
        loadedAt: null
      }
    };

    // Bind event handler.
    this.onInstitutionsCheckedChange = this.onInstitutionsCheckedChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const institutions = props.resources.institutions;
    const institutionsLoadedAt = institutions !== null && institutions.hasLoaded ? institutions.loadedAt.getTime() : null;

    return institutionsLoadedAt !== state.institutions.loadedAt ? {
      institutions: {
        loadedAt: institutionsLoadedAt,
        checked: institutions.records.map(() => false)
      }
    } : null;
  }

  onInstitutionsCheckedChange(checked) {
    this.setState(state => ({
      institutions: {
        ...state.institutions,
        checked
      }
    }));
  }

  render() {
    return (
      <Paneset>
        <Pane defaultWidth="15%" fluidContentWidth paneTitle="Global Variables">
          <AccordionSet>
            {this.state.institutions.loadedAt !== null && <InstitutionsAccordion checked={this.state.institutions.checked} institutions={this.props.resources.institutions.records} onCheckedChange={this.onInstitutionsCheckedChange} />}
          </AccordionSet>
        </Pane>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={<FormattedMessage id="ui-assessment.meta.title" />} />
      </Paneset>
    );
  }
}



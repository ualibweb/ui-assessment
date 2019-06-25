import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Application from './routes/application';
import Settings from './settings';

export default class Assessment extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    // Connect component.
    this.connectedApplication = this.props.stripes.connect(Application);
  }

  render() {
    return this.props.showSettings ? <Settings {...this.props} /> : (
      <Switch>
        <Route exact path={this.props.match.path} render={() => <this.connectedApplication stripes={this.props.stripes} />} />
      </Switch>
    );
  }
}

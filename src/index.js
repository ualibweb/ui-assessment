import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Application from './routes/application';
import Settings from './settings';

export default class Assessment extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool
  };

  render() {
    const {
      showSettings,
      match: {
        path
      }
    } = this.props;

    if (showSettings) {
      return <Settings {...this.props} />;
    } else {
      return (
        <Switch>
          <Route exact component={Application} path={path} />
        </Switch>
      );
    }
  }
}

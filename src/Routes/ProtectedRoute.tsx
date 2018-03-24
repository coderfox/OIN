import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import SessionState from '../lib/state/Session';

@inject('session')
@observer
export default class ProtectedRoute extends React.Component<{
  session?: SessionState
}> {
  render() {
    const { session, ...restProps } = this.props;
    if (session!.authenticated) { return <Route {...restProps} />; }
    return <Redirect to="/login" />;
  }
}
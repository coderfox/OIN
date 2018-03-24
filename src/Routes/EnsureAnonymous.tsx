import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import SessionState from '../lib/state/Session';

@inject('session')
@observer
export default class EnsureAnonymous extends React.Component<{
  session?: SessionState,
  // tslint:disable-next-line:no-any
} & any> {
  render() {
    const { session, ...restProps } = this.props;
    if (session!.authenticated) { return <Redirect to="/dashboard" />; }
    return <div />;
  }
}
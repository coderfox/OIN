import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';

import * as Forms from '../Forms';

interface Props {
  session?: SessionState;
}
interface States {
}

@inject('session')
@observer
class Dashboard extends React.Component<Props, States> {
  render() {
    return (
      <p>{this.props.session!.token}</p>
    );
  }
}

export default Dashboard;

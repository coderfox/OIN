import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
const ColorHash = require('color-hash');
const color = new ColorHash();
import { RouterStore } from 'mobx-react-router';

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, Icon, Button } from 'semantic-ui-react';

interface Props {
  routing?: RouterStore;
  session?: SessionState;
}
interface States {
}

@inject('routing', 'session')
@observer
class User extends React.Component<Props, States> {
  logout = async () => {
    this.props.session!.removeToken();
    this.props.routing!.push('/login');
  }
  render() {
    const session = this.props.session!.session!;
    return (
      <Card>
        <Card.Content>
          <Card.Header>{session.user.email}</Card.Header>
          <Card.Description><Icon name="user" style={{ color: color.hex(session.user.id) }} /></Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Button onClick={this.logout}>登出</Button>
        </Card.Content>
      </Card>
    );
  }
}

export default User;

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

import { Card, Icon, Avatar, Button, message } from 'antd';
const { Meta } = Card;

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
      <Card title="用户信息">
        <Meta
          avatar={<Avatar
            style={{ backgroundColor: color.hex(session.user.id) }}
            icon="fork"
          />}
          title={session.user.email}
        />
        <div>
          <Button onClick={this.logout}>登出</Button>
        </div>
      </Card>
    );
  }
}

export default User;

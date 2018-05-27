import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment, InputOnChangeData } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import EnsureAnonymous from '../Routes/EnsureAnonymous';
import * as Forms from '../Forms';

import ApiClient from '../lib/client';
import { RouterStore } from 'mobx-react-router';
import SessionState from '../lib/SessionStore';

interface Props {
}
interface States {
}

class LoginPage extends React.Component<Props, States> {
  render() {
    return (
      <Grid
        textAlign="center"
        style={{ height: '100%' }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" textAlign="center">
            登入<EnsureAnonymous />
          </Header>
          <Forms.Login />
          <Message>
            没有账户？<Link to="/reg">马上注册</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default LoginPage;

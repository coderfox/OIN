import * as React from 'react';
import { inject, observer } from 'mobx-react';

import {
  Button,
  Form,
  Message,
  Segment,
  InputOnChangeData,
} from 'semantic-ui-react';
import SessionState from '../lib/SessionStore';

interface Props {
  session?: SessionState;
}
interface States {
  email: string;
  password: string;
  loading: boolean;
  error: boolean;
  message: string;
  token?: string;
}

@inject('session')
@observer
class LoginForm extends React.Component<Props, States> {
  state: States = {
    email: '',
    password: '',
    loading: false,
    error: false,
    message: '',
  };

  handleChange = (
    _: React.SyntheticEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) =>
    // tslint:disable-next-line:no-any
    this.setState({ [data.name]: data.value } as any)
  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const { email, password } = this.state;
    this.setState({ loading: true });
    e.preventDefault();
    try {
      const token = await this.props.session!.login(email, password);
      this.setState({ token });
    } catch (ex) {
      this.setState({
        error: true,
        message:
          (ex.response && ex.response.data && ex.response.data.code) ||
          ex.message,
      });
    }
    this.setState({ loading: false });
  }

  render() {
    const { email, password, loading, error, message, token } = this.state;
    return (
      <Form
        size="large"
        onSubmit={this.handleSubmit}
        loading={loading}
        error={error}
        success={token !== undefined}
      >
        <Segment raised>
          <Message success>
            <Message.Header>登入成功</Message.Header>
            <p>您的 token：{token}，将为您导向您的主页。</p>
          </Message>
          <Message error header="登入失败" content={message} />
          <Form.Input
            fluid
            icon="mail"
            iconPosition="left"
            placeholder="邮箱"
            type="email"
            name="email"
            value={email}
            onChange={this.handleChange}
          />
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            placeholder="密码"
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
          />
          <Button primary fluid size="large">
            登入
          </Button>
        </Segment>
      </Form>
    );
  }
}

export default LoginForm;

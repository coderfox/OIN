import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment, InputOnChangeData } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import EnsureAnonymous from '../Routes/EnsureAnonymous';

import ApiClient from '../lib/client';
import { RouterStore } from 'mobx-react-router';
import SessionState from '../lib/state/Session';
import { User } from '../lib/api_interfaces';

interface Props {
  routing?: RouterStore;
  session?: SessionState;
}
interface States {
  nickname: string;
  email: string;
  password: string;
  password_confirm: string;
  loading: boolean;
  error: boolean;
  message: string;
  user?: User;
}

@inject('routing', 'session')
@observer
class RegForm extends React.Component<Props, States> {
  state: States = {
    nickname: '',
    email: '',
    password: '',
    password_confirm: '',
    loading: false,
    error: false,
    message: ''
  };

  handleChange = (e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) =>
    this.setState({ [data.name]: data.value })
  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const { email, password, password_confirm, nickname } = this.state;
    this.setState({ loading: true, error: false });
    e.preventDefault();
    try {
      if (password !== password_confirm) {
        throw new Error('两次输入的密码不一致');
      }
      const user = await ApiClient.register(email, password, nickname);
      this.setState({ user });
      setTimeout(() => this.props.routing!.push('/login'), 1000);
    } catch (ex) {
      this.setState({
        error: true,
        message: (ex.response && ex.response.data && ex.response.data.code) || ex.message
      });
    }
    this.setState({ loading: false });
  }
  render() {
    const {
      nickname,
      email,
      password,
      password_confirm,
      loading,
      error,
      message,
      user
    } = this.state;
    return (
      <Form
        size="large"
        onSubmit={this.handleSubmit}
        loading={loading}
        error={error}
        success={user !== undefined}
      >
        <Segment raised>
          <Message success>
            <Message.Header>注册成功</Message.Header>
            <p>您的用户代码：{user && user.id}，3 秒后将为您导向登入页面。</p>
          </Message>
          <Message
            error
            header="注册失败"
            content={message}
          />
          <Form.Input
            fluid
            icon="user"
            iconPosition="left"
            placeholder="昵称"
            type="text"
            name="nickname"
            value={nickname}
            onChange={this.handleChange}
          />
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
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            placeholder="确认密码"
            type="password"
            name="password_confirm"
            value={password_confirm}
            onChange={this.handleChange}
          />
          <Button primary fluid size="large">注册</Button>
        </Segment>
      </Form>
    );
  }
}

export default RegForm;

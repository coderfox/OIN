import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
const ColorHash = require('color-hash');
const color = new ColorHash();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, Icon, Avatar, Button, message } from 'antd';
const { Meta } = Card;

interface Props {
  session?: SessionState;
  id: string;
}
interface States {
  loading: boolean;
  message?: Interfaces.Message;
  service?: Interfaces.Service;
  subscription?: Interfaces.Subscription;
}

@inject('session')
@observer
class Message extends React.Component<Props, States> {
  state = {
    loading: false,
  } as States;
  async componentWillMount() {
    const msg = this.props.session!.messages.find(value => value.id === this.props.id);
    if (!msg) {
      message.warning(`数据不一致，M${this.props.id} 不存在！`);
      return;
    }
    const subscription = this.props.session!.subscriptions.find(value => value.id === msg.subscription);
    if (!subscription) {
      message.warning(`数据不一致，C${msg.subscription} 不存在！`);
      return;
    }
    const service = this.props.session!.services.find(value =>
      subscription !== undefined && value.id === subscription.service);
    if (!service) {
      message.warning(`数据不一致，S${subscription.service} 不存在！`);
      return;
    }
    this.setState({
      message: msg,
      service,
      subscription,
    });
  }

  markAsRead = async () => {
    await this.props.session!.markAsReaded(this.props.id);
    message.info('已标记为已读');
  }
  loadContent = async () => {
    if (this.state.message && this.state.message.content) { return; }
    const client = this.props.session!.client!;
    this.setState({ loading: true });
    try {
      const msg = await client.getMessage(this.props.id);
      this.setState({
        message: msg,
      });
    } catch (ex) {
      message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
    }
    this.setState({ loading: false });
  }

  render() {
    return (
      <Card
        loading={this.state.loading}
        title={this.state.message && this.state.message.title}
        extra={[
          (<Button icon="check" onClick={this.markAsRead} />),
          (<Button icon="plus-square" onClick={this.loadContent} />)
        ]}
      >
        <Meta
          avatar={<Avatar
            style={{ backgroundColor: color.hex(this.state.message && this.state.message.subscription) }}
            icon="fork"
          />}
          title={this.state.service && this.state.service.name}
          description={this.state.service && this.state.service.description}
        />
        <p>{this.state.subscription && this.state.subscription.id}</p>
        <p>{this.state.message && this.state.message.abstract}</p>
        <div>{this.state.message && this.state.message.content && this.state.message.content.data}</div>
      </Card>
    );
  }
}

export default Message;

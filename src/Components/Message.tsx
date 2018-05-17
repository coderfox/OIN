import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
import Timeage from 'timeago.js';
var timeago = Timeage();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, Icon, Avatar, Button, Collapse, Spin, message } from 'antd';
const { Meta } = Card;
const Panel = Collapse.Panel;

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
    this.setState({ loading: true });
    await this.props.session!.markAsReaded(this.props.id);
    this.setState({ loading: false });
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
        style={{ marginTop: '12px' }}
        loading={this.state.loading}
        type="inner"
        actions={[<Icon key="read" type="check" onClick={this.markAsRead} />]}
      >
        <Meta
          title={this.state.message && this.state.message.title}
          description={
            this.state.service && this.state.message &&
            `${this.state.subscription && this.state.subscription.id} (${this.state.service.title}) 于 ${
            timeago.format(this.state.message.created_at, 'zh_CN')}`
          }
          style={{ marginBottom: '12px' }}
        />
        {this.state.message && (!this.state.message.content ? (
          <p>{this.state.message.summary} <a onClick={this.loadContent}>More</a></p>
        ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: this.state.message.content || ''
              }}
            />
          ))}
      </Card>
    );
  }
}

export default Message;

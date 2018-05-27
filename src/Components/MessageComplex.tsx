import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
import Timeage from 'timeago.js';
var timeago = Timeage();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, CardProps, Segment, Header, Button, Dimmer, Loader, Message } from 'semantic-ui-react';

interface Props {
  session?: SessionState;
  id: string;
  onMarkedAsReaded?: () => void;
}
interface States {
  loading: boolean;
  message?: Interfaces.Message;
  service?: Interfaces.Service;
  subscription?: Interfaces.Subscription;
  error?: string;
}

@inject('session')
@observer
class MessageComplexComponent extends React.Component<Props, States> {
  state = {
    loading: false,
  } as States;

  async UNSAFE_componentWillMount() {
    await this.UNSAFE_componentWillReceiveProps(this.props);
  }
  // TODO: do not use componentWillReceiveProps
  async UNSAFE_componentWillReceiveProps(newProps: Props) {
    this.setState({
      loading: true,
      error: undefined,
    });
    try {
      const msg = await newProps.session!.client!.getMessage(newProps.id);
      if (!msg) {
        throw new Error(`数据不一致，M${newProps.id} 不存在！`);
      }
      const subscription = newProps.session!.subscriptions.find(value => value.id === msg.subscription);
      if (!subscription) {
        throw new Error(`数据不一致，C${msg.subscription} 不存在！`);
      }
      const service = newProps.session!.services.find(value =>
        subscription !== undefined && value.id === subscription.service);
      if (!service) {
        throw new Error(`数据不一致，S${subscription.service} 不存在！`);
      }
      this.setState({
        message: msg,
        service,
        subscription,
      });
    } catch (ex) {
      this.setState({
        error: (ex.response && ex.response.data && ex.response.data.code) || ex.message,
        message: undefined,
        subscription: undefined,
        service: undefined,
      });
    }
    this.setState({ loading: false });
  }

  markAsRead = async () => {
    this.setState({ loading: true });
    await this.props.session!.markAsReaded(this.props.id);
    this.setState({ loading: false });
    if (this.props.onMarkedAsReaded) { this.props.onMarkedAsReaded(); }
  }

  render() {
    return (
      <Segment>
        <Dimmer active={this.state.loading}>
          <Loader active={this.state.loading} />
        </Dimmer>
        <Message
          hidden={this.state.error === undefined}
          header="加载失败"
          content={this.state.error}
          error
        />
        {
          this.state.service && this.state.message && this.state.subscription &&
          <div>
            <Header size="huge">{this.state.message && this.state.message.title}</Header>
            <Button content="标为已读" onClick={this.markAsRead} />
            <Segment
              dangerouslySetInnerHTML={{
                __html: this.state.message && this.state.message.content || ''
              }}
            />
            <Card fluid>
              <Card.Content header="订阅信息" />
              <Card.Content>
                <Card.Header>{this.state.subscription.id}</Card.Header>
                <Card.Meta>{this.state.service.title}</Card.Meta>
                <Card.Description>于{timeago.format(this.state.message.created_at, 'zh_CN')}</Card.Description>
              </Card.Content>
            </Card>
          </div>
        }
      </Segment>
    );
  }
}

export default MessageComplexComponent;

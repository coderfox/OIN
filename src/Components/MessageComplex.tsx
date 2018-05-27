import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
import Timeage from 'timeago.js';
var timeago = Timeage();
const ColorHash = require('color-hash');
const color = new ColorHash();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, CardProps, Segment, Header, Button, Dimmer, Loader, Message, Label, Icon } from 'semantic-ui-react';

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
      const message = await newProps.session!.client!.getMessage(newProps.id);
      const subscription = await newProps.session!.client!.getSubscription(message.subscription);
      const service = await newProps.session!.client!.getService(subscription.service);
      this.setState({
        message,
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
            <p>
              <Label>
                <Icon name="clock" />{timeago.format(this.state.message.created_at, 'zh_CN')}
              </Label>
              <Label color="orange">
                订阅<Label.Detail>{this.state.subscription.name}</Label.Detail>
              </Label>
              <Label color="purple">
                服务<Label.Detail>{this.state.service.title}</Label.Detail>
              </Label>
            </p><p>
              <Button
                content="标为已读"
                color="olive"
                onClick={this.markAsRead}
                disabled={this.state.message.readed}
              />
            </p>
            <Segment
              dangerouslySetInnerHTML={{
                __html: this.state.message && this.state.message.content || ''
              }}
            />
            <Card fluid>
              <Card.Content header="订阅信息" />
              <Card.Content>
                <Card.Header>{this.state.subscription.name}</Card.Header>
                <Card.Meta>{this.state.subscription.id}</Card.Meta>
              </Card.Content>
              <Card.Content header="服务信息" />
              <Card.Content>
                <Card.Header>{this.state.service.title}</Card.Header>
                <Card.Meta>{this.state.service.id}</Card.Meta>
                <Card.Description>{this.state.service.description}</Card.Description>
              </Card.Content>
            </Card>
          </div>
        }
      </Segment>
    );
  }
}

export default MessageComplexComponent;

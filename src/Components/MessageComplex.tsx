import * as React from 'react';
import { inject, observer } from 'mobx-react';
import SessionState from '../lib/SessionStore';
import * as Interfaces from '../lib/api_interfaces';
import Timeage from 'timeago.js';
var timeago = Timeage();

import {
  Card,
  Header,
  Button,
  Dimmer,
  Loader,
  Message,
  Label,
  Icon,
} from 'semantic-ui-react';
import * as responsive from '../lib/responsive';

interface Props {
  session?: SessionState;
  id: string;
  onMarkedAsReaded?: (id: string) => void;
  onClose?: () => void;
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
      const message = await newProps.session!.getMessage(newProps.id);
      const subscription = await newProps.session!.getSubscription(
        message.subscription,
      );
      const service = await newProps.session!.getService(subscription.service);
      this.setState({
        message,
        service,
        subscription,
      });
    } catch (ex) {
      this.setState({
        error:
          (ex.response && ex.response.data && ex.response.data.code) ||
          ex.message,
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
    if (this.props.onMarkedAsReaded) {
      this.props.onMarkedAsReaded(this.props.id);
    }
  }
  onClose = async () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const { message, subscription, service, loading, error } = this.state;
    return (
      <Card fluid raised={responsive.isMobileOrTablet()}>
        <Card.Content>
          <Header size="huge">{message && message.title}</Header>
          <Dimmer active={loading} inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          <Message
            hidden={error === undefined}
            header="加载失败"
            content={error}
            error
          />
          <p>
            <Label>
              <Icon name="clock" />
              {message && timeago.format(message.created_at, 'zh_CN')}
            </Label>
            <Label color="orange">
              订阅<Label.Detail>
                {subscription && subscription.name}
              </Label.Detail>
            </Label>
            <Label color="purple">
              服务<Label.Detail>{service && service.name}</Label.Detail>
            </Label>
          </p>
          <p>
            <Button
              content="标为已读"
              color="olive"
              onClick={this.markAsRead}
              disabled={message && message.readed}
              size="small"
            />
            <Button content="关闭" onClick={this.onClose} size="small" />
          </p>
          <Card.Description
            className="sandra-message-content"
            dangerouslySetInnerHTML={{
              __html: message && message.content,
            }}
          />
        </Card.Content>
        <Card.Content>
          <Card.Header>订阅「{subscription && subscription.name}」</Card.Header>
          <Card.Meta>{subscription && subscription.id}</Card.Meta>
        </Card.Content>
        <Card.Content>
          <Card.Header>服务「{service && service.name}」</Card.Header>
          <Card.Meta>{service && service.id}</Card.Meta>
          <Card.Description>{service && service.description}</Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

export default MessageComplexComponent;

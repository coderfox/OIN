import * as React from 'react';
import { inject, observer } from 'mobx-react';
import SessionState from '../lib/SessionStore';
import * as Interfaces from '../lib/api_interfaces';
import Timeage from 'timeago.js';
var timeago = Timeage();

import * as Forms from '../Forms';

import {
  Card,
  Label,
  Form,
  Icon,
  Message,
  Dimmer,
  Loader,
} from 'semantic-ui-react';

interface Props {
  session?: SessionState;
  id: string;
}
interface States {
  subscription?: Interfaces.Subscription;
  service?: Interfaces.Service;
  error: string;
  update_subscription: boolean;
}

@inject('session')
@observer
class SubscriptionComponent extends React.Component<Props, States> {
  state: States = { error: '', update_subscription: false };

  async UNSAFE_componentWillMount() {
    await this.UNSAFE_componentWillReceiveProps(this.props);
  }
  async UNSAFE_componentWillReceiveProps(props: Props) {
    try {
      const subscription = await this.props.session!.getSubscription(props.id);
      this.setState({
        subscription,
        service: await this.props.session!.getService(subscription.service),
      });
    } catch (err) {
      this.setState({
        error:
          (err.response && err.response.data && err.response.data.code) ||
          err.message,
      });
    }
  }

  openUpdateForm = () => this.setState({ update_subscription: true });
  onUpdateFormFinish = () => {
    this.setState({ update_subscription: false });
    this.UNSAFE_componentWillMount();
  }

  render() {
    const { subscription, service } = this.state;
    const lastEvent = subscription && subscription.last_event;
    return (
      <Card fluid>
        {subscription && service ? (
          <Card.Content>
            <Card.Header>{subscription.name}</Card.Header>
            <Card.Meta>{subscription.id}</Card.Meta>
            <Card.Description>
              <p>
                {subscription.deleted && <Label color="red">已删除</Label>}
                <Label color="purple">
                  服务<Label.Detail>{service.name}</Label.Detail>
                </Label>
              </p>
              <p>
                <Label>
                  <Icon name="clock" />
                  {timeago.format(subscription.created_at, 'zh_CN')}
                  <Label.Detail>创建</Label.Detail>
                </Label>
                <Label>
                  <Icon name="clock" />
                  {timeago.format(subscription.updated_at, 'zh_CN')}
                  <Label.Detail>修改</Label.Detail>
                </Label>
              </p>
              <p>
                {lastEvent ? (
                  lastEvent.status ? (
                    <Label color="green">
                      <Icon name="checkmark" />
                      {timeago.format(lastEvent.time, 'zh_CN')}
                      <Label.Detail>成功</Label.Detail>
                    </Label>
                  ) : (
                    <Label color="red">
                      <Icon name="warning" />
                      失败
                      <Label.Detail>
                        于{timeago.format(lastEvent.time, 'zh_CN')}:{' '}
                        {lastEvent.message}{' '}
                      </Label.Detail>
                    </Label>
                  )
                ) : (
                  <Label color="olive">
                    <Icon name="info" />
                    暂未被执行过
                  </Label>
                )}
              </p>
              {this.state.update_subscription ? (
                <Forms.UpdateSubscription
                  id={subscription.id}
                  onFinish={this.onUpdateFormFinish}
                />
              ) : (
                <Form>
                  <p>配置信息</p>
                  <Form.TextArea
                    disabled
                    rows={2}
                    autoHeight
                    placeholder="空"
                    value={subscription.config}
                  />
                  <Form.Button
                    icon="edit"
                    content="编辑"
                    onClick={this.openUpdateForm}
                  />
                </Form>
              )}
            </Card.Description>
          </Card.Content>
        ) : (
          <React.Fragment>
            <Card.Content>
              <Message header="加载失败" error content={this.state.error} />
            </Card.Content>
            <Dimmer
              active={
                this.state.error === '' && this.state.service === undefined
              }
              inverted
            >
              <Loader />
            </Dimmer>
          </React.Fragment>
        )}
      </Card>
    );
  }
}

export default SubscriptionComponent;

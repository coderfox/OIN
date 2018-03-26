import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
const ColorHash = require('color-hash');
const color = new ColorHash();
import { RouterStore } from 'mobx-react-router';
import Timeage from 'timeago.js';
var timeago = Timeage();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, Icon, Avatar, Button, Collapse, Input, message } from 'antd';
const { Meta } = Card;
const { Panel } = Collapse;

interface Props {
  id: string;
  session?: SessionState;
}
interface States {
  subscription?: Interfaces.Subscription;
  service?: Interfaces.Service;
}

@inject('session')
@observer
class Subscription extends React.Component<Props, States> {
  componentWillMount() {
    const subscription = this.props.session!.subscriptions.find(value => value.id === this.props.id);
    if (!subscription) {
      message.warning(`数据不一致，C${this.props.id} 不存在！`);
      return;
    }
    const service = this.props.session!.services.find(value =>
      subscription !== undefined && value.id === subscription.service);
    if (!service) {
      message.warning(`数据不一致，S${subscription.service} 不存在！`);
      return;
    }
    this.setState({
      subscription,
      service,
    });
  }
  render() {
    const { subscription, service } = this.state;
    return (
      <Collapse bordered={false}>
        <Panel
          key={this.props.id}
          header={subscription && subscription.id}
        >
          <Meta
            avatar={<Avatar
              style={{ backgroundColor: color.hex(service && service.id) }}
              icon="fork"
            />}
            title={service && service.name}
            description={service && service.id}
          />
          <div style={{ marginTop: '12px', marginBottom: '12px' }} />
          <p>配置信息：</p>
          <p>
            <Input.TextArea
              placeholder="配置"
              autosize={{ minRows: 2 }}
            >
              {subscription && subscription.config}
            </Input.TextArea>
          </p>
          <p><Button type="primary" disabled={true}>修改</Button></p>
          <p>创建于：{subscription && timeago.format(subscription.created_at, 'zh_CN')}</p>
          <p>最近修改：{subscription && timeago.format(subscription.updated_at, 'zh_CN')}</p>
        </Panel>
      </Collapse>
    );
  }
}

export default Subscription;

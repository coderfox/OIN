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

import { Card, Icon, Avatar, Button, Collapse, Input, message, Form } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
const { Meta } = Card;
const { Panel } = Collapse;

const FORM_FIELDS = {
  CONFIG: 'config',
};

interface Props extends FormComponentProps {
  id: string;
  session?: SessionState;
}
interface States {
  subscription?: Interfaces.Subscription;
  service?: Interfaces.Service;
  loading: boolean;
}

@inject('session')
@observer
class Subscription extends React.Component<Props, States> {
  state = {
    loading: false,
  } as States;

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

  updateConfig: React.FormEventHandler<void> = async (e) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        this.props.session!.updateSubscriptionConfig(this.props.id, values[FORM_FIELDS.CONFIG])
          .then((data) => {
            this.setState({
              loading: false,
              subscription: this.props.session!.subscriptions.find(value => value.id === this.props.id)
            });
            message.info('配置修改成功');
          });
      }
    });
  }

  render() {
    const { subscription, service } = this.state;
    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldValue } = this.props.form;
    const fieldsError = getFieldsError();
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
            title={service && service.title}
            description={service && service.id}
          />
          <div style={{ marginTop: '12px', marginBottom: '12px' }} />
          <Form>
            <Form.Item label="配置信息">
              {getFieldDecorator(FORM_FIELDS.CONFIG, {
                initialValue: subscription && subscription.config
              })(
                <Input.TextArea
                  placeholder="配置"
                  autosize={{ minRows: 2 }}
                />
              )}
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                // htmlType="submit"
                disabled={
                  (Object.keys(fieldsError).some(field => fieldsError[field]) ||
                    !isFieldTouched(FORM_FIELDS.CONFIG)) &&
                  getFieldValue(FORM_FIELDS.CONFIG) === (this.state.subscription && this.state.subscription.config)
                }
                loading={this.state.loading}
                onClick={this.updateConfig}
              >修改
              </Button>
            </Form.Item>
          </Form>
          <p>创建于：{subscription && timeago.format(subscription.created_at, 'zh_CN')}</p>
          <p>最近修改：{subscription && timeago.format(subscription.updated_at, 'zh_CN')}</p>
        </Panel>
      </Collapse>
    );
  }
}
const DecoratedSubscription = Form.create()(Subscription);

export default DecoratedSubscription;

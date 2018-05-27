import * as React from 'react';
import { inject, observer } from 'mobx-react';

import {
  FormInputProps, FormTextAreaProps,
  Form, Message, Segment,
} from 'semantic-ui-react';

import SessionState from '../lib/SessionStore';
import { Subscription, Service } from '../lib/api_interfaces';

interface Props {
  session?: SessionState;
  id: string;
  onFinish?: () => void;
}
interface States {
  subscription?: Subscription;
  service?: Service;
  name: string;
  config: string;
  error: string;
  loading: boolean;
}

@inject('session')
@observer
class UpdateSubscriptionForm extends React.Component<Props, States> {
  state: States = {
    name: '',
    config: '',
    error: '',
    loading: false,
  };

  async UNSAFE_componentWillMount() {
    await this.UNSAFE_componentWillReceiveProps(this.props);
  }
  async UNSAFE_componentWillReceiveProps(props: Props) {
    try {
      const subscription = await this.props.session!.client!.getSubscription(props.id);
      this.setState({
        subscription,
        service: await this.props.session!.client!.getService(subscription.service),
        name: subscription.name,
        config: subscription.config,
      });
    } catch (err) {
      this.setState({ error: (err.response && err.response.data && err.response.data.code) || err.message });
    }
  }

  handleInputChange: FormInputProps['onChange'] = (_, data) =>
    this.setState({ [data.name]: data.value })
  handleTextAreaChange: FormTextAreaProps['onChange'] = (_, data) =>
    this.setState({ [data.name]: data.value })

  handleSubmit = async () => {
    this.setState({ loading: true });
    try {
      await this.props.session!.updateSubscription(this.props.id, this.state.config, this.state.name);
      this.emitFinish();
    } catch (err) {
      this.setState({ error: (err.response && err.response.data && err.response.data.code) || err.message });
    }
    this.setState({ loading: false });
  }
  handleDelete = async () => {
    this.setState({ loading: true });
    try {
      await this.props.session!.deleteSubscription(this.props.id);
      this.emitFinish();
    } catch (err) {
      this.setState({ error: (err.response && err.response.data && err.response.data.code) || err.message });
    }
    this.setState({ loading: false });
  }
  emitFinish = () => {
    if (this.props.onFinish) { this.props.onFinish(); }
  }
  render() {
    const { name, config } = this.state;
    return (
      <Form
        size="large"
        error={this.state.error !== ''}
        loading={this.state.loading}
      >
        <Message
          error
          header="操作失败"
          content={this.state.error}
        />
        <Form.Input
          fluid
          icon="tag"
          iconPosition="left"
          placeholder="名称"
          type="text"
          name="name"
          value={name}
          onChange={this.handleInputChange}
        />
        <Form.Dropdown
          fluid
          placeholder="服务"
          search
          selection
          options={this.props.session!.services.map(s => ({
            key: s.id,
            value: s.id,
            text: s.title,
            desc: s.description,
          }))}
          value={this.state.service && this.state.service.id}
          disabled
        />
        <Segment>
          {(this.state.service && this.state.service.description) || '未知服务'}
        </Segment>
        <Form.TextArea
          fluid
          icon="mail"
          placeholder="配置"
          name="config"
          value={config}
          onChange={this.handleTextAreaChange}
        />
        <Form.Group floated="right">
          <Form.Button
            positive
            icon="checkmark"
            content="确认"
            onClick={this.handleSubmit}
          />
          <Form.Button content="取消" onClick={this.emitFinish} />
          <Form.Button
            color="orange"
            icon="warning sign"
            content="删除"
            onClick={this.handleDelete}
          />
        </Form.Group>
      </Form>
    );
  }
}

export default UpdateSubscriptionForm;

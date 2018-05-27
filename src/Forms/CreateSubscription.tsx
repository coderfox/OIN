import * as React from 'react';
import { inject, observer } from 'mobx-react';

import {
  FormInputProps, FormTextAreaProps, FormDropdownProps,
  Form, Message, Segment,
} from 'semantic-ui-react';
import SessionState from '../lib/SessionStore';

interface Props {
  session?: SessionState;
  onFinish?: () => void;
}
interface States {
  name: string;
  service: string;
  config: string;
  service_desc: string;
  error: string;
  loading: boolean;
}

@inject('session')
@observer
class CreateSubscriptionForm extends React.Component<Props, States> {
  state: States = {
    name: '',
    service: '',
    config: '',
    service_desc: '',
    error: '',
    loading: false,
  };

  handleInputChange: FormInputProps['onChange'] = (_, data) =>
    this.setState({ [data.name]: data.value })
  handleTextAreaChange: FormTextAreaProps['onChange'] = (_, data) =>
    this.setState({ [data.name]: data.value })
  handleDropdownChange: FormDropdownProps['onChange'] = (_, data) => {
    const service = this.props.session!.services.find(s => s.id === data.value);
    this.setState({
      service: data.value as string,
      service_desc: (service && service.description) || '',
    });
  }
  handleSubmit = async () => {
    this.setState({ loading: true });
    try {
      const { name, service, config } = this.state;
      this.props.session!.subscriptions.push(
        await this.props.session!.client!.createSubscription(service, config, name)
      );
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
    const { name, service, config } = this.state;
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
          value={service}
          onChange={this.handleDropdownChange}
        />
        <Segment>
          {this.state.service_desc || '尚未选择服务'}
        </Segment>
        <Form.TextArea
          fluid
          icon="mail"
          placeholder="配置"
          name="config"
          value={config}
          onChange={this.handleTextAreaChange}
        />
        <Form.Group>
          <Form.Button
            positive
            icon="checkmark"
            content="确认"
            onClick={this.handleSubmit}
          />
          <Form.Button negative content="取消" onClick={this.emitFinish} />
        </Form.Group>
      </Form>
    );
  }
}

export default CreateSubscriptionForm;

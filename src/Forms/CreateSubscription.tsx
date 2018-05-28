import * as React from 'react';
import { inject, observer } from 'mobx-react';

import {
  FormInputProps, FormTextAreaProps, FormDropdownProps,
  Form, Message, Segment,
} from 'semantic-ui-react';
import SessionState from '../lib/SessionStore';
import { Service, Subscription } from '../lib/api_interfaces';

interface Props {
  session?: SessionState;
  onFinish?: (subscription?: Subscription) => void;
}
interface States {
  name: string;
  service: string;
  config: string;
  service_desc: string;
  error: string;
  loading: boolean;
  services: Service[];
  subscription?: Subscription;
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
    services: [],
  };

  async componentDidMount() {
    this.setState({
      services: await this.props.session!.client!.getServices(),
    });
  }

  handleInputChange: FormInputProps['onChange'] = (_, data) =>
    this.setState({ [data.name]: data.value })
  handleTextAreaChange: FormTextAreaProps['onChange'] = (_, data) =>
    this.setState({ [data.name]: data.value })
  handleDropdownChange: FormDropdownProps['onChange'] = async (_, data) => {
    const service = await this.props.session!.getService(data.value as string);
    if (!service) {
      this.setState({ error: '未找到对应的服务' });
    }
    this.setState({
      service: data.value as string,
      service_desc: (service && service.description) || '',
    });
  }
  handleSubmit = async () => {
    this.setState({ loading: true });
    try {
      const { name, service, config } = this.state;
      const subscription = await this.props.session!.client!.createSubscription(service, config, name);
      this.setState({ subscription });
      this.emitFinish();
    } catch (err) {
      this.setState({ error: (err.response && err.response.data && err.response.data.code) || err.message });
    }
    this.setState({ loading: false });
  }
  emitFinish = () => {
    if (this.props.onFinish) { this.props.onFinish(this.state.subscription); }
  }
  render() {
    const { name, service, config, services } = this.state;
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
          options={services.map(s => ({
            key: s.id,
            value: s.id,
            text: s.title,
            desc: s.description,
          }))}
          value={service}
          onChange={this.handleDropdownChange}
          loading={services.length === 0}
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

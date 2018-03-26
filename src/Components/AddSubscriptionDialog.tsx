import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
const ColorHash = require('color-hash');
const color = new ColorHash();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Form, Input, Button, Modal, AutoComplete, Spin, Card, Avatar, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';

export const FORM_FIELDS = {
  SERVICE_ID: 'serviceId',
  CONFIG: 'config'
};

interface OwnProps {
  session?: SessionState;
}
interface Props extends OwnProps, FormComponentProps {
}
interface States {
  visible: boolean;
  loading: boolean;
  refreshing: boolean;
  acdata: { value: string, text: string }[];
}

@inject('session')
@observer
class SubscriptionCreateForm extends React.Component<Props, States> {
  state = {
    visible: false,
    loading: false,
    refreshing: false,
    acdata: [],
  };
  static mapAc = (value: Interfaces.Service) => ({ value: value.id, text: value.name });

  showModal = async () => {
    this.setState({ visible: true, refreshing: true });
    await this.props.session!.retrieveServices(true);
    this.setState({ refreshing: false, acdata: this.props.session!.services.map(SubscriptionCreateForm.mapAc) });
  }
  closeModal = () => {
    this.props.form.resetFields();
    this.setState({ visible: false });
  }
  onCreate = () => {
    this.setState({ loading: true });
    this.props.form.validateFields((err, values) => {
      if (err) {
        this.setState({ loading: false });
        return;
      }
      this.props.session!.client!.createSubscription(values[FORM_FIELDS.SERVICE_ID], values[FORM_FIELDS.CONFIG])
        .then((sc) => {
          this.props.session!.subscriptions.push(sc);
          message.info('创建成功');
          this.closeModal();
        })
        .catch(ex => {
          message.error('创建失败 - '.concat(ex.message));
        })
        .then(() => this.setState({ loading: false }));
    });
  }
  onSearch = (search: string) => {
    const filtered = this.props.session!.services.filter((value) =>
      value.id.toLowerCase().startsWith(search.toLowerCase()) ||
      value.name.toLowerCase().startsWith(search.toLowerCase()));
    this.setState({
      acdata: (filtered.length === 0 ? this.props.session!.services : filtered).map(SubscriptionCreateForm.mapAc)
    });
  }

  render() {
    const { form } = this.props;
    const { visible } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const service = this.props.session!.services.find(value => value.id === getFieldValue(FORM_FIELDS.SERVICE_ID));
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>创建订阅</Button>
        <Modal
          visible={visible}
          title="创建订阅"
          okText="创建"
          onCancel={this.closeModal}
          onOk={this.onCreate}
          confirmLoading={this.state.loading}
        >
          <Spin spinning={this.state.refreshing}>
            <Form layout="vertical">
              <Form.Item label="服务 ID">
                {getFieldDecorator(FORM_FIELDS.SERVICE_ID, {
                  rules: [{ required: true, message: '请输入服务 ID' }],
                })(
                  <AutoComplete
                    dataSource={this.state.acdata}
                    onSearch={this.onSearch}
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Card>
                  <Card.Meta
                    avatar={<Avatar
                      style={{ backgroundColor: color.hex(service && service.id) }}
                      icon="fork"
                    />}
                    title={service && service.id}
                    description={service && service.description}
                  />
                </Card>
              </Form.Item>
              <Form.Item label="配置">
                {getFieldDecorator(FORM_FIELDS.CONFIG)(<Input.TextArea autosize={true} />)}
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      </div >
    );
  }
}

const DecoratedForm = Form.create()(SubscriptionCreateForm);

export default DecoratedForm;

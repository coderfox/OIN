import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Form, Input, Button, Modal, AutoComplete, message } from 'antd';
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
}

@inject('session')
@observer
class SubscriptionCreateForm extends React.Component<Props, States> {
  state = {
    visible: false,
    loading: false,
  };

  showModal = () =>
    this.setState({ visible: true })
  closeModal = () => {
    this.props.form.resetFields();
    this.setState({ visible: false });
  }
  onCreate = () => {
    this.setState({ loading: true });
    this.props.form.validateFields((err, values) => {
      if (err) {
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

  render() {
    const { form } = this.props;
    const { visible } = this.state;
    const { getFieldDecorator } = form;
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
          <Form layout="vertical">
            <Form.Item label="服务 ID">
              {getFieldDecorator(FORM_FIELDS.SERVICE_ID, {
                rules: [{ required: true, message: '请输入服务 ID' }],
              })(
                <AutoComplete
                  dataSource={
                    this.props.session!.services.map(value => ({ value: value.id, text: value.name }))}
                />
              )}
            </Form.Item>
            <Form.Item label="配置">
              {getFieldDecorator(FORM_FIELDS.CONFIG)(<Input.TextArea autosize={true} />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

const DecoratedForm = Form.create()(SubscriptionCreateForm);

export default DecoratedForm;

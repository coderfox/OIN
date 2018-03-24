import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { Form, Input, Icon, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';

import ApiClient from '../lib/client';
import { RouterStore } from 'mobx-react-router';

const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password'
};

interface Props extends FormComponentProps {
  routing?: RouterStore;
}
interface States {
  loading: boolean;
}

@inject('routing')
@observer
class RegForm extends React.Component<Props, States> {
  state = {
    loading: false
  };

  handleSubmit: React.FormEventHandler<void> = (e) => {
    const { push } = this.props.routing!;
    this.setState({ loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ApiClient.register(values[FORM_FIELDS.EMAIL], values[FORM_FIELDS.PASSWORD])
          .then((user) => {
            message.info(<p>注册成功，用户 id {user.id}。</p>);
            push('/login');
          })
          .catch((ex) => {
            message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
          })
          .then(() => this.setState({ loading: false }));
      }
    });
  }
  render() {
    const { getFieldDecorator, getFieldsError, isFieldTouched } = this.props.form;
    const fieldsError = getFieldsError();
    return (
      <Form onSubmit={this.handleSubmit} >
        <h2>注册</h2>
        <Form.Item>
          {getFieldDecorator(FORM_FIELDS.EMAIL, {
            rules: [
              { type: 'email', message: '请输入有效的邮箱地址' },
              { required: true, message: '请输入邮箱' }
            ],
          })(
            <Input
              type="email"
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="邮箱"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(FORM_FIELDS.PASSWORD, {
            rules: [{ required: true, message: '请输入密码' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="密码"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={
              Object.keys(fieldsError).some(field => fieldsError[field]) ||
              !(isFieldTouched(FORM_FIELDS.EMAIL) && isFieldTouched(FORM_FIELDS.PASSWORD))
            }
            loading={this.state.loading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
const DecoratedRegForm = Form.create()(RegForm);

export default DecoratedRegForm;
import * as React from 'react';
import { Form, Input, Icon, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';

const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password'
};

interface Props extends FormComponentProps {

}
interface States {
}

class LoginForm extends React.Component<Props, States> {
  handleSubmit: React.FormEventHandler<void> = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        message.warn(<p>此功能未实现，邮箱：{values[FORM_FIELDS.EMAIL]}、密码{values[FORM_FIELDS.PASSWORD]}！</p>);
      }
    });
  }
  render() {
    const { getFieldDecorator, getFieldsError, isFieldTouched } = this.props.form;
    const fieldsError = getFieldsError();
    return (
      <Form onSubmit={this.handleSubmit}>
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
          >
            登入
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
const DecoratedLoginForm = Form.create()(LoginForm);

export default DecoratedLoginForm;
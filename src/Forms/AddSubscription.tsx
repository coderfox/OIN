import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { Form, Input, Icon, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import { Link } from 'react-router-dom';

import ApiClient from '../lib/client';
import { RouterStore } from 'mobx-react-router';
import SessionState from '../lib/state/Session';

export const FORM_FIELDS = {
  SERVICE_ID: 'serviceId',
  CONFIG: 'config'
};

interface ValidationError {
  field: string;
  message: string;
}
interface Field {
  dirty: string;
  errors: ValidationError[];
  name: string;
  touched: boolean;
  validating: boolean;
  value: string;
}
export interface Fields {
  [index: string]: Field;
}

interface OwnProps {
  onChange: (fields: Fields) => void;
}
interface Props extends OwnProps, FormComponentProps {
}
interface States {
}

class LoginForm extends React.Component<Props, States> {
  render() {
    const { getFieldDecorator, getFieldsError, isFieldTouched } = this.props.form;
    const fieldsError = getFieldsError();
    return (
      <Form>
        <h2>添加订阅</h2>
        <Form.Item>
          {getFieldDecorator(FORM_FIELDS.SERVICE_ID, {
            rules: [
              { required: true, message: '请输入服务 ID' }
            ],
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="服务 ID"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(FORM_FIELDS.CONFIG, {
            rules: [],
          })(
            <Input.TextArea
              autosize={true}
              placeholder="配置"
            />
          )}
        </Form.Item>
      </Form>
    );
  }
}
const DecoratedLoginForm = Form.create<OwnProps>({
  onFieldsChange: (props, fields) => {
    // tslint:disable-next-line:no-any
    props.onChange(fields as any);
  }
})(LoginForm);

export default DecoratedLoginForm;
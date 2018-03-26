import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../../lib/state/Session';
import * as Interfaces from '../../lib/api_interfaces';

import * as Forms from '../../Forms';
import * as Components from '../../Components';
import { Row, Col, Button, Collapse, message } from 'antd';

interface Props {
  session?: SessionState;
}
interface States {
}

@inject('session')
@observer
class Messages extends React.Component<Props, States> {
  render() {
    const { messages } = this.props.session!;
    return (
      messages.length !== 0 ?
        messages.map(value =>
          (<Components.Message id={value.id} key={value.id} />)) :
        <p>您的消息已经全部处理完毕！</p>
    );
  }
}

export default Messages;

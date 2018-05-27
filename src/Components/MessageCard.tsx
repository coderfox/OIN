import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';
import Timeage from 'timeago.js';
var timeago = Timeage();

import * as Forms from '../Forms';
import * as Components from '../Components';

import { Card, CardProps } from 'semantic-ui-react';

interface Props {
  id: string;
  title: string;
  subscription: string;
  summary: string;
  onClick: (id: string) => void;
}
interface States {
}

class Message extends React.PureComponent<Props, States> {
  onClick: CardProps['onClick'] = () => {
    this.props.onClick(this.props.id);
  }
  render() {
    const { title, subscription, summary } = this.props;
    return (
      <Card fluid onClick={this.onClick}>
        <Card.Content>
          <Card.Header>{title}</Card.Header>
          <Card.Meta>{subscription}</Card.Meta>
          <Card.Description>{summary}</Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

export default Message;

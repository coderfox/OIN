import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../../lib/state/Session';
import * as Interfaces from '../../lib/api_interfaces';

import * as Forms from '../../Forms';
import * as Components from '../../Components';

import { Grid, Progress, Segment, Message } from 'semantic-ui-react';

interface Props {
  session?: SessionState;
}
interface States {
  selected_message?: string;
}

@inject('session')
@observer
class Messages extends React.Component<Props, States> {
  state: States = {};

  handleMessageClick = (id: string) => {
    this.setState({ selected_message: id });
  }

  render() {
    const { messages } = this.props.session!;
    return (
      <Grid columns={2}>
        <Grid.Row>
          <Grid.Column width={6}>
            <Message positive hidden={messages.length !== 0}>
              <Message.Header>
                没有消息
              </Message.Header>
              <p>
                您的消息已经全部处理完毕！
              </p>
            </Message>
            <Progress percent={42} indicating />
            {messages.map(m =>
              (<Components.MessageCard
                id={m.id}
                title={m.title}
                summary={m.summary}
                subscription={m.subscription}
                onClick={this.handleMessageClick}
              />))}
          </Grid.Column>
          <Grid.Column width={10} stretched>
            <Segment>
              {this.state.selected_message}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Messages;

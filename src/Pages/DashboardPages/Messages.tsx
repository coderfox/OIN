import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../../lib/SessionStore';
import * as Interfaces from '../../lib/api_interfaces';

import * as Forms from '../../Forms';
import * as Components from '../../Components';

import { Grid, Progress, Segment, Message, Sticky, Ref, RefProps, Button } from 'semantic-ui-react';

interface Props {
  session?: SessionState;
}
interface States {
  selected_message?: string;
  contextRef?: HTMLElement;
  done_messages?: number;
  loading?: boolean;
  loadingMarkAllAsReaded?: boolean;
}

@inject('session')
@observer
class Messages extends React.Component<Props, States> {
  state: States = {};

  handleMessageClick = (id: string) => {
    this.setState(({ selected_message: id }));
  }
  handleMessageReaded = () =>
    this.setState(prev => ({ done_messages: (prev.done_messages || 0) + 1 }))
  handleContextRef: RefProps['innerRef'] = contextRef => this.setState({ contextRef });
  markAllAsReaded = async () => {
    this.setState({ loadingMarkAllAsReaded: true });
    try {
      await Promise.all(this.props.session!.messages
        .filter(m => m.readed === false)
        .map(async m => {
          await this.props.session!.markAsReaded(m.id);
          this.handleMessageReaded();
        }));
    } catch (ex) {
      // nop, TODO
    }
    this.setState({ loadingMarkAllAsReaded: false });
  }
  refresh = async () => {
    this.setState({ loading: true, done_messages: 0 });
    try {
      await this.props.session!.retrieveLatestData();
    } catch (ex) {
      // nop, TODO
    }
    this.setState({ loading: false });
  }

  render() {
    const { messages, subscriptions } = this.props.session!;
    return (
      <Grid columns={2}>
        <Ref innerRef={this.handleContextRef}>
          <Grid.Row>
            <Grid.Column width={6}>
              <Segment>
                <Message positive hidden={messages.length !== 0 && this.state.done_messages !== messages.length}>
                  <Message.Header>
                    没有消息
                  </Message.Header>
                  <p>
                    您的消息已经全部处理完毕！
                  </p>
                </Message>
                <Progress
                  percent={messages.length === 0 ? 100 :
                    (this.state.done_messages || 0) / messages.length * 100}
                  color="olive"
                  value={this.state.done_messages || 0}
                  total={messages.length}
                  progress="ratio"
                />
                <Button
                  onClick={this.markAllAsReaded}
                  color="green"
                  content="全部标为已读"
                  disabled={messages.length === 0}
                  size="small"
                  loading={this.state.loadingMarkAllAsReaded}
                />
                <Button
                  onClick={this.refresh}
                  color="pink"
                  content="刷新"
                  size="small"
                  loading={this.state.loading}
                />
              </Segment>
              {messages
                .filter(m => m.readed === false)
                .map(m => {
                  const subscription = subscriptions.find(s => s.id === m.subscription);
                  return (
                    <Components.MessageSimple
                      key={m.id}
                      id={m.id}
                      title={m.title}
                      summary={m.summary}
                      subscription={(subscription && subscription.name) || '未找到对应的订阅'}
                      onClick={this.handleMessageClick}
                      onMarkedAsReaded={this.handleMessageReaded}
                    />);
                })}
            </Grid.Column>
            <Grid.Column width={10}>
              {this.state.selected_message &&
                <Components.MessageComplex
                  id={this.state.selected_message}
                  onMarkedAsReaded={this.handleMessageReaded}
                />
              }
            </Grid.Column>
          </Grid.Row>
        </Ref>
      </Grid>
    );
  }
}

export default Messages;

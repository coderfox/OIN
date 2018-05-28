import * as React from 'react';
import { inject, observer } from 'mobx-react';
import SessionState from '../../lib/SessionStore';
import * as Components from '../../Components';

import {
  Grid, Progress,
  Message,
  Ref, RefProps,
  Dimmer,
  Loader,
  InputProps,
  Menu,
  Input,
  Form,
} from 'semantic-ui-react';
import * as I from '../../lib/api_interfaces';

interface Props {
  session?: SessionState;
}
interface States {
  selected_message?: string;
  contextRef?: HTMLElement;
  done_messages?: number;
  loadingMarkAllAsReaded?: boolean;
  messages?: I.Message[];
  subscriptions?: { [key: string]: I.Subscription | undefined };
  search_query?: string;
}

@inject('session')
@observer
class Messages extends React.Component<Props, States> {
  state: States = { search_query: 'readed:false' };

  async componentDidMount() {
    this.setState({ messages: undefined });
    const result = await this.props.session!.client!.getMessagesWithQuery(
      this.state.search_query || 'nop');
    const messages = result.data;
    const subscriptionsArr = await Promise.all(
      messages.map(m =>
        this.props.session!.client!.getSubscription(m.subscription)));
    const subscriptions: { [key: string]: I.Subscription | undefined } = {};
    subscriptionsArr.map(s => subscriptions[s.id] = s);
    this.setState({
      messages, subscriptions, done_messages: messages
        .filter(m => m.readed === true).length
    });
  }

  handleMessageClick = (id: string) => {
    this.setState(({ selected_message: id }));
  }
  handleMessageReaded = (id: string) => {
    this.setState(prev => ({ done_messages: (prev.done_messages || 0) + 1 }));
    const messages = this.state.messages!.map(m => m.id === id ? { ...m, readed: true } : m);
    this.setState({ messages });
  }
  handleContextRef: RefProps['innerRef'] = contextRef => this.setState({ contextRef });
  markAllAsReaded = async () => {
    this.setState({ loadingMarkAllAsReaded: true });
    try {
      await Promise.all(this.state.messages ?
        this.state.messages
          .filter(m => m.readed === false)
          .map(async m => {
            await this.props.session!.markAsReaded(m.id);
            this.handleMessageReaded(m.id);
          }) : []);
    } catch (ex) {
      // nop, TODO
    }
    this.setState({ loadingMarkAllAsReaded: false });
  }
  refresh = async () => {
    this.setState({ done_messages: 0 });
    try {
      await this.componentDidMount();
    } catch (ex) {
      // nop, TODO
    }
  }

  handleSearchChange: InputProps['onChange'] = (_, data) => {
    this.setState({ search_query: data.value });
  }
  search = () => this.refresh();

  render() {
    const { messages, subscriptions } = this.state;
    return (
      <React.Fragment>
        <Menu secondary>
          <Menu.Item
            onClick={this.markAllAsReaded}
            name="全部标为已读"
            disabled={messages === undefined || messages.length === 0}
            loading={this.state.loadingMarkAllAsReaded}
          />
          <Menu.Item
            onClick={this.refresh}
            name="刷新"
          />
          <Menu.Item position="right">
            <Form onSubmit={this.search}>
              <Input
                action={{ type: 'submit', icon: 'search', onClick: this.search }}
                placeholder="搜索"
                onChange={this.handleSearchChange}
                value={this.state.search_query}
                onSubmit={this.search}
              />
            </Form>
          </Menu.Item>
        </Menu>
        <Grid columns={2}>
          <Ref innerRef={this.handleContextRef}>
            <Grid.Row>
              <Grid.Column width={6}>
                <Progress
                  color="olive"
                  value={this.state.done_messages || 0}
                  total={messages === undefined ? '-' : messages.length}
                  progress="ratio"
                />
                {messages &&
                  <Message positive hidden={messages.length !== 0 && this.state.done_messages !== messages.length}>
                    您的消息已经全部处理完毕！
                </Message>}
                <Dimmer active={messages === undefined} inverted>
                  <Loader>Loading</Loader>
                </Dimmer>
                {messages && messages
                  .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
                  .map(m => {
                    const subscription = subscriptions && subscriptions[m.subscription];
                    return (
                      <Components.MessageSimple
                        key={m.id}
                        id={m.id}
                        title={m.title}
                        summary={m.summary}
                        subscription={(subscription && subscription.name) || '未找到对应的订阅'}
                        onClick={this.handleMessageClick}
                        onMarkedAsReaded={this.handleMessageReaded}
                        readed={m.readed}
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
      </React.Fragment>
    );
  }
}

export default Messages;

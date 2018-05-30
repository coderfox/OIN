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
  Responsive,
} from 'semantic-ui-react';
import * as I from '../../lib/api_interfaces';
import * as responsive from '../../lib/responsive';

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
    await this.props.session!.cacheSubscriptions(messages.map(m => m.subscription));
    const subscriptionsArr = await Promise.all(
      messages.map(m =>
        this.props.session!.getSubscription(m.subscription)));
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
      this.setState({ loadingMarkAllAsReaded: false });
      throw ex; // TODO
    }
  }
  refresh = async () => {
    this.setState({ done_messages: 0 });
    await this.componentDidMount(); // TODO: catch
  }

  handleSearchChange: InputProps['onChange'] = (_, data) => {
    this.setState({ search_query: data.value });
  }
  search = (e?: React.FormEvent<{}>) => {
    if (e) { e.preventDefault(); }
    this.refresh();
  }

  closeSelectedMessage = () => {
    this.setState({ selected_message: undefined });
  }

  render() {
    const { messages, subscriptions } = this.state;
    return (
      <Ref innerRef={this.handleContextRef}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Menu secondary stackable fluid>
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
                  <Input
                    as="form"
                    onSubmit={this.search}
                    action={{
                      type: 'submit', icon: 'search'
                    }}
                    placeholder="搜索"
                    onChange={this.handleSearchChange}
                    value={this.state.search_query}
                  />
                </Menu.Item>
              </Menu>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={16} computer={6}>
              <Progress
                color="olive"
                value={messages === undefined ? -1 : (this.state.done_messages || 0)}
                total={messages === undefined ? -1 : messages.length}
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
                .sort((a, b) => {
                  if (!a.readed && !b.readed) {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                  } else if (a.readed && b.readed) {
                    return 0;
                  } else if (a.readed && !b.readed) {
                    return -1;
                  } else if (!a.readed && b.readed) {
                    return 1;
                  } else {
                    return 0;
                  }
                })
                .map(m => {
                  const subscription = subscriptions && subscriptions[m.subscription];
                  if (m.id === this.state.selected_message && responsive.isMobileOrTablet()) {
                    return (
                      <Components.MessageComplex
                        id={this.state.selected_message}
                        onMarkedAsReaded={this.handleMessageReaded}
                        onClose={this.closeSelectedMessage}
                      />
                    );
                  } else {
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
                      />
                    );
                  }
                })}
            </Grid.Column>
            <Grid.Column computer={10}>
              <Responsive {...responsive.onlyComputer}>
                {this.state.selected_message &&
                  <Components.MessageComplex
                    id={this.state.selected_message}
                    onMarkedAsReaded={this.handleMessageReaded}
                    onClose={this.closeSelectedMessage}
                  />
                }
              </Responsive>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Ref>
    );
  }
}

export default Messages;

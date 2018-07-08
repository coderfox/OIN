import ApiClient from "./client";
import Message from "./message";
import Store from "./store";
import log from "./log";

abstract class Service {
  constructor(public client: ApiClient, public store: Store) {}
  public abstract initialize: () => Promise<string>;
  public abstract mapChannelToMessages: (config: string) => Promise<Message[]>;
  public getChannels = () => this.client.getChannels();
  public handleChannels = async () => {
    const channels = await this.client.getChannels();
    await Promise.all(
      channels.map(async channel => {
        try {
          const messages = (await this.mapChannelToMessages(channel.config))
            .sort((a, b) => a.time.getTime() - b.time.getTime())
            .filter(
              item => item.time > this.store.get(this.client.id, channel.id),
            );
          this.store.set(
            this.client.id,
            channel.id,
            messages.length === 0
              ? new Date(0)
              : messages[messages.length - 1].time,
          );
          return Promise.all(
            messages.map(async m => {
              try {
                return await this.client.createMessage(
                  channel.id,
                  m.title,
                  m.summary,
                  m.content,
                  m.href,
                );
              } catch (ex) {
                log.error("error processing message", ex, m);
                this.client.reportEvent(
                  channel.id,
                  false,
                  `消息 ${JSON.stringify(m)} 创建失败 ${(ex.response &&
                    ex.response.data &&
                    ex.response.data.code) ||
                    ex.message} `,
                );
                return false;
              }
            }),
          ).then(res =>
            this.client
              .reportEvent(
                channel.id,
                true,
                `创建了${res.filter(v => v === true).length}条消息${
                  res.find(v => v === false)
                    ? `，未能创建${res.filter(v => v === false)}条消息`
                    : ""
                }`,
              )
              .catch(err => log.error("cannot report event", err)),
          );
        } catch (err) {
          log.error("error processing channel " + channel.id, err);
          this.client
            .reportEvent(
              channel.id,
              false,
              (err.response && err.response.data && err.response.data.code) ||
                err.message,
            )
            .catch(err => log.error("cannot report event", err));
          return null;
        }
      }),
    );
  }
}

export default Service;

import ApiClient from "./client";
import Message from "./message";
import Store from "./store";

abstract class Service {
  constructor(public client: ApiClient, public store: Store) { }
  public abstract mapChannelToMessages: (config: string) => Promise<Message[]>;
  public getChannels = () =>
    this.client.getChannels()
  public handleChannels = async () => {
    const channels = await this.client.getChannels();
    await Promise.all(channels.map(async channel => {
      const messages = (await this.mapChannelToMessages(channel.config))
        .sort((a, b) => a.time.getTime() - b.time.getTime())
        .filter(item => item.time > this.store.get(this.client.id, channel.id));
      this.store.set(this.client.id, channel.id,
        messages.length === 0 ? new Date(0) : messages[messages.length - 1].time);
      return Promise.all(messages.map(m => this.client.createMessage(channel.id, m.title, m.summary, m.content)));
    }));
  }
}

export default Service;

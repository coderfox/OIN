class Message {
  constructor(
    public title: string,
    public summary: string,
    public content: string,
    public time: Date,
    public href?: string,
  ) {}
}
export default Message;

export type Role = "admin";
export type Roles = Role[];

export class Permission {
  public roles: Roles;
  constructor(roles?: Roles) {
    this.roles = roles || [];
  }
  public check = (name: Role) => this.roles.indexOf(name) >= 0;
  public grant(name: Role) {
    if (!this.check(name)) {
      this.roles.push(name);
    }
  }
  public revoke(name: Role) {
    this.roles.splice(this.roles.indexOf(name), 1);
  }
}

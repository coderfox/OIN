#!/usr/bin/env node

import { getManager } from "typeorm";
import dbInit from "../lib/db";
import { Session, User } from "../models";

(async () => {
  await dbInit;
  const admin = new User("admin@example.com");
  const user = new User("user@example.com");
  const adminSession = new Session(admin);
  const adminSessionWithoutPermission = new Session(admin);
  const userSession = new Session(user);
  await admin.setPassword("admin");
  adminSession.permissions.admin = true;
  await user.setPassword("user");
  await getManager().save([admin, user, adminSession, adminSessionWithoutPermission, userSession]);
})();

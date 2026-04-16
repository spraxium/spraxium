import { defineEntity, p } from '@mikro-orm/core';

const UserSchema = defineEntity({
  name: 'User',
  tableName: 'users',
  properties: {
    id: p.integer().primary(),
    discordId: p.string().unique(),
    username: p.string(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);

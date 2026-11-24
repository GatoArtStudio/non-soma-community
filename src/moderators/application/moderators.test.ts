import { describe, expect, it } from "vitest";
import {
  actor,
  BROADCASTER_ID,
  FakeChannelDirectory,
  InMemoryModeratorRepository,
  RecordingModerationLog,
} from "@/test/fakes";
import { createGrantModeratorFromChatBadge } from "./grant-moderator-from-chat-badge";
import { createManageTeam } from "./manage-team";
import { createResolveRole } from "./resolve-role";

describe("resolveRole", () => {
  it("recognises the broadcaster, active moderators and members", async () => {
    const moderators = new InMemoryModeratorRepository();
    await moderators.grant({ kickUserId: 5, username: "m", source: "manual", grantedByUserId: 1 });
    await moderators.grant({ kickUserId: 6, username: "r", source: "manual", grantedByUserId: 1 });
    await moderators.revoke(6);
    const resolveRole = createResolveRole({ channel: new FakeChannelDirectory(), moderators });

    expect(await resolveRole(BROADCASTER_ID)).toBe("owner");
    expect(await resolveRole(5)).toBe("moderator");
    expect(await resolveRole(6)).toBe("member");
    expect(await resolveRole(7)).toBe("member");
  });

  it("degrades to moderator checks when Kick is unreachable", async () => {
    const moderators = new InMemoryModeratorRepository();
    const resolveRole = createResolveRole({
      channel: {
        getBroadcasterUserId: () => Promise.reject(new Error("down")),
        findAccountBySlug: async () => null,
      },
      moderators,
    });

    expect(await resolveRole(BROADCASTER_ID)).toBe("member");
  });
});

describe("grantModeratorFromChatBadge", () => {
  it("grants new moderators seen in chat", async () => {
    const moderators = new InMemoryModeratorRepository();
    const grant = createGrantModeratorFromChatBadge({ moderators });

    expect(await grant({ kickUserId: 5, username: "nuevo" })).toBe("granted");
    expect((await moderators.findByKickUserId(5))?.source).toBe("chat_badge");
  });

  it("never re-grants a moderator revoked by the owner", async () => {
    const moderators = new InMemoryModeratorRepository();
    await moderators.grant({
      kickUserId: 5,
      username: "x",
      source: "chat_badge",
      grantedByUserId: null,
    });
    await moderators.revoke(5);
    const grant = createGrantModeratorFromChatBadge({ moderators });

    expect(await grant({ kickUserId: 5, username: "x" })).toBe("revoked_by_owner");
    expect((await moderators.findByKickUserId(5))?.revokedAt).not.toBeNull();
  });
});

describe("manageTeam", () => {
  it("is restricted to the owner", async () => {
    const team = createManageTeam({
      channel: new FakeChannelDirectory(),
      moderators: new InMemoryModeratorRepository(),
      log: new RecordingModerationLog(),
    });

    await expect(team.listModerators(actor("moderator"))).rejects.toMatchObject({
      code: "not_owner",
    });
  });

  it("does not let the owner demote themselves", async () => {
    const team = createManageTeam({
      channel: new FakeChannelDirectory(),
      moderators: new InMemoryModeratorRepository(),
      log: new RecordingModerationLog(),
    });

    await expect(team.grantModerator(actor("owner"), "@elmune")).rejects.toMatchObject({
      code: "cannot_target_owner",
    });
    await expect(team.revokeModerator(actor("owner"), BROADCASTER_ID)).rejects.toMatchObject({
      code: "cannot_target_owner",
    });
  });
});

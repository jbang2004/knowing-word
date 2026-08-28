import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { answerBucket, DELETE, GET, PUT } from "../app/api/profile/route.ts";
import { runWithRuntimeEnv } from "../app/lib/runtime-env.ts";
import { emptyProfile, recordAnswerAttempt } from "../app/lib/profile-model.ts";

function profileDb(initialProfile, onFirstBaseUpdateConflict, onShardInsertConflict) {
  let base = initialProfile
    ? { payload_json: JSON.stringify(initialProfile), updated_at: "2026-08-25T00:00:00.000Z", revision: 1 }
    : null;
  const shards = new Map();
  let baseUpdateCalls = 0;
  let pendingShardConflict = onShardInsertConflict;
  return {
    get base() { return base; },
    get shards() { return shards; },
    async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); },
    prepare(sql) {
      return {
        values: [],
        bind(...values) { this.values = values; return this; },
        async first() {
          if (!sql.includes("FROM study_profiles")) throw new Error(`unexpected first SQL: ${sql}`);
          return base ? { ...base } : null;
        },
        async all() {
          if (sql.includes("FROM recordings")) return { results: [] };
          if (!sql.includes("FROM profile_answer_shards")) throw new Error(`unexpected all SQL: ${sql}`);
          return { results: [...shards.values()].sort((left, right) => left.bucket - right.bucket) };
        },
        async run() {
          if (sql.includes("DELETE FROM profile_answer_shards")) {
            const changes = shards.size;
            shards.clear();
            return { meta: { changes } };
          }
          if (sql.includes("DELETE FROM study_profiles")) {
            const changes = Number(Boolean(base));
            base = null;
            return { meta: { changes } };
          }
          if (sql.includes("DELETE FROM learning_events") || sql.includes("DELETE FROM recordings")) {
            return { meta: { changes: 0 } };
          }
          if (sql.includes("UPDATE profile_answer_shards")) {
            const [, bucket, answersJson, updatedAt, revision, expectedRevision] = this.values;
            const row = shards.get(bucket);
            if (!row || row.revision !== expectedRevision) return { meta: { changes: 0 } };
            shards.set(bucket, { bucket, answers_json: answersJson, updated_at: updatedAt, revision });
            return { meta: { changes: 1 } };
          }
          if (sql.includes("INSERT OR IGNORE INTO profile_answer_shards")) {
            const [, bucket, answersJson, updatedAt] = this.values;
            if (shards.has(bucket)) return { meta: { changes: 0 } };
            const competingAnswers = pendingShardConflict?.(bucket);
            if (competingAnswers) {
              pendingShardConflict = null;
              shards.set(bucket, {
                bucket,
                answers_json: JSON.stringify(competingAnswers),
                updated_at: "2026-08-25T00:00:01.000Z",
                revision: 1,
              });
              return { meta: { changes: 0 } };
            }
            shards.set(bucket, { bucket, answers_json: answersJson, updated_at: updatedAt, revision: 1 });
            return { meta: { changes: 1 } };
          }
          if (sql.includes("UPDATE study_profiles")) {
            baseUpdateCalls += 1;
            const [, payload, updatedAt, revision, expectedRevision] = this.values;
            if (baseUpdateCalls === 1 && onFirstBaseUpdateConflict) {
              base = {
                payload_json: JSON.stringify(onFirstBaseUpdateConflict()),
                updated_at: "2026-08-25T00:00:01.000Z",
                revision: base.revision + 1,
              };
              return { meta: { changes: 0 } };
            }
            if (!base || base.revision !== expectedRevision) return { meta: { changes: 0 } };
            base = { payload_json: payload, updated_at: updatedAt, revision };
            return { meta: { changes: 1 } };
          }
          if (sql.includes("INSERT OR IGNORE INTO study_profiles")) {
            if (base) return { meta: { changes: 0 } };
            const [, payload, updatedAt, revision] = this.values;
            base = { payload_json: payload, updated_at: updatedAt, revision };
            return { meta: { changes: 1 } };
          }
          throw new Error(`unexpected SQL: ${sql}`);
        },
      };
    },
  };
}

function profileRequest(profile, method = "PUT") {
  return new Request("https://example.test/api/profile", {
    method,
    headers: {
      "content-type": "application/json",
      "oai-authenticated-user-id": "learner-1",
    },
    ...(method === "PUT" ? { body: JSON.stringify(profile) } : {}),
  });
}

test("profile PUT retries a base revision race and preserves both devices' evidence", async () => {
  const server = emptyProfile();
  server.completed.words = ["server-char"];
  const incoming = emptyProfile();
  incoming.completed.words = ["incoming-char"];
  const concurrent = emptyProfile();
  concurrent.completed.words = ["server-char", "concurrent-char"];
  const db = profileDb(server, () => concurrent);

  const response = await runWithRuntimeEnv({ DB: db }, () => PUT(profileRequest(incoming)));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.revision, 3);
  assert.deepEqual(payload.profile.completed.words, ["server-char", "concurrent-char", "incoming-char"]);
  assert.deepEqual(JSON.parse(db.base.payload_json).completed.words, payload.profile.completed.words);
  assert.deepEqual(JSON.parse(db.base.payload_json).answers, {});
  assert.equal(db.shards.size, 0);
});

test("legacy base answers migrate into shards and GET reconstructs all actor counters", async () => {
  const legacy = emptyProfile();
  legacy.answers.shared = recordAnswerAttempt(undefined, "oldtab", {
    correctAnswer: true,
    lastCorrect: true,
    lastAt: "2026-08-25T00:00:00.000Z",
  });
  const incoming = emptyProfile();
  incoming.answers.shared = recordAnswerAttempt(legacy.answers.shared, "newtab", {
    correctAnswer: false,
    lastCorrect: false,
    lastAt: "2026-08-25T00:01:00.000Z",
  });
  const db = profileDb(legacy);

  const put = await runWithRuntimeEnv({ DB: db }, () => PUT(profileRequest(incoming)));
  assert.equal(put.status, 200);
  assert.deepEqual(JSON.parse(db.base.payload_json).answers, {});
  assert.equal(db.shards.size, 1);

  const get = await runWithRuntimeEnv({ DB: db }, () => GET(profileRequest(null, "GET")));
  assert.equal(get.status, 200);
  const payload = await get.json();
  assert.equal(payload.profile.answers.shared.attempts, 2);
  assert.deepEqual(payload.profile.answers.shared.actorCounts, {
    oldtab: { attempts: 1, correct: 1 },
    newtab: { attempts: 1, correct: 0 },
  });
});

test("profile PUT retries a shard CAS race and preserves both tab actors", async () => {
  const firstTab = emptyProfile();
  firstTab.answers.shared = recordAnswerAttempt(undefined, "firsttab", {
    correctAnswer: true,
    lastCorrect: true,
    lastAt: "2026-08-25T00:00:00.000Z",
  });
  const secondTab = emptyProfile();
  secondTab.answers.shared = recordAnswerAttempt(undefined, "secondtab", {
    correctAnswer: false,
    lastCorrect: false,
    lastAt: "2026-08-25T00:01:00.000Z",
  });
  const db = profileDb(emptyProfile(), null, (bucket) => {
    return bucket === answerBucket("shared") ? secondTab.answers : null;
  });

  const response = await runWithRuntimeEnv({ DB: db }, () => PUT(profileRequest(firstTab)));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.profile.answers.shared.attempts, 2);
  assert.deepEqual(payload.profile.answers.shared.actorCounts, {
    firsttab: { attempts: 1, correct: 1 },
    secondtab: { attempts: 1, correct: 0 },
  });
});

test("profile DELETE clears the base and every answer shard", async () => {
  const profile = emptyProfile();
  profile.answers.shared = recordAnswerAttempt(undefined, "onetab", {
    correctAnswer: true,
    lastCorrect: true,
    lastAt: "2026-08-25T00:00:00.000Z",
  });
  const db = profileDb(profile);
  const put = await runWithRuntimeEnv({ DB: db }, () => PUT(profileRequest(profile)));
  assert.equal(put.status, 200);
  assert.equal(db.shards.size, 1);

  const response = await runWithRuntimeEnv(
    { DB: db, MEDIA: { delete: async () => undefined } },
    () => DELETE(profileRequest(null, "DELETE")),
  );
  assert.equal(response.status, 200);
  assert.equal(db.base, null);
  assert.equal(db.shards.size, 0);
});

test("profile storage migrations declare base and per-bucket CAS revisions", async () => {
  const baseMigration = await readFile(new URL("../drizzle/0003_profile_revision.sql", import.meta.url), "utf8");
  const shardMigration = await readFile(new URL("../drizzle/0004_profile_answer_shards.sql", import.meta.url), "utf8");
  assert.match(baseMigration, /ALTER TABLE `study_profiles` ADD COLUMN `revision` integer DEFAULT 0 NOT NULL/u);
  assert.match(shardMigration, /PRIMARY KEY\(`user_id`, `bucket`\)/u);
  assert.match(shardMigration, /`revision` integer DEFAULT 0 NOT NULL/u);
});

test("browser profile actor is scoped to the page realm so duplicated tabs cannot inherit a counter", async () => {
  const source = await readFile(new URL("../app/infrastructure/browser/profile-actor.ts", import.meta.url), "utf8");
  assert.match(source, /let pageActorId: string \| null = null/u);
  assert.match(source, /if \(pageActorId && ACTOR_PATTERN\.test\(pageActorId\)\) return pageActorId/u);
  assert.doesNotMatch(source, /window\.(?:local|session)Storage/u);
});

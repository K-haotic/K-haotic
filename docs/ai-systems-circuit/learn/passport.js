/* Khaotic AI for Dummies — Learning Passport v1.
 * Self-assessed educational progress only, NOT a badge, account, membership
 * proof, entitlement or research authorization.
 *
 * No network/API, identity, cookies, analytics or automatic persistence.
 * Save/restore uses this origin's localStorage ONLY on explicit button click.
 * Portable JSON is a user-controlled text copy, never a server submission.
 */
(() => {
  "use strict";

  const SCHEMA = "khaotic.learning_passport.v1";
  const KIND = "SELF_ASSESSED_PROGRESS_ONLY";
  const AUTHORITY = "NONE";
  const KEY = "khaotic.ai.systems_circuit.learning_passport.v1";
  const MAX_JSON_BYTES = 2048;
  const LESSON_IDS = [
    "system", "prompting", "context", "tools",
    "privacy", "verification", "experiments", "workflows",
  ];
  const ACTIVITY_IDS = ["prompt", "evidence", "action"];
  const lessonSet = new Set();
  const activitySet = new Set();
  const byId = (id) => document.getElementById(id);
  const status = byId("passport-status");
  const transfer = byId("passport-transfer");
  const meter = byId("passport-meter");
  const count = byId("passport-progress");
  const controls = Array.from(document.querySelectorAll('input[data-lesson]'));

  if (controls.length !== LESSON_IDS.length ||
      new Set(controls.map(c => c.dataset.lesson)).size !== LESSON_IDS.length ||
      controls.some(c => !LESSON_IDS.includes(c.dataset.lesson))) {
    throw new Error("LEARNING_PASSPORT_LESSON_BINDING_MISMATCH");
  }

  function note(message) {
    status.textContent = message;
  }

  function record() {
    return {
      schema: SCHEMA,
      kind: KIND,
      authority: AUTHORITY,
      lessons: LESSON_IDS.filter(id => lessonSet.has(id)),
      activities: ACTIVITY_IDS.filter(id => activitySet.has(id)),
    };
  }

  function decode(raw) {
    if (typeof raw !== "string" || raw.length === 0 ||
        raw.length > MAX_JSON_BYTES) {
      throw new Error("PASSPORT_SIZE_OR_CONTENT_INVALID");
    }
    const value = JSON.parse(raw);
    if (value === null || Array.isArray(value) || typeof value !== "object" ||
        Object.keys(value).sort().join("|") !==
          ["activities", "authority", "kind", "lessons", "schema"].join("|") ||
        value.schema !== SCHEMA || value.kind !== KIND || value.authority !== AUTHORITY) {
      throw new Error("PASSPORT_SCHEMA_OR_AUTHORITY_INVALID");
    }
    function check(ids, allowed) {
      return Array.isArray(ids) && ids.length <= allowed.length &&
        ids.every(id => typeof id === "string" && allowed.includes(id)) &&
        new Set(ids).size === ids.length;
    }
    if (!check(value.lessons, LESSON_IDS) ||
        !check(value.activities, ACTIVITY_IDS)) {
      throw new Error("PASSPORT_PROGRESS_VALUES_INVALID");
    }
    return value;
  }

  function render() {
    for (const input of controls) {
      input.checked = lessonSet.has(input.dataset.lesson);
    }
    const done = lessonSet.size + activitySet.size;
    meter.value = done;
    count.textContent = done + " of 11 local milestones (self-assessed)";
  }

  function apply(value) {
    // decode() has already verified all keys. Never infer any account grants.
    lessonSet.clear();
    activitySet.clear();
    value.lessons.forEach(id => lessonSet.add(id));
    value.activities.forEach(id => activitySet.add(id));
    render();
  }

  for (const input of controls) {
    input.addEventListener("change", () => {
      if (input.checked) lessonSet.add(input.dataset.lesson);
      else lessonSet.delete(input.dataset.lesson);
      render();
      note("Updated in this tab only. Choose Save to keep progress on this device.");
    });
  }

  document.addEventListener("khaotic:practice-result", (event) => {
    const id = event && event.detail && event.detail.activity;
    if (!ACTIVITY_IDS.includes(id)) return;
    activitySet.add(id);
    render();
    note("Practice recorded in this tab. Save or export if you want to keep it.");
  });

  byId("passport-save").addEventListener("click", () => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(record()));
      note("Saved on this browser only. Khaotic received nothing. This is not membership verification.");
    } catch (_) {
      note("Browser storage is unavailable. You can still export the small JSON record.");
    }
  });

  byId("passport-restore").addEventListener("click", () => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw === null) {
        note("No previously saved Learning Passport on this browser.");
        return;
      }
      apply(decode(raw));
      note("Restored local progress. This is not proof of learning or membership.");
    } catch (_) {
      note("Saved progress is unavailable or invalid. No progress was imported.");
    }
  });

  byId("passport-export").addEventListener("click", () => {
    transfer.value = JSON.stringify(record());
    note("Portable JSON prepared locally. Select and copy it yourself to another device. It is not a credential.");
  });

  byId("passport-import").addEventListener("click", () => {
    try {
      const imported = decode(transfer.value);
      apply(imported);
      transfer.value = "";
      note("Imported self-assessed progress in this tab only. Save separately if wanted.");
    } catch (_) {
      note("Invalid or unsupported Learning Passport. No progress changed.");
    }
  });

  byId("passport-clear").addEventListener("click", () => {
    lessonSet.clear();
    activitySet.clear();
    transfer.value = "";
    render();
    try {
      window.localStorage.removeItem(KEY);
      note("Cleared this tab and this browser's saved Learning Passport.");
    } catch (_) {
      note("Cleared this tab. Browser storage could not be reached; erase site storage in browser settings.");
    }
  });

  // No automatic storage read, writes, network calls or account claims.
  render();
})();

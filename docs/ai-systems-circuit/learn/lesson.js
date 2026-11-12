/* AI for Dummies — public local-only exercises.
 * No network, analytics, persistence, account access or model calls.
 * Source: Khaotic public education only; no internal Recursive Physics code.
 */
(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const task = byId("task");
  const audience = byId("audience");
  const format = byId("format");
  const evidence = byId("evidence");
  const promptOutput = byId("prompt-output");
  const promptFeedback = byId("prompt-feedback");

  const sanitizeTask = (value) =>
    String(value).replace(/\s+/g, " ").trim().slice(0, 280);

  function makePrompt() {
    const description = sanitizeTask(task.value);
    if (!description) {
      promptFeedback.textContent =
        "Add a non-sensitive, fictional task before building your prompt.";
      promptOutput.textContent = "Your example prompt will appear here. Nothing is sent.";
      return;
    }
    const approvedAudiences = ["a beginner", "a colleague", "a customer"];
    const approvedFormats = [
      "a short step-by-step checklist", "a concise table", "three clear paragraphs",
    ];
    const approvedEvidence = [
      "Flag unknown facts and ask for missing information. Do not invent sources.",
      "Mark which points need independent source verification, with source dates if available.",
    ];
    if (!approvedAudiences.includes(audience.value) ||
        !approvedFormats.includes(format.value) ||
        !approvedEvidence.includes(evidence.value)) {
      promptFeedback.textContent = "Select an available option for every field.";
      return;
    }
    const lines = [
      "TASK: " + description,
      "AUDIENCE: Explain the result for " + audience.value + ".",
      "FORMAT: Return " + format.value + ".",
      "BOUNDARY: Use only details provided in the task. Do not assume access to files or websites.",
      "EVIDENCE: " + evidence.value,
      "QUALITY CHECK: Clearly separate facts, assumptions and suggested next steps.",
    ];
    promptOutput.textContent = lines.join("\n");
    promptFeedback.textContent =
      "Example prompt assembled locally. Review, edit and paste it into an AI service yourself if you choose; nothing was transmitted.";
  }

  function clearPrompt() {
    task.value = "";
    audience.selectedIndex = 0;
    format.selectedIndex = 0;
    evidence.selectedIndex = 0;
    promptFeedback.textContent = "";
    promptOutput.textContent = "Your example prompt will appear here. Nothing is sent.";
  }

  function checkQuestion(group, feedbackId, correct, success, error) {
    const radios = document.getElementsByName(group);
    let selected = "";
    for (const radio of radios) {
      if (radio.checked) {
        selected = radio.value;
        break;
      }
    }
    const feedback = byId(feedbackId);
    if (!selected) {
      feedback.textContent = "Choose one answer, then check it.";
    } else if (selected === correct) {
      feedback.textContent = "Correct. " + success;
    } else {
      feedback.textContent = "Try again. " + error;
    }
  }

  byId("build-prompt").addEventListener("click", makePrompt);
  byId("clear-prompt").addEventListener("click", clearPrompt);
  byId("check-evidence").addEventListener("click", () => {
    checkQuestion(
      "evidence-answer", "evidence-feedback", "b",
      "The fictional reference supports a past closing time only, not present-day verification.",
      "Only the supplied fictional reference can be cited; it doesn't support popularity or 24-hour hours."
    );
  });
  byId("check-action").addEventListener("click", () => {
    checkQuestion(
      "action-answer", "action-feedback", "b",
      "A draft is not proof of a send. A connected tool, authorization and a send receipt would be needed.",
      "A model's claim is not a verified external action; no tool or receipt exists."
    );
  });
})();

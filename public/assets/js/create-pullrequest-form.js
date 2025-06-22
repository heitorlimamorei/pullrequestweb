/* eslint-disable no-undef */
(() => {
  "use strict";

  // ── Dependencies ──────────────────────────────────────────────────────────
  const auth = window.useAuth();
  const AI = window.useAI();
  const router = window.useRouter();
  const store = window.useState();
  const gh = window.newGithub(); // ← NEW: shared GitHub helpers

  // ── Session / Auth ────────────────────────────────────────────────────────
  const session = auth.getSession();
  if (!session) {
    // token ausente / expirado → login
    router.push("login.html");
    return;
  }
  const token = session.token;

  // ── State ────────────────────────────────────────────────────────────────
  let currentRepos = [];
  let allBranches = [];

  // ── Bootstrapping ────────────────────────────────────────────────────────
  const init = async () => {
    try {
      await populateOrganizations();
      populateModels();
      bindEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Populators ───────────────────────────────────────────────────────────
  const populateOrganizations = async () => {
    const user = await gh.getAuthenticatedUser(token);
    const orgs = await gh.listUserOrgs(token);
    const list = [{ login: user.login }, ...orgs];

    const $select = $("#organizacao");
    $select.empty().append('<option value="">Select organization</option>');
    list.forEach(({ login }) =>
      $select.append(`<option value="${login}">${login}</option>`)
    );
  };

  const populateModels = () => {
    const models = AI.models;
    const $select = $("#models");
    $select
      .empty()
      .append('<option value="">Selecione um modelo de AI</option>');
    models.forEach(({ id, label }) =>
      $select.append(`<option value="${id}">${label}</option>`)
    );
  };

  const loadRepositories = async (org) => {
    if (!org) return;

    try {
      const user = await gh.getAuthenticatedUser(token);
      const isUser = org === user.login;

      currentRepos = (await gh.listRepos({ owner: org, token, isUser })).sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      $("#repositorio")
        .prop("disabled", false)
        .autocomplete(
          "option",
          "source",
          currentRepos.map((r) => r.name)
        );
    } catch (err) {
      alert(`Error loading repositories: ${err.message}`);
    }
  };

  const fetchBranches = async () => {
    const org = $("#organizacao").val().trim();
    const repo = $("#repositorio").val().trim();
    if (!org || !repo) return;

    try {
      const branches = await gh.listBranches({ owner: org, repo, token });
      allBranches = branches.map((b) => b.name);

      $("#branch_base, #branch_comparacao")
        .autocomplete("option", "source", allBranches)
        .val("");
    } catch (err) {
      alert(`Error loading branches: ${err.message}`);
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
    const required = [
      $("#organizacao").val().trim(),
      $("#repositorio").val().trim(),
      $("#branch_base").val().trim(),
      $("#branch_comparacao").val().trim(),
    ];
    if (required.some((v) => v === "")) {
      alert("All fields must be filled.");
      return false;
    }
    return true;
  };

  // ── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    AI.setModel($("#models").val().trim());
    const jobsProcessor = window.newJobsProcessor(store);
    jobsProcessor.addJob({
      owner: $("#organizacao").val().trim(),
      repo: $("#repositorio").val().trim(),
      githubToken: token,
      baseBranch: $("#branch_base").val().trim(),
      headBranch: $("#branch_comparacao").val().trim(),
    });

    window.location.href = "/chat.html";
  };

  // ── Event binding ────────────────────────────────────────────────────────
  const bindEvents = () => {
    $("#organizacao").on("change", (e) =>
      loadRepositories($(e.target).val().trim())
    );

    $("#repositorio")
      .autocomplete({
        minLength: 0,
        source: () => currentRepos.map((r) => r.name),
        select: (event, ui) => {
          $("#repositorio").val(ui.item.value);
          fetchBranches();
          return false;
        },
      })
      .focus(function () {
        $(this).autocomplete("search", "");
      });

    $("#branch_base, #branch_comparacao")
      .autocomplete({
        minLength: 0,
        source: () => allBranches,
      })
      .focus(function () {
        $(this).autocomplete("search", "");
      });

    $("#Submit").on("click", handleSubmit);
  };

  // ── Kick-off ─────────────────────────────────────────────────────────────
  $(init);
})();

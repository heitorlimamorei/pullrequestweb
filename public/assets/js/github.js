/* GitHub API helpers for the Pull-Request Generator
 *
 * All helpers expect a Personal-Access-Token (PAT) with at least `repo` scope.
 * The token is always passed explicitly → no hidden globals, easier testing.
 *
 * Usage example:
 *   const gh = window.newGithub();
 *   const repos = await gh.listRepos({ owner: 'octocat', isUser: true, token });
 */

const DEFAULT_ACCEPT = "application/vnd.github.v3+json";

/* ---------- low-level primitives ---------------------------------------- */

/** Build the standard headers for every GitHub REST call. */
const buildHeaders = (token, extra = {}) => ({
  Authorization: `token ${token}`,
  Accept: DEFAULT_ACCEPT,
  ...extra,
});

/** Thin fetch wrapper: throws on HTTP errors and always returns JSON. */
async function githubFetch(url, token, init = {}) {
  const resp = await fetch(url, {
    ...init,
    headers: {
      ...buildHeaders(token),
      ...(init.headers || {}),
    },
  });

  if (!resp.ok) {
    // best-effort error details for easier debugging
    let details = "";
    try {
      const json = await resp.json();
      details = json.message || JSON.stringify(json);
    } catch {
      details = await resp.text();
    }
    throw new Error(`GitHub API ${resp.status}: ${details}`);
  }
  return resp.json();
}

/** Follow GitHub’s Link header (`rel="next"`) to fetch *all* pages. */
async function fetchAllPages(url, token) {
  let results = [];
  let next = url;

  while (next) {
    const resp = await fetch(next, { headers: buildHeaders(token) });
    if (!resp.ok) {
      throw new Error(
        `GitHub API ${resp.status}: ${await resp.text()} (while paging)`,
      );
    }
    results = results.concat(await resp.json());

    const link = resp.headers.get("link");
    if (link && link.includes('rel="next"')) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      next = match ? match[1] : null;
    } else {
      next = null;
    }
  }
  return results;
}

/* ---------- mid-level helpers ------------------------------------------- */

const getAuthenticatedUser = (token) =>
  githubFetch("https://api.github.com/user", token);

const listUserOrgs = (token) =>
  githubFetch("https://api.github.com/user/orgs", token);

async function listRepos({ owner, token, isUser = false }) {
  const base = isUser
    ? `https://api.github.com/users/${owner}`
    : `https://api.github.com/orgs/${owner}`;
  return fetchAllPages(`${base}/repos?per_page=100`, token);
}

const listBranches = ({ owner, repo, token }) =>
  fetchAllPages(
    `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
    token,
  );

/* ---------- high-level actions ------------------------------------------ */

async function getCommitsFromGitHub({
  owner,
  repo,
  baseBranch,
  headBranch,
  githubToken,
}) {
  try {
    const compareURL = `https://api.github.com/repos/${owner}/${repo}/compare/${baseBranch}...${headBranch}`;
    const { commits } = await githubFetch(compareURL, githubToken);

    return Promise.all(
      commits.map(async (c) => {
        const commitData = await githubFetch(
          `https://api.github.com/repos/${owner}/${repo}/commits/${c.sha}`,
          githubToken,
        );
        return {
          sha: c.sha,
          message: c.commit.message,
          files: commitData.files.map((f) => ({
            filename: f.filename,
            status: f.status,
            patch: f.patch || "",
          })),
        };
      }),
    );
  } catch (err) {
    console.error("❌ Failed to fetch commits:", err.message);
    return [];
  }
}

async function createPullRequest({
  owner,
  repo,
  headBranch,
  baseBranch,
  title,
  body,
  githubToken,
}) {
  try {
    return await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      githubToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, head: headBranch, base: baseBranch, body }),
      },
    );
  } catch (err) {
    console.error("❌ Error creating Pull Request:", err.message);
    return null;
  }
}

/* ---------- factory exported to the window ------------------------------ */

function newGithub() {
  return {
    /* low-level */
    githubFetch,
    fetchAllPages,
    /* mid-level */
    getAuthenticatedUser,
    listUserOrgs,
    listRepos,
    listBranches,
    /* high-level */
    getCommitsFromGitHub,
    createPullRequest,
  };
}

window.newGithub = newGithub;
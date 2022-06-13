import { ruleSetBuilder, modelChangeMatcher } from "@skryb/core";
import _ from "lodash";
import { Octokit } from "@octokit/core";
import { buildTeam } from "./rules/build-team.js";

function extractToken(tokenSpec) {
  if (tokenSpec && tokenSpec.indexOf("env::") === 0) {
    return process.env[tokenSpec.substring(5)];
  } else {
    return tokenSpec;
  }
}

export default function githubPlugin(project, config) {
  console.log("received plugin config", config);

  const octokit = new Octokit({ auth: extractToken(config.token) });

  async function loadBranch(branch, { owner, repo }) {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/branches", {
      owner,
      repo,
    });
    return data.find(b => b.name === branch);
  }

  async function loadCommits(count, { owner, repo }) {
    const resp = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
      per_page: count,
    });
    return resp.data.map(d => d.commit);
  }

  async function loadTags(count, { owner, repo }) {
    const resp = await octokit.request("GET /repos/{owner}/{repo}/tags", {
      owner,
      repo,
      per_page: count,
    });
    return resp.data;
  }

  async function loadReleases(count, { owner, repo }) {
    const resp = await octokit.request("GET /repos/{owner}/{repo}/releases", {
      owner,
      repo,
      per_page: count,
    });
    return resp.data;
  }

  async function loadSourceControlInfos(events, model, mutations_) {
    events
      .map(ev => ev.value)
      .filter(resource => _.identity(resource) && resource.sourceControl && resource.sourceControl.indexOf("github::") === 0)
      .map(async resource => {
        console.log("loading sc infos for resource", resource);
        const scInfos = {};
        try {
          console.log("extracting model infos from source control", resource.sourceControl);
          const fragments = resource.sourceControl.substring(8).split("/");
          scInfos.branch = await loadBranch(resource.scBranch || config.defaultBranch || "main", { owner: fragments[0], repo: fragments[1] });
          scInfos.lastCommits = await loadCommits(10, { owner: fragments[0], repo: fragments[1] });
          scInfos.tags = await loadTags(10, { owner: fragments[0], repo: fragments[1] });
          scInfos.releases = await loadReleases(10, { owner: fragments[0], repo: fragments[1] });

          // organization
          // licenses

          console.log("producing scInfos", scInfos);
          mutations_.next({ type: "SET_SOURCECONTROL_INFOS", target: { name: resource.name, type: resource.type }, infos: scInfos });
        } catch (err) {
          console.error("unable to extract github infos", err);
        }
      });
  }

  return {
    installRuleSet(project, mutations_, { model, hub }) {
      console.log("Installing github ruleset");
      return ruleSetBuilder(project, mutations_, { model, hub })
        .addRule(modelChangeMatcher({ path: { $eq: "microservices" } }), loadSourceControlInfos)
        .addRule(modelChangeMatcher({ path: { $eq: "scInfos" } }), buildTeam)
        .build();
    },
  };
}

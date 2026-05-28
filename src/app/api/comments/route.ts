// Comments API — backed by GitHub Issues. Each comment becomes an Issue with
// labels `comment` + `page:<path>` (slashes replaced with underscores so the
// label is valid). Close the Issue on GitHub → it disappears from the widget
// (we filter state=open).
//
// Env vars:
//   GITHUB_TOKEN — fine-grained PAT with Issues: read+write on the target repo
//   GITHUB_REPO  — owner/repo, defaults to Thisisiyke/Jolieden

import { NextResponse } from "next/server";

const DEFAULT_REPO = "Thisisiyke/Jolieden";
const API_BASE = "https://api.github.com";
const COMMENT_LABEL = "comment";

const repo = () => process.env.GITHUB_REPO || DEFAULT_REPO;
const token = () => process.env.GITHUB_TOKEN;

const pageToLabel = (page: string) =>
  `page:${page.replace(/^\/+|\/+$/g, "") || "root"}`.replace(/\//g, "_");

const labelToPage = (label: string) =>
  label.startsWith("page:") ? "/" + label.slice("page:".length).replace(/_/g, "/") : "";

type GhIssue = {
  number: number;
  title: string;
  body: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: { login: string } | null;
  labels: Array<string | { name: string }>;
};

const ghHeaders = () => {
  const t = token();
  if (!t) return null;
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${t}`,
    "X-GitHub-Api-Version": "2022-11-28",
  } as const;
};

const ghError = (status: number, message: string) =>
  NextResponse.json({ error: message }, { status });

const labelName = (l: string | { name: string }) =>
  typeof l === "string" ? l : l.name;

type CommentPayload = {
  id: number;
  page: string;
  author: string;
  body: string;
  createdAt: string;
  url: string;
};

const toComment = (issue: GhIssue): CommentPayload => {
  const pageLabel = issue.labels
    .map(labelName)
    .find((l) => l.startsWith("page:"));
  // Body format we write: "**{author}**\n\n{body}\n\n_page: {page}_"
  // Recover author and body cleanly.
  const raw = issue.body ?? "";
  const authorMatch = raw.match(/^\*\*([^*]+)\*\*\s*\n+/);
  const author = authorMatch?.[1]?.trim() || issue.user?.login || "anonymous";
  const stripped = raw
    .replace(/^\*\*[^*]+\*\*\s*\n+/, "")
    .replace(/\n+_page:[^_]+_\s*$/, "")
    .trim();
  return {
    id: issue.number,
    page: pageLabel ? labelToPage(pageLabel) : "",
    author,
    body: stripped,
    createdAt: issue.created_at,
    url: issue.html_url,
  };
};

export async function GET(req: Request) {
  const headers = ghHeaders();
  if (!headers) return ghError(500, "GITHUB_TOKEN not configured");

  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "/";
  const labels = [COMMENT_LABEL, pageToLabel(page)].join(",");

  const ghUrl = `${API_BASE}/repos/${repo()}/issues?state=open&labels=${encodeURIComponent(labels)}&per_page=100`;
  const res = await fetch(ghUrl, { headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    return ghError(res.status, `GitHub: ${text || res.statusText}`);
  }
  const issues = (await res.json()) as GhIssue[];
  return NextResponse.json({
    page,
    comments: issues.map(toComment),
  });
}

export async function POST(req: Request) {
  const headers = ghHeaders();
  if (!headers) return ghError(500, "GITHUB_TOKEN not configured");

  let payload: { author?: string; body?: string; page?: string };
  try {
    payload = await req.json();
  } catch {
    return ghError(400, "Invalid JSON body");
  }
  const author = (payload.author || "anonymous").trim().slice(0, 80);
  const body = (payload.body || "").trim();
  const page = (payload.page || "/").trim();
  if (!body) return ghError(400, "body required");

  const title = `[Comment] ${body.slice(0, 60)}${body.length > 60 ? "…" : ""}`;
  const issueBody = `**${author}**\n\n${body}\n\n_page: ${page}_`;

  const labels = [COMMENT_LABEL, pageToLabel(page)];

  const ghUrl = `${API_BASE}/repos/${repo()}/issues`;
  const res = await fetch(ghUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ title, body: issueBody, labels }),
  });
  if (!res.ok) {
    const text = await res.text();
    return ghError(res.status, `GitHub: ${text || res.statusText}`);
  }
  const issue = (await res.json()) as GhIssue;
  return NextResponse.json({ comment: toComment(issue) });
}

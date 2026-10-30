# Revival review — 2026-10-30

## Local changes

The lockfile updates @humanfs/node to 0.16.8, brace-expansion to 5.0.12,
and yaml to 2.9.1, with compatible supporting transitive dependency changes.
The initial npm audit found two moderate and one high vulnerable packages;
the updated audit found none. This covers development dependencies, not container images.

The new Validate workflow uses Node 22, locked installation without lifecycle
scripts, YAML lint, npm audit, and Compose configuration validation without
interpolating secrets or starting containers. Compose-specific lint ordering
is now scoped to compose.yml files. Renovate no longer ignores checks or
automerges major development dependency updates. Repository branch protection
has not been changed; making Validate required is a separate administrator action.

Traefik's unauthenticated dashboard flag and published port 8080 are removed.
This deliberately removes direct dashboard access; if needed, configure an
authenticated HTTPS router to api@internal before using the dashboard again.
No host has been deployed or modified.

## Open PR dispositions

- [#54 PostgreSQL 17 to 18](https://github.com/jmdarling/compose/pull/54): hold.
  The tag-only change retains the old /var/lib/postgresql/data mount. Version 18
  uses /var/lib/postgresql/18/docker and mounts /var/lib/postgresql. Choose a
  tested dump/restore or pg_upgrade plan with verified backup and rollback,
  then update the mount together with the image. Do not point 18 at the existing
  17 database and assume it will upgrade. Confirm Linkwarden compatibility.
  Source: https://raw.githubusercontent.com/docker-library/docs/master/postgres/README.md
- [#60 Uptime Kuma 1 to 2](https://github.com/jmdarling/compose/pull/60): hold
  until a maintenance window and verified offline backup of
  /appdata/uptime-kuma are available. The current mount remains appropriate;
  the first startup migrates the database and must not be interrupted. Test
  notifications, badges, and monitors on a copied database before production.
  Source: https://github.com/louislam/uptime-kuma/wiki/Migration-From-v1-To-v2
- [#81 Tinyauth 3 to 5](https://github.com/jmdarling/compose/pull/81): replace
  or extend the tag-only change with a staged v3-to-v4-to-v5 migration. Version
  4 introduces SQLite session storage and deprecates SECRET and DISABLE_CONTINUE;
  version 5 renames all configuration to TINYAUTH_<SECTION>_<KEY>. Decide the
  persistent /data location and test authentication/forward-auth on an isolated
  instance before changing the gateway. Keep the current image until then.
  Sources: https://tinyauth.app/docs/breaking-updates/3-to-4/
  and https://tinyauth.app/docs/breaking-updates/4-to-5/

All three inspected heads were mergeable but had zero check runs and zero
commit statuses. The API's combined status was pending because the status list
was empty; this is not evidence of running or failing CI. Repository Actions
history returned zero runs. No existing PR is recommended for unconditional merge.

## Remaining security visibility and operational review

The connected GitHub fetch tool rejects Dependabot alert endpoints as unsupported.
There is no dedicated security-alert tool, so Dependabot, code scanning and
secret scanning alert counts are unknown. No credentials were created or read.
A clean npm audit must not be reported as a clean GitHub security dashboard.

Several services use mutable latest tags; Watchtower updates labelled services.
Several dashboards and Traefik mount the Docker socket, and Home Assistant uses
privileged mode and host networking. Review these against actual integrations
before restricting privileges, pinning images, or changing update policy.
No container image vulnerability scan or runtime migration test was performed.

## Validation

Node v22.23.4 and standalone Compose v5.6.1 were downloaded to the task's .tools
directory and checked against upstream SHA-256 manifests. No system packages or
Docker daemon were installed. npm ci --ignore-scripts, npm run lint, npm audit,
and all 25 Compose config checks passed after the fixes. Configuration validation
does not verify image availability, migration behavior, real environment values,
or runtime connectivity. GitHub execution of the new workflow remains untested
until publication is authorized. No push, PR mutation, merge or deployment occurred.

## Fresh-install upgrade follow-up — 2026-10-30

The owner confirmed these configurations are unused and authorized the held
major upgrades. The hold decisions above describe the earlier review; the
fresh-install configurations now target PostgreSQL 18, Uptime Kuma 2 and
Tinyauth 5. No existing data or live host was migrated.

PostgreSQL 18 mounts `/appdata/linkwarden/db/postgresql` at
`/var/lib/postgresql`; its default data directory is `18/docker` underneath.
Do not reuse an existing 17 data directory without a separate dump/restore or
pg_upgrade procedure. See the [official image documentation](https://github.com/docker-library/docs/blob/master/postgres/README.md).

Tinyauth uses `TINYAUTH_UI_TITLE`, `TINYAUTH_APPURL`, and
`TINYAUTH_AUTH_USERS`, and persists its SQLite sessions in `/appdata/tinyauth`
mounted at `/data`. `TINYAUTH_HOST` and `TINYAUTH_USERS` remain Compose inputs;
the users input is a comma-separated list of `username:password_hash` entries.
The removed `SECRET` and `DISABLE_CONTINUE` settings have no replacement.
The Traefik forward-auth URL remains `/api/auth/traefik`. Existing installations
must follow the [v3-to-v4](https://tinyauth.app/docs/breaking-updates/3-to-4/)
and [v4-to-v5](https://tinyauth.app/docs/breaking-updates/4-to-5/) guides;
these fresh installations need no intermediate deployment.

Uptime Kuma retains `/app/data` persistence. Fresh v2 startup presents a database
setup screen; choose SQLite to use the mounted directory, then create the admin
account. Existing v1 users still need an offline directory backup and an
uninterrupted migration; see the [official migration guide](https://github.com/louislam/uptime-kuma/wiki/Migration-From-v1-To-v2).

The validation workflow only installs development dependencies, runs lint and
npm audit, and renders Compose configuration. It does not start or deploy
services. Checkout v7.0.1 and setup-node v7.1.0 pins were matched to upstream
release tags; setup-node's ESM and dummy NODE_AUTH_TOKEN changes do not affect
this public npm install. Node 26.13.0 was available in the official distribution
index and its downloaded archive was SHA-256 verified. The four tooling PRs
(#135–#138, including ESLint 10.14.0) passed CI and post-merge CI.

Fresh-install tests used disposable cloud containers and temporary data, with
web ports bound only to loopback. PostgreSQL 18.6 initialized in
`/var/lib/postgresql/18/docker` and preserved SQL data across restart.
Tinyauth 5.0.7 passed health, anonymous denial, invalid-login denial, valid login,
Traefik forward-auth, and authenticated session persistence after restart.
Uptime Kuma 2.5.8 passed SQLite initialization, admin creation, and login after
restart. Local Node 26 lint, npm audit (zero findings), and all 25 Compose
configuration checks passed. These checks do not validate real DNS, TLS,
notification delivery, production credentials, or old database migrations.

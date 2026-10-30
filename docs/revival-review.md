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

# Temporary minimatch security override

Reviewed on 2026-11-08.

The temporary `minimatch@^10.2.4` override selects patched `minimatch@^11.0.5`
for ESLint 10.14.0 and `@eslint/config-array` 0.23.5. It addresses
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
without downgrading ESLint or relaxing the audit check. The equivalent fixes
are merged upstream in [ESLint #21492](https://github.com/eslint/eslint/pull/21492)
and [config-array #535](https://github.com/eslint/rewrite/pull/535), but are not
in their published releases yet. The override only matches minimatch 10, so it
does not affect dependencies that already request minimatch 11.

Remove the override once both upstream fixes are released, refresh the lockfile,
and verify `npm ci --ignore-scripts`, `npm run lint`, `npm audit --audit-level=moderate`,
and the Compose validation step in CI.

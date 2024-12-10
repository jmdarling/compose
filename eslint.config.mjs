import eslintPluginYml from "eslint-plugin-yml";
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginYml.configs["flat/standard"],
  {
    rules: {
      // Empty mapping values are needed in Docker Compose files.
      "yml/no-empty-mapping-value": "off",
      "yml/sort-keys": [
        "error",
        {
          pathPattern: "^$",
          order: ["services", "networks", "volumes"],
        },
        {
          pathPattern: "^services.*$",
          order: [
            "container_name",
            "image",
            "build",
            "pull_policy",
            "deploy",
            "restart",
            "command",
            "environment",
            "networks",
            "ports",
            "volumes",
          ],
        },
      ],
    },
  },
];

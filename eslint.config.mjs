import nextPlugin from "eslint-config-next";

const eslintConfig = [
  ...(Array.isArray(nextPlugin) ? nextPlugin : [nextPlugin]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;

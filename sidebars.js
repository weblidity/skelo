const sidebars = {
  "Introduction": [
    "index.md",
    {
      "type": "category",
      "label": "Getting Started",
      "items": [
        "getting-started/installation.md",
        "getting-started/configuration.md"
      ]
    }
  ],
  "Guides": [
    "guides/overview.md",
    "guides/advanced-usage.md"
  ],
  "API Reference": [
    "api/introduction.md",
    {
      "type": "category",
      "label": "Core Modules",
      "items": [
        "api/core/module1.md",
        "api/core/module2.md"
      ]
    }
  ]
};

module.exports = sidebars;

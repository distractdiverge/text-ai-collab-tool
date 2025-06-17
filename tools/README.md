# Tool Schemas

This directory contains individual tool schema definitions that are combined into the final `tools.json` file.

## Adding a New Tool

1. Create a new JSON file in the `schemas` directory with the following structure:

```json
{
  "name": "tool_name",
  "description": "Brief description of what the tool does.",
  "schema": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "properties": {
      "property1": {
        "type": "string",
        "description": "Description of the property"
      }
    },
    "required": ["property1"],
    "type": "object"
  }
}
```

2. Run the build script:

```bash
npm run build:tools
```

This will update the `prompt_assets/tools.json` file with your new tool definition.

## File Naming

Name your schema files after the tool name, e.g., `grammar_style_check.json`.

## Schema Validation

Each schema should be a valid JSON Schema (draft-07). The build script will validate the schema before including it in the final output.

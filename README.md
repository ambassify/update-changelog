# @ambassify/update-changelog

Autoamtically update CHANGELOG.md files whenever you update your package's npm version.

## Requirements

- This script searches for a `package.json` file in the current directory
- The `package.json` file must contain a version field
- A CHANGELOG.md file that has the same structure as [our template](CHANGELOG.template.md)

## Usage

During development, keep track of changes by adding them to the `## unreleased` section of your CHANGELOG.md file.

To generate a CHANGELOG.md file in a new repository, you can run `npx @ambassify/update-changelog` from your terminal inside the project directory.

Afterwards, every time you run `npx @ambassify/update-changelog`, it will replace the `## unreleased` section with a new section matching the version number from `package.json`.

The easiest way is to add the snippet below to your `package.json`. It will trigger the script every time you run `npm version`.

```json
{
    "scripts": {
        "version": "npx @ambassify/update-changelog"
    }
}
```

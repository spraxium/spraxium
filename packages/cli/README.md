# @spraxium/cli

The Spraxium CLI is the primary development tool for bootstrapping and managing Spraxium projects. It handles everything from project creation to running your bot in watch mode, keeping the developer workflow contained to a single command namespace. The `spraxium new` command scaffolds a complete project structure with the correct configuration, file layout, and dependencies so you can start writing bot logic immediately without any manual setup.

Beyond project creation, the CLI provides code generation for modules, services, and listeners, eliminating most of the boilerplate involved in adding new features to an existing project. The `database` command adds a supported database driver and its configuration files to an existing project, while `info` prints a full diagnostic snapshot of your Node.js environment and Spraxium package versions: useful when debugging or filing an issue.

Development mode uses Node.js module hooks with SWC directly. This preserves legacy decorator metadata while avoiding a runtime dependency on the TypeScript compiler API, so projects can use current TypeScript and Node.js releases independently.

## Installation

```bash
npm install -g @spraxium/cli
```

## Commands

| Command | Description |
|---|---|
| `spraxium new <name>` | Scaffold a new Spraxium project |
| `spraxium generate <type> <name>` | Generate a module, service, task, boot-service, or listener |
| `spraxium build` | Build the project for production |
| `spraxium dev` | Start the bot in watch mode |
| `spraxium start` | Start the built project |
| `spraxium database` | Add a database driver to the project |
| `spraxium info` | Print environment and project diagnostics |
| `spraxium use <version>` | Install `next`, `stable`, or an exact Spraxium version across the project |

## Usage

```bash
# Create a new project
spraxium new my-bot

# Generate a module inside an existing project
spraxium generate module moderation

# Run in development mode with watch and auto-restart
spraxium dev
```

### Switching Spraxium releases

Run `use` from your bot directory. The CLI resolves `next` or `latest` from the Spraxium Core package and checks that the same release is available for every Spraxium dependency declared in the bot. It pins the packages to that exact version and updates the project's lockfile. The npm CLI is used for registry metadata, including scope-specific settings in `.npmrc`.

```bash
spraxium use next --dry-run
spraxium use next
spraxium use stable
```

Pass an exact version to reproduce a previous build. For example, `spraxium use 1.0.0-dev.42` selects that build if it is published in your registry. Once a preview CLI is available, `pnpm dlx @spraxium/cli@next use next` also works from a bot with an older CLI.

## Links

[npm](https://www.npmjs.com/package/@spraxium/cli) · [GitHub](https://github.com/spraxium/spraxium) · [Documentation](https://spraxium.com)

## License

Apache 2.0

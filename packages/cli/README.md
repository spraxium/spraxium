# @spraxium/cli

The Spraxium CLI is the primary development tool for bootstrapping and managing Spraxium projects. It handles everything from project creation to running your bot in watch mode, keeping the developer workflow contained to a single command namespace. The `spraxium new` command scaffolds a complete project structure with the correct configuration, file layout, and dependencies so you can start writing bot logic immediately without any manual setup.

Beyond project creation, the CLI provides code generation for modules, services, and listeners, eliminating most of the boilerplate involved in adding new features to an existing project. The `database` command adds a supported database driver and its configuration files to an existing project, while `info` prints a full diagnostic snapshot of your Node.js environment and Spraxium package versions — useful when debugging or filing an issue.

## Installation

```bash
npm install -g @spraxium/cli
```

## Commands

| Command | Description |
|---|---|
| `spraxium new <name>` | Scaffold a new Spraxium project |
| `spraxium generate <type> <name>` | Generate a module, service, or listener |
| `spraxium build` | Build the project for production |
| `spraxium dev` | Start the bot in watch mode |
| `spraxium start` | Start the built project |
| `spraxium database` | Add a database driver to the project |
| `spraxium info` | Print environment and project diagnostics |

## Usage

```bash
# Create a new project
spraxium new my-bot

# Generate a module inside an existing project
spraxium generate module moderation

# Run in development mode with watch and auto-restart
spraxium dev
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/cli) · [GitHub](https://github.com/spraxium/spraxium) · [Documentation](https://spraxium.com)

## License

Apache 2.0

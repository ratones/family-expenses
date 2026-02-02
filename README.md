# Family Expenses

A desktop application for managing family expenses built with Electron and Angular.

## Installation

### macOS
Download the latest DMG from [Releases](https://github.com/ratones/family-expenses/releases).

**Important:** On first launch, macOS may show a "damaged" warning. To fix this, open Terminal and run:
```bash
xattr -cr "/Applications/Family Expenses.app"
```
Then try opening the app again.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Update version in package.json first (optional)
# Then create and push new tag:
git tag v1.0.2  # or v1.1.0, v2.0.0, etc.
git push origin v1.0.2
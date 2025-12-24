# Node.js Requirements

## Minimum Version Requirements

This project requires:
- **Node.js**: >= 22.0.0 (LTS recommended)
- **npm**: >= 10.0.0

## Why Node.js 22+?

The Capacitor CLI (version 8.0.0 and above) requires Node.js version 22.0.0 or higher to function properly. This is necessary for:
- Building mobile applications (iOS and Android)
- Running Capacitor sync operations
- Managing native platform integrations

## Current Environment

- **Installed Node.js**: v22.21.1
- **Installed npm**: v10.9.4
- **Capacitor CLI**: v8.0.0

## Installing Node.js

### Using NVM (Node Version Manager) - Recommended

If you use NVM, the project includes a `.nvmrc` file that automatically specifies the required Node.js version:

```bash
# Install the version specified in .nvmrc
nvm install

# Use the version specified in .nvmrc
nvm use
```

### Manual Installation

Download Node.js 22 LTS from the official website:
- https://nodejs.org/

Or use your system's package manager:

**macOS (Homebrew):**
```bash
brew install node@22
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Download the installer from https://nodejs.org/ or use Chocolatey:
```bash
choco install nodejs-lts
```

## Verifying Installation

After installation, verify your Node.js and npm versions:

```bash
node --version
# Should output: v22.x.x or higher

npm --version
# Should output: v10.x.x or higher
```

## CI/CD Configuration

All GitHub Actions workflows are configured to use Node.js 22:
- CI Build & Type Check: Node.js 22.x
- Android Build: Node.js 22
- GitHub Pages Deploy: Node.js 22
- Auto Deploy: Node.js 22

## Troubleshooting

### Error: "The Capacitor CLI requires NodeJS >=22.0.0"

If you see this error:
1. Check your current Node.js version: `node --version`
2. If it's lower than 22.0.0, upgrade Node.js
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and `package-lock.json`
5. Reinstall dependencies: `npm install`

### Multiple Node.js Versions

If you need to manage multiple Node.js versions for different projects, we recommend using:
- **NVM** (Node Version Manager) for macOS/Linux
- **nvm-windows** for Windows

With NVM, you can easily switch between Node.js versions per project.

## Package.json Configuration

The `package.json` includes an `engines` field that specifies these requirements:

```json
{
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  }
}
```

This ensures that anyone installing the project will be warned if they don't meet the minimum requirements.

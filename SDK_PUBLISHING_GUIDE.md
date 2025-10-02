# 📦 SDK Publishing Guide

Guide for publishing the WhatsApp Flow API SDK to NPM registry.

## 🔧 Prerequisites

1. **NPM Account**: Create account at https://www.npmjs.com
2. **NPM CLI**: Install with `npm install -g npm`
3. **Login**: Run `npm login` and enter credentials

## 📋 Publishing Steps

### 1. Prepare the Package

```bash
cd sdks/nodejs-sdk

# Install dependencies
npm install

# Run tests (if available)
npm test

# Check package for issues
npm audit
```

### 2. Update Package Version

```bash
# For patch release (1.0.0 -> 1.0.1)
npm version patch

# For minor release (1.0.0 -> 1.1.0)
npm version minor

# For major release (1.0.0 -> 2.0.0)
npm version major
```

### 3. Publish to NPM

```bash
# Dry run to check what will be published
npm publish --dry-run

# Publish to NPM
npm publish

# For scoped packages (if using @yourorg/package-name)
npm publish --access public
```

### 4. Verify Publication

```bash
# Check if package is available
npm view whatsapp-flow-api-sdk

# Install in a test project
mkdir test-install
cd test-install
npm init -y
npm install whatsapp-flow-api-sdk
```

## 🔄 Alternative: Local Installation

Until the package is published to NPM, users can install it locally:

### Method 1: From Local Directory

```bash
# In the user's project directory
npm install /path/to/whatsapp_flow/sdks/nodejs-sdk
```

### Method 2: From Git Repository

```bash
# Install directly from GitHub (once pushed)
npm install git+https://github.com/yourusername/whatsapp-flow.git#main:sdks/nodejs-sdk
```

### Method 3: Create Tarball

```bash
# In the SDK directory
cd sdks/nodejs-sdk
npm pack

# This creates whatsapp-flow-api-sdk-1.0.0.tgz
# Users can install with:
# npm install /path/to/whatsapp-flow-api-sdk-1.0.0.tgz
```

## 📝 Package.json Configuration

Current configuration in `sdks/nodejs-sdk/package.json`:

```json
{
  "name": "whatsapp-flow-api-sdk",
  "version": "1.0.0",
  "description": "Node.js SDK for WhatsApp Flow API Platform",
  "main": "src/index.js",
  "keywords": [
    "whatsapp",
    "api",
    "sdk",
    "messaging",
    "automation",
    "whatsapp-flow",
    "chat-api",
    "business-messaging"
  ],
  "author": "WhatsApp Flow Team",
  "license": "MIT"
}
```

## 🔒 Security Considerations

1. **API Keys**: Never include real API keys in examples
2. **Dependencies**: Keep dependencies up to date
3. **Vulnerabilities**: Run `npm audit` regularly
4. **Access Control**: Use appropriate NPM access levels

## 📊 Usage Analytics

After publishing, monitor usage with:

```bash
# View download statistics
npm view whatsapp-flow-api-sdk

# Check package info
npm info whatsapp-flow-api-sdk
```

## 🔄 Update Process

For future updates:

1. Make changes to the SDK
2. Update version: `npm version patch/minor/major`
3. Publish: `npm publish`
4. Update documentation
5. Notify users of changes

## 🌐 Distribution Alternatives

### GitHub Packages

```bash
# Configure for GitHub Packages
npm config set @yourusername:registry https://npm.pkg.github.com

# Publish to GitHub Packages
npm publish
```

### Private Registry

```bash
# Configure private registry
npm config set registry https://your-private-registry.com

# Publish to private registry
npm publish
```

## 📋 Checklist Before Publishing

- [ ] Package name is available on NPM
- [ ] Version number is updated
- [ ] README.md is complete and accurate
- [ ] All dependencies are properly listed
- [ ] Tests pass (if available)
- [ ] No security vulnerabilities
- [ ] License is specified
- [ ] Keywords are relevant
- [ ] Examples work correctly

## 🚀 Quick Publish Commands

```bash
# Complete publish workflow
cd sdks/nodejs-sdk
npm install
npm audit fix
npm version patch
npm publish
```

## 📞 Support

If you encounter issues:

1. Check NPM documentation: https://docs.npmjs.com
2. Verify package name availability: https://www.npmjs.com/package/whatsapp-flow-api-sdk
3. Contact NPM support if needed

## 🎯 Next Steps

1. **Publish to NPM**: Follow the steps above
2. **Update Installation Guide**: Update `SDK_INSTALLATION_GUIDE.md` with correct install command
3. **Test Installation**: Verify the package works when installed from NPM
4. **Monitor Usage**: Track downloads and user feedback

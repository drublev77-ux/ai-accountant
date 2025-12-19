# ESLint Configuration Structure

This directory contains a modular ESLint configuration system designed for maintainability and specific use cases.

## 📁 Structure Overview

```
config/eslint/
├── index.js                    # Main entry point and configuration combiner
├── base.config.js             # Shared base configuration and utilities
├── eslint.mcp.config.js       # MCP integration validation rules
├── eslint.radix.config.js     # Radix UI component validation
├── validate-configs.js        # Configuration validation script
├── rules/
│   ├── mcp-integration.js     # Custom MCP validation rules
│   └── radix-ui.js           # Custom Radix UI component rules
└── README.md                  # This documentation
```

## 🎯 Configuration Purposes

### **Base Configuration** (`base.config.js`)
- **Purpose**: Common settings shared across all configurations
- **Exports**: `commonGlobals`, `commonIgnores`, `commonLanguageOptions`
- **Features**: 
  - Centralized globals management
  - Consistent parser configuration
  - Standard ignore patterns
  - Generated code handling (DAL/ORM)

### **MCP Configuration** (`eslint.mcp.config.js`)
- **Purpose**: Validates MCP integrations for proper testing
- **Usage**: `npm run eslint:mcp`
- **Key Features**:
  - Enforces verification comments on MCP calls
  - Detects commonly assumed parameter names
  - Prevents integration failures from untested endpoints

### **Radix Configuration** (`eslint.radix.config.js`)
- **Purpose**: Validates Radix UI component usage
- **Usage**: `npm run eslint:radix` (runs in build process)
- **Key Features**:
  - Prevents empty SelectItem values
  - Ensures proper Radix component patterns

## 🚀 Usage

### NPM Scripts
```bash
# Run all standard linting (includes Radix validation)
npm run check

# Run MCP-specific validation
npm run eslint:mcp

# Run only Radix validation
npm run eslint:radix

# Validate all ESLint configurations are working
npm run eslint:validate
```

### Direct Usage
```bash
# Use specific configuration
npx eslint src --config config/eslint/eslint.mcp.config.js

# Use combined configuration
npx eslint src --config config/eslint/index.js
```

## 🔧 Adding New Rules

### 1. Custom Rules
Create rules in `rules/` directory (all rules now use ES modules):
```javascript
// rules/my-custom-rule.js
export default {
  "my-rule": {
    meta: { 
      type: "problem",
      docs: {
        description: "Description of what this rule does",
        category: "Best Practices",
        recommended: true,
      },
      messages: {
        myMessage: 'Error message for the rule violation'
      }
    },
    create(context) { 
      return {
        // Rule implementation
        JSXElement(node) {
          // Your rule logic here
        }
      }
    }
  }
};
```

### 2. New Configuration
Create specialized config files:
```javascript
// eslint.my-feature.config.js
import { commonIgnores, commonLanguageOptions } from './base.config.js';
import myRules from './rules/my-custom-rule.js';

export default [
  {
    ignores: commonIgnores,
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: commonLanguageOptions,
    plugins: {
      'my-plugin': { rules: myRules }
    },
    rules: {
      'my-plugin/my-rule': 'error'
    }
  }
];
```

### 3. Update Index
Add to `index.js`:
```javascript
import myFeatureConfig from './eslint.my-feature.config.js';
export { myFeatureConfig };
```

## 🎨 Design Principles

### **1. DRY (Don't Repeat Yourself)**
- Common configurations are centralized in `base.config.js`
- Shared utilities prevent duplication
- Consistent patterns across all configs

### **2. Separation of Concerns**
- Each configuration has a specific purpose
- Rules are grouped by functionality
- Clear boundaries between different validation types

### **3. Maintainability**
- Well-documented with clear purposes
- Modular structure allows easy updates
- Centralized dependencies reduce maintenance overhead

### **4. Extensibility**
- Easy to add new configurations
- Plugin architecture supports custom rules
- Base configuration provides solid foundation

## 🔍 Troubleshooting

### Common Issues

**Issue**: Rules not applying
```bash
# Check which config is being used
npx eslint --print-config src/components/MyComponent.tsx
```

**Issue**: Import errors in configurations
```bash
# Ensure all imports use correct file extensions for ES modules
import config from './base.config.js'; // ✅ Correct
import config from './base.config';     // ❌ Incorrect
```

**Issue**: Custom rules not found
- Verify rule export format matches plugin expectations
- Check file paths in import statements
- Ensure rules are properly registered in plugins object

### Performance Tips
- Use specific file patterns to reduce linting scope
- Leverage ignore patterns for generated files
- Consider splitting large rule sets into focused configurations

## 📚 References

- [ESLint Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Custom Rules Guide](https://eslint.org/docs/latest/extend/custom-rules)
- [Plugin Development](https://eslint.org/docs/latest/extend/plugins) 
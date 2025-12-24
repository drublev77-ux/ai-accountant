#! /usr/bin/env tsx
// a cli command to write or update `export const FOO = "bar"` in certain file
// usage: code-helper-write-constant <file> <constant> <value>
// example: code-helper-write-constant src/components/api/api.ts FOO "bar"
// example: code-helper-write-constant src/components/api/api.ts FOOBAR.abc "value"

import { writeFile, mkdir, readFile } from "node:fs/promises"
import { dirname } from "node:path"
import * as babel from "@babel/core"
const t = babel.types;

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error("Error: incorrect number of arguments");
    console.error("Usage: code-helper-write-constant <file> <constant> <value>");
    console.error('Example: code-helper-write-constant src/components/api/api.ts FOO "bar"');
    console.error('Example: code-helper-write-constant src/components/api/api.ts FOOBAR.abc "value"');
    console.error('Example: code-helper-write-constant src/components/api/api.ts FOOBAR.test-test2345 "value"');
    process.exit(1);
  }

  const [filePath, constantName, value] = args;

  // Check if constant name contains a dot (object property syntax)
  const hasDot = constantName.includes(".");
  let baseConstantName = constantName;
  let propertyPath: string[] = [];

  if (hasDot) {
    const parts = constantName.split(".");
    baseConstantName = parts[0];
    propertyPath = parts.slice(1);
  }

  // Validate constant name (standard format)
  // Only validate the base name (before the dot), not the property path
  if (!baseConstantName || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(baseConstantName)) {
    console.error(`Error: constant name "${baseConstantName}" must be lowercase letters, uppercase letters, numbers, and underscores only`);
    process.exit(1);
  }

  await mkdir(dirname(filePath), { recursive: true });
  let fileContent = await readFile(filePath, "utf-8").catch(() => "");

  const result = upsertConstant(fileContent, baseConstantName, propertyPath, value);
  await writeFile(filePath, result, "utf-8");

  console.log(`Successfully wrote ${constantName} = "${value}" to ${filePath}`);
}

function upsertConstant(fileContent: string, constantName: string, propertyPath: string[], value: string) {

  let found = false;
  let get: () => babel.types.Expression | null = () => null;
  let set: (node: babel.types.Expression) => void = () => { };

  const plugin: babel.PluginObj = {
    name: "platform-code-helper-write-constant",
    visitor: {
      VariableDeclarator(path) {
        if (path.parentPath.parent.type !== "ExportNamedDeclaration") return;
        if (!path.get("id").isIdentifier({ name: constantName })) return;

        get = (): babel.types.Expression | null => path.node.init ?? null;
        set = (t: babel.types.Expression) => { path.set("init", t); }

        found = true;
      },
      Program: {
        exit(path) {
          if (!found) {
            const declarator = t.variableDeclarator(t.identifier(constantName), t.objectExpression([]));
            const decl = t.variableDeclaration("const", [declarator]);
            const exportDecl = t.exportNamedDeclaration(decl, [t.exportSpecifier(t.identifier(constantName), t.identifier(constantName))]);

            get = () => declarator.init ?? null;
            set = (node) => { declarator.init = node; }

            path.node.body.push(exportDecl);
          }

          for (const propName of propertyPath) {
            let obj = get();
            if (!t.isObjectExpression(obj)) set(obj = t.objectExpression([]));

            let prop = obj.properties.find(p => t.isObjectProperty(p) && (
              (t.isIdentifier(p.key) && p.key.name === propName) ||
              (t.isStringLiteral(p.key) && p.key.value === propName)
            )) as babel.types.ObjectProperty | undefined;
            if (!prop) {
              prop = t.objectProperty(t.stringLiteral(propName), t.objectExpression([]));
              obj.properties.push(prop);
            }

            get = () => prop.value as babel.types.Expression | null;
            set = (node) => { prop.value = node; }
          }

          set(t.stringLiteral(value));
        }
      }
    },
  }

  const out = babel.transformSync(fileContent, {
    plugins: [
      ["@babel/plugin-syntax-typescript", { isTSX: true }],
      [plugin]
    ],
  });

  if (!out || !out.code) throw new Error("Failed to parse file");
  return out.code;
}

// Test code (commented out)
// console.log(upsertConstant(`export const FOO = {};`, "FOO", ["bb", "tese", "aaa"], "hellobb"));

main();

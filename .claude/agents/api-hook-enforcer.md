---
name: api-hook-enforcer
description: Generates production-ready React hooks with comprehensive TypeScript interfaces for API calls, using JSON schemas and auto-generated TypeScript types.
tools: Bash, Glob, Grep, LS, Read, Edit, MultiEdit, Write, TodoWrite
model: sonnet
---

Transform OpenAPI JSON schemas and auto-generated TypeScript types into production-ready React hooks with proper type handling and error management.

## Workflow

**ALWAYS follow these steps:**

1. **Analyze API Client**:
   - Read `src/sdk/api-clients/${apiName}/types.gen.ts` to find available methods, signatures, and type definitions
   - Optional: Read `spec/platform-sdk/api-schemas/${apiName}.json` for API contract details

2. **Choose Hook Type**:
   - **`useQuery`**: Read-only/idempotent operations (GET, or POST without side effects like search)
   - **`useMutation`**: Operations that change server state (create, update, delete)

3. **Implement Hook** at `src/hooks/use-${api-name}.ts`:
   - Design clean input/output interfaces (only when generated types need transformation)
   - Add validation, error handling, and stable query keys (for useQuery)
   - Keep it simple - avoid over-abstraction and complex transformations

4. **Avoid Common Mistakes**:
   - ❌ NEVER use React hooks at module level
   - ❌ NEVER call hooks outside React components/hooks
   - ❌ NEVER create unnecessary abstractions

## Hook Examples

Follow the instructions in `types.gen.ts` to send requests and read responses.

### Query Hook Example

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { postV1AiZ3 } from '@/sdk/api-clients/SearchWeb';

export interface SearchWebInput {
  searchWord: string;
}

export interface SearchWebResponse {
  searchResults: Array<{ title: string; url: string; snippet: string }>;
}

export function useSearchWebQuery(
  input: SearchWebInput
): UseQueryResult<SearchWebResponse, Error> {
  return useQuery({
    queryKey: ['search-web', input.searchWord],
    queryFn: async (): Promise<SearchWebResponse> => {
      const response = await postV1AiZ3({ body: { word: input.searchWord } });

      if (response.error) {
        throw new Error(response.error.message || 'Search failed');
      }

      return { searchResults: response.data?.results || [] };
    },
    enabled: Boolean(input.searchWord),
  });
}
```

### Mutation Hook Example

```typescript
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { postV1Upload } from '@/sdk/api-clients/UploadFiles';

export interface UploadFileInput {
  file: File;
  metadata?: { description?: string; tags?: string[] };
}

export interface UploadFileResponse {
  uploadedUrl: string;
  fileId: string;
}

export function useUploadFileMutation(): UseMutationResult<
  UploadFileResponse,
  Error,
  UploadFileInput
> {
  return useMutation({
    mutationFn: async (input: UploadFileInput): Promise<UploadFileResponse> => {
      if (!input.file || !(input.file instanceof File)) {
        throw new Error('Valid file object is required');
      }

      const response = await postV1Upload({
        body: { file: input.file, metadata: input.metadata },
      });

      if (response.error) {
        throw new Error(response.error.message || 'File upload failed');
      }

      if (!response.data?.url) {
        throw new Error('No upload URL returned from server');
      }

      return {
        uploadedUrl: response.data.url,
        fileId: response.data.fileId || '',
      };
    },
  });
}
```

## Requirements

Your generated hook file (`src/hooks/use-{api-name}.ts`) MUST include:

1. **TypeScript Interfaces**: Clean input/output interfaces with descriptive names (only when needed)

2. **Proper Types**:
   - Queries: `UseQueryResult<TData, TError>`
   - Mutations: `UseMutationResult<TData, TError, TVariables>`
   - Use `type` keyword for imports

3. **Stable Query Keys** (useQuery only): `['resource-name', ...primitiveParams]` (primitives only, no objects)

4. **Error Handling**: Check `response.error`, validate data exists, provide fallbacks

5. **Input Validation**: Validate required fields, use `enabled` for useQuery

6. **Naming**: `use{ApiName}Query` or `use{ApiName}Mutation` (PascalCase)

## Task Completion

**CRITICAL**: Your ONLY task is to create `src/hooks/use-{api-name}.ts`.

✅ **Do**: Write production-ready, self-contained hook file with all required elements
❌ **Don't**: Create utilities, examples, tests, docs, or run type checking

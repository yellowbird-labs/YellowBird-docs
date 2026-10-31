import defaultMdxComponents from 'fumadocs-ui/mdx';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import type { MDXComponents } from 'mdx/types';
import { PipelineStack } from '@/components/pipeline-stack';
import { Mermaid } from '@/components/Mermaid';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    PipelineStack,
    Mermaid,
    ...components,
  } satisfies MDXComponents;
}

export default getMDXComponents({ wrapper: DocsBody });

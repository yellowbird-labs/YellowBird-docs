import { type SerializedPageTree, useFumadocsLoader } from 'fumadocs-core/source/client';
import type { TOCItemType } from 'fumadocs-core/toc';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Provider, type ProviderProps } from '@/components/provider';
import { PageActions } from '@/components/PageActions';
import { baseOptions } from '@/lib/layout.shared';

export interface DocsProps extends ProviderProps {
  tree: SerializedPageTree;
  title: string;
  description?: string;
  toc: TOCItemType[];
  rawMdx?: string;
  lastModified?: string;
}

export function Docs({
  tree,
  title,
  description,
  toc,
  children,
  pathname,
  rawMdx,
  lastModified,
  ...props
}: DocsProps) {
  const data = useFumadocsLoader({ tree });
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const home = pathname.replace(/\/$/, '') === base;

  return (
    <Provider pathname={pathname} {...props}>
      <DocsLayout {...baseOptions()} tree={data.tree}>
        <DocsPage toc={toc}>
          {home ? null : (
            <nav className="docs-crumb" aria-label="Breadcrumb">
              <a href={base}>Docs</a>
              <span aria-hidden="true">/</span>
              <span>{title}</span>
            </nav>
          )}
          <DocsTitle>{title}</DocsTitle>
          {description ? <DocsDescription>{description}</DocsDescription> : null}
          <PageActions
            title={title}
            description={description}
            rawMdx={rawMdx}
            lastModified={lastModified}
          />
          <DocsBody>{children}</DocsBody>
        </DocsPage>
      </DocsLayout>
    </Provider>
  );
}

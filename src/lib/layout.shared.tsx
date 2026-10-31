import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { GithubIcon } from '@/components/icona/github';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'YellowBird',
      url: import.meta.env.BASE_URL,
    },
    themeSwitch: {
      enabled: true,
    },
    links: [
      {
        type: 'icon',
        icon: <GithubIcon size={18} />,
        text: 'GitHub',
        label: 'YellowBird repository on GitHub',
        url: 'https://github.com/dexisback/YellowBird',
        external: true,
      },
    ],
  };
}

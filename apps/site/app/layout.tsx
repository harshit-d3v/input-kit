import type { Metadata } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'input-kit — headless React primitives',
    template: '%s · input-kit',
  },
  description:
    'A catalog of 42 headless, unstyled React primitives. Every package ships behaviour, state, and ARIA wiring — and no CSS. Live demos for each.',
  metadataBase: new URL('https://input-kit.vercel.app'),
  openGraph: {
    title: 'input-kit — headless React primitives',
    description:
      'A catalog of 42 headless, unstyled React primitives. Behaviour and ARIA, no CSS. Live demos for each.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <div className="shell">
          <header className="topbar">
            <a className="wordmark" href="/">
              input<em>-kit</em>
            </a>
            <nav aria-label="Primary">
              <a href="/#catalog">Catalog</a>
              <a href="https://www.npmjs.com/org/input-kit" rel="noreferrer noopener">
                npm
              </a>
              <a href="https://github.com/harshit-d3v/input-kit" rel="noreferrer noopener">
                GitHub
              </a>
            </nav>
          </header>
          {children}
          <footer className="foot">
            <span>MIT © Harshit Prakash</span>
            <span>
              <a href="https://github.com/harshit-d3v/input-kit">Source</a> ·{' '}
              <a href="https://github.com/harshit-d3v/input-kit/issues">Issues</a> ·{' '}
              <a href="https://www.npmjs.com/org/input-kit">npm org</a>
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}

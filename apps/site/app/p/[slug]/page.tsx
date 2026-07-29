import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DemoMount } from '../../../components/DemoMount';
import { bySlug, packages } from '../../../lib/registry';

const REPO = 'https://github.com/harshit-d3v/input-kit';

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = bySlug.get(slug);
  if (!pkg) return { title: 'Not found' };
  return {
    title: pkg.name,
    description: pkg.description,
  };
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = bySlug.get(slug);
  if (!pkg) notFound();

  return (
    <main className="detail">
      <a className="crumb" href="/#catalog">
        ← All packages
      </a>

      <h1>
        <span>@input-kit/</span>
        {pkg.slug}
      </h1>
      <p className="detail-desc">{pkg.description}</p>

      <div className="meta-row">
        <span>v{pkg.version}</span>
        <span>{pkg.exportNames.length} exports</span>
        <span>{pkg.srcLines.toLocaleString()} lines of source</span>
        <span>
          {pkg.hasTests ? `${pkg.testLines.toLocaleString()} lines of tests` : 'no tests yet'}
        </span>
        <a href={`https://www.npmjs.com/package/${pkg.name}`} rel="noreferrer noopener">
          npm
        </a>
        <a href={`${REPO}/tree/main/packages/${pkg.slug}`} rel="noreferrer noopener">
          source
        </a>
      </div>

      <div className="install">
        <span className="tag">npm</span>
        <code>npm install {pkg.name}</code>
      </div>

      {!pkg.hasTests && (
        <p className="note" style={{ marginTop: '2rem' }}>
          <strong>This package has no automated tests yet.</strong> The implementation works and the
          demo below is live, but there is no suite guarding it. Adding one is the most useful
          contribution available here —{' '}
          <a href={`${REPO}/blob/main/CONTRIBUTING.md`}>see CONTRIBUTING</a>.
        </p>
      )}

      {pkg.isStubDemo && (
        <p className="note">
          <strong>This demo is still a placeholder.</strong> It lists the package&rsquo;s exports
          rather than exercising them. A proper interactive demo is pending.
        </p>
      )}

      <p className="section-label" style={{ marginTop: '2.5rem' }}>
        Live demo
      </p>
      <div className="specimen">
        <div className="specimen-bar">
          <b aria-hidden="true" />
          <span>
            packages/{pkg.slug}/test-demo/demo.tsx — running against src, unstyled by the package
          </span>
        </div>
        <div className="specimen-body">
          <DemoMount slug={pkg.slug} />
        </div>
      </div>

      {pkg.exportNames.length > 0 && (
        <>
          <p className="section-label">Exports</p>
          <ul className="exports">
            {pkg.exportNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </>
      )}

      {pkg.deps.length > 0 && (
        <>
          <p className="section-label">Runtime dependencies</p>
          <ul className="exports">
            {pkg.deps.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

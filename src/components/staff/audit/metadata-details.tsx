export function MetadataDetails({ metadata }: { metadata: unknown }) {
  if (metadata === null || metadata === undefined) {
    return <span className="text-text-secondary text-xs">—</span>;
  }

  return (
    <details>
      <summary className="text-accent-primary cursor-pointer text-xs underline-offset-4 hover:underline">
        View details
      </summary>
      <pre className="bg-bg-elevated text-text-secondary mt-2 max-w-md overflow-x-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </details>
  );
}

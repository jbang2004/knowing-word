import type { ComponentItem } from "../data/catalog-types";
import { components } from "../data/component-index";
import { homeCandidates } from "../data/home-index.generated";
import ComponentRoute from "../features/components/component-route";
import { safeInternalReturnPath } from "../lib/navigation";

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ComponentRoute
      components={components as ComponentItem[]}
      characters={homeCandidates.words}
      initialComponentId={typeof params.component === "string" ? params.component : undefined}
      returnTo={safeInternalReturnPath(params.returnTo)}
    />
  );
}

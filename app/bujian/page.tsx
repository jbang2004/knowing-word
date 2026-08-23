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
      initialComponentId={typeof params.component === "string" ? params.component : undefined}
      returnTo={safeInternalReturnPath(params.returnTo)}
    />
  );
}

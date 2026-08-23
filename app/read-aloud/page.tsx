import { ReadAloudRoute } from "../features/tools/utility-routes";
import { safeInternalReturnPath } from "../lib/navigation";

export default async function ReadAloudPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const returnTo = safeInternalReturnPath(params.returnTo);
  return <ReadAloudRoute returnTo={returnTo} />;
}

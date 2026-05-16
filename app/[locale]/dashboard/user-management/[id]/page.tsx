import { UserAccountDetailView } from "../_components/user-account-detail-view"

export default async function UserAccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <UserAccountDetailView accountId={id} />
}
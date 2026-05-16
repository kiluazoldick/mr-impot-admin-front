import { DocumentForm } from "../_components/document-form";

export default async function ViewDocumentPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <DocumentForm documentId={id} isViewMode={true} />;
}

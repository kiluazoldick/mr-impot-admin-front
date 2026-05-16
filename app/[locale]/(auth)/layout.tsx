import LocaleSwitcher from "@/components/macro_componets/localeswitcher";
import Sidebar from "./_components/sidebar";

type AuthLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({
  children,
  params,
}: Readonly<AuthLayoutProps>) {
  // Plus besoin de vérifier les tokens ici
  // La vérification se fera côté client dans le dashboard layout

  return (
    <div className="flex min-h-screen w-full relative">
      <div className="absolute top-4 right-4 z-50">
        <LocaleSwitcher />
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <Sidebar />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

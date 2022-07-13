type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <section className="flex h-screen w-full flex-wrap items-center justify-center bg-gray-50 dark:bg-gray-900">
      {children}
    </section>
  );
}

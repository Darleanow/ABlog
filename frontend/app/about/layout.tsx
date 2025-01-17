export default function AboutLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center">
      <div>{children}</div>
    </section>
  );
}

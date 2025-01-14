export default function BlogLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <section className="flex flex-col -mt-12"> {children} </section>;
}

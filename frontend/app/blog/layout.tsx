export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="flex flex-col ml-16 -mt-12"> {children} </section>;
}

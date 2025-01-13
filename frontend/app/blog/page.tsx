"use client";

import { Tabs, Tab } from "@nextui-org/tabs";

export default function BlogPage() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <Tabs variant={"underlined"}>
          <Tab key="it" title="IT" />
          <Tab key="data-science" title="Data Science" />
          <Tab key="cpp" title="C++" />
        </Tabs>
      </div>
    </section>
  );
}

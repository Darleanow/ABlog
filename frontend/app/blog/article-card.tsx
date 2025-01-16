import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import Link from "next/link";
import { Clock } from "lucide-react";

import { Category } from "@/lib/models/category";
import { Article } from "@/lib/models/article";

const ArticleCard = ({ article }: { article: Article }) => {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link className="block h-full" href={`/blog/${article.slug}`}>
      <Card
        className={`h-ful hover:shadow-lg transition-all duration-300`}
        shadow="sm"
      >
        <CardHeader className="p-0">
          <div className="relative w-full pt-[56.25%]">
            <Image
              removeWrapper
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              src={article.featured_image_url ?? undefined}
            />
          </div>
        </CardHeader>

        <CardBody className="gap-4 p-4">
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.categories.map((category: Category) => (
                <Chip
                  key={category.id}
                  className="text-xs"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  {category.name}
                </Chip>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h3 className={`font-semibold line-clamp-2`}>{article.title}</h3>

            {article.excerpt && (
              <p className="text-gray-600 line-clamp-3 text-sm">
                {article.excerpt}
              </p>
            )}
          </div>
        </CardBody>

        <CardFooter className="gap-3 p-4 pt-0">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock size={16} />
            <span>{formattedDate}</span>
          </div>

          <Button className="ml-auto" color="primary" size="sm" variant="light">
            Read more
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ArticleCard;

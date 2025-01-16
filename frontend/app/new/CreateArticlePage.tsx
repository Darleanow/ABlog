import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import Editor from "./Editor";

import { ArticlesApi } from "@/lib/api/articles-api";
import { ImageApi } from "@/lib/api/image-api";

interface Article {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
}

const CreateArticlePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageApi = new ImageApi();
  const articlesApi = new ArticlesApi();

  const handleFeaturedImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const toastId = toast.loading("Uploading thumbnail...");
      const imageUrl = await imageApi.uploadImage(file);

      setFeaturedImage(imageUrl);
      toast.success("Thumbnail uploaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload thumbnail");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");

      return;
    }

    if (!content.trim()) {
      toast.error("Please enter some content");

      return;
    }

    try {
      setIsSubmitting(true);

      const articleData: Article = {
        title,
        content,
        excerpt: excerpt || undefined,
        featured_image_url: featuredImage ?? undefined,
      };

      await articlesApi.createArticle(articleData);
      toast.success("Article created successfully!");
      router.push("/blog");
    } catch (error) {
      toast.error("Failed to create article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-5xl py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-6">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                Create New Article
              </h1>
              <p className="text-default-500">
                Share your thoughts with the world
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-none"
              color="danger"
              variant="flat"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-rose-500 text-white"
              isLoading={isSubmitting}
              onPress={handleSubmit}
            >
              Publish
            </Button>
          </div>
        </CardHeader>

        <CardBody className="gap-6 p-6">
          <div className="space-y-6">
            <div>
              {featuredImage ? (
                <div className="relative group rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    isBlurred
                    alt="Featured"
                    classNames={{
                      wrapper: "aspect-[1.9/1] w-full object-cover rounded-lg",
                      img: "object-cover w-full h-full transition-transform group-hover:scale-105",
                    }}
                    disableSkeleton={false}
                    loading="lazy"
                    radius="lg"
                    src={featuredImage}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <label className="cursor-pointer">
                      <Button
                        className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg"
                        radius="lg"
                        size="lg"
                        startContent={<ImagePlus size={20} />}
                      >
                        Change Thumbnail{" "}
                        <input
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          type="file"
                          onChange={handleFeaturedImageUpload}
                        />
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed rounded-lg aspect-[1.9/1] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-500 transition-colors bg-gray-50/50 hover:bg-gray-50">
                  <ImagePlus className="text-orange-500" size={48} />
                  <div className="text-center">
                    <p className="text-default-700 font-medium text-lg">
                      Add a thumbnail
                    </p>
                    <p className="text-small text-default-400">
                      Recommended: 1200×630px • PNG, JPEG or WebP
                    </p>
                  </div>
                  <input
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    type="file"
                    onChange={handleFeaturedImageUpload}
                  />
                </label>
              )}
            </div>

            {/* Title Input */}
            <Input
              isRequired
              classNames={{
                input: "text-lg",
                inputWrapper:
                  "hover:border-orange-500 focus-within:border-orange-500",
              }}
              label="Title"
              placeholder="Enter your article title"
              value={title}
              variant="bordered"
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Excerpt */}
            <Textarea
              classNames={{
                inputWrapper:
                  "hover:border-orange-500 focus-within:border-orange-500",
              }}
              label="Excerpt"
              placeholder="Enter a brief summary"
              value={excerpt}
              variant="bordered"
              onChange={(e) => setExcerpt(e.target.value)}
            />

            {/* Editor */}
            <div className="border rounded-lg hover:border-orange-500 transition-colors">
              <Editor value={content} onChange={setContent} />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default CreateArticlePage;

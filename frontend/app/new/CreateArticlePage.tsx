import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    } catch {
      toast.error("Failed to upload thumbnail");
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
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
    } catch {
      toast.error("Failed to create article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-5xl py-8 px-4 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            size="sm"
            variant="light"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-rose-400">
              Create New Article
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your thoughts with the world
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="flex-1 sm:flex-none border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400/10"
              variant="bordered"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-rose-600 text-white hover:opacity-90 dark:from-orange-500 dark:to-rose-500"
              isLoading={isSubmitting}
              onPress={handleSubmit}
            >
              Publish
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-6"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Top Section: Image Upload + Title/Excerpt */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <AnimatePresence mode="wait">
            {featuredImage ? (
              <motion.div
                key="image"
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-xl overflow-hidden bg-gradient-to-br from-orange-100/10 to-rose-100/10 hover:from-orange-100/20 hover:to-rose-100/20 dark:from-orange-500/5 dark:to-rose-500/5 dark:hover:from-orange-500/10 dark:hover:to-rose-500/10 transition-all duration-300"
                exit={{ opacity: 0, scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.9 }}
              >
                <Image
                  isBlurred
                  alt="Featured"
                  classNames={{
                    wrapper:
                      "aspect-[3/2] w-full object-cover rounded-xl border border-orange-200/50 dark:border-orange-800/30",
                    img: "object-cover w-full h-full transition-transform group-hover:scale-105",
                  }}
                  src={featuredImage}
                />
                <motion.div
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <label className="cursor-pointer">
                      <Button
                        className="bg-white/90 text-gray-800 hover:bg-white"
                        size="sm"
                        startContent={<ImagePlus size={16} />}
                      >
                        Change{" "}
                        <input
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          type="file"
                          onChange={handleFeaturedImageUpload}
                        />
                      </Button>
                    </label>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="bg-red-500/90 text-white hover:bg-red-500"
                      size="sm"
                      startContent={<X size={16} />}
                      onPress={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.label
                key="upload"
                animate={{ opacity: 1, scale: 1 }}
                className="border border-dashed border-orange-200 dark:border-orange-800/30 rounded-xl aspect-[3/2] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-500 transition-colors group bg-gradient-to-br from-orange-100/10 to-rose-100/10 hover:from-orange-100/20 hover:to-rose-100/20 dark:from-orange-500/5 dark:to-rose-500/5 dark:hover:from-orange-500/10 dark:hover:to-rose-500/10"
                exit={{ opacity: 0, scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ImagePlus
                  className="text-orange-500 group-hover:scale-110 transition-transform"
                  size={32}
                />
                <div className="text-center px-4">
                  <p className="text-orange-700 dark:text-orange-300 font-medium">
                    Add thumbnail
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    PNG, JPEG or WebP
                  </p>
                </div>
                <input
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  type="file"
                  onChange={handleFeaturedImageUpload}
                />
              </motion.label>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div>
              <label
                className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2"
                htmlFor="title"
              >
                Title *
              </label>
              <input
                className="w-full px-4 py-3 text-lg rounded-xl border border-orange-200 dark:border-orange-800/30 
                focus:outline-none focus:ring-2 focus:ring-orange-500/50
                bg-gradient-to-br from-orange-50/50 to-rose-50/50 hover:from-orange-100/50 hover:to-rose-100/50
                dark:from-orange-500/5 dark:to-rose-500/5 dark:hover:from-orange-500/10 dark:hover:to-rose-500/10
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                transition-all duration-300"
                placeholder="Enter your article title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2"
                htmlFor="excerpt"
              >
                Excerpt
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800/30 
                focus:outline-none focus:ring-2 focus:ring-orange-500/50
                bg-gradient-to-br from-orange-50/50 to-rose-50/50 hover:from-orange-100/50 hover:to-rose-100/50
                dark:from-orange-500/5 dark:to-rose-500/5 dark:hover:from-orange-500/10 dark:hover:to-rose-500/10
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                transition-all duration-300"
                placeholder="Enter a brief summary"
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        {/* Editor Section */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full overflow-hidden rounded-xl border border-orange-200 dark:border-orange-800/30 focus-within:ring-2 focus-within:ring-orange-500/50"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-gradient-to-br from-orange-50/50 to-rose-50/50 dark:from-orange-500/5 dark:to-rose-500/5">
            <Editor value={content} onChange={setContent} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CreateArticlePage;

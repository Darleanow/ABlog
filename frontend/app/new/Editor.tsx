import React, { useCallback } from "react";
import {
  useEditor,
  EditorContent,
  Editor as TipTapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading as HeadingIcon,
} from "lucide-react";
import { Button } from "@nextui-org/button";
import { toast } from "sonner";

import { ImageApi } from "@/lib/api/image-api";
import { IImageService } from "@/lib/services/image-service.interface";

interface MenuBarProps {
  editor: TipTapEditor | null;
  imageService: IImageService;
}

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  imageService?: IImageService;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, imageService }) => {
  const handleImageUpload = async (file: File): Promise<void> => {
    const toastId = toast.loading("Uploading image...");

    try {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");

        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        editor
          ?.chain()
          .focus()
          .setImage({
            src: e.target?.result as string,
            alt: file.name,
          })
          .run();
      };
      reader.readAsDataURL(file);

      const imageUrl = await imageService.uploadImage(file);

      editor?.commands.updateAttributes("image", {
        src: imageUrl,
      });

      toast.success("Image uploaded successfully!", { id: toastId });
    } catch {
      toast.error("Failed to upload image. Please try again.", { id: toastId });

      const attrs = editor?.getAttributes("image");

      if (attrs?.src) {
        editor?.chain().focus().deleteSelection().run();
      }
    }
  };

  const handleLinkAdd = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  if (!editor) return null;

  return (
    <div className="border-b border-orange-200/50 dark:border-orange-800/30 p-2 flex flex-wrap gap-2 bg-gradient-to-r from-orange-50/30 to-rose-50/30 dark:from-orange-500/5 dark:to-rose-500/5">
      <Button
        isIconOnly
        className={`${
          editor.isActive("heading", { level: 2 })
            ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white dark:from-orange-500 dark:to-rose-500"
            : "bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
        }`}
        size="sm"
        onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <HeadingIcon size={16} />
      </Button>

      <Button
        isIconOnly
        className={`${
          editor.isActive("bold")
            ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white dark:from-orange-500 dark:to-rose-500"
            : "bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
        }`}
        size="sm"
        onPress={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </Button>

      <Button
        isIconOnly
        className={`${
          editor.isActive("italic")
            ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white dark:from-orange-500 dark:to-rose-500"
            : "bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
        }`}
        size="sm"
        onPress={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </Button>

      <Button
        isIconOnly
        className={`${
          editor.isActive("bulletList")
            ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white dark:from-orange-500 dark:to-rose-500"
            : "bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
        }`}
        size="sm"
        onPress={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </Button>

      <Button
        isIconOnly
        className={`${
          editor.isActive("orderedList")
            ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white dark:from-orange-500 dark:to-rose-500"
            : "bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
        }`}
        size="sm"
        onPress={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </Button>

      <Button
        isIconOnly
        className={`${
          editor.isActive("link")
            ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white dark:from-orange-500 dark:to-rose-500"
            : "bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
        }`}
        size="sm"
        onPress={handleLinkAdd}
      >
        <LinkIcon size={16} />
      </Button>

      <label className="cursor-pointer">
        <Button
          isIconOnly
          as="span"
          className="bg-white/80 dark:bg-white/5 text-orange-600 dark:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-white/10"
          size="sm"
        >
          <ImageIcon size={16} />
        </Button>
        <input
          accept="image/*"
          className="hidden"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleImageUpload(file);
            }
          }}
        />
      </label>
    </div>
  );
};

const Editor: React.FC<EditorProps> = ({
  value = "",
  onChange,
  imageService = new ImageApi(),
}) => {
  const handleChange = useCallback(
    (newContent: string) => {
      if (onChange) {
        onChange(newContent);
      }
    },
    [onChange],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "mx-auto rounded-xl max-w-full h-auto",
        },
      }).extend({
        renderHTML({ HTMLAttributes }) {
          const { ...attrs } = HTMLAttributes;

          return [
            "div",
            { class: "flex justify-center my-4" },
            [
              "img",
              {
                ...attrs,
                class:
                  "rounded-xl max-w-[80%] h-auto shadow-lg transition-all duration-300 hover:shadow-xl",
              },
            ],
          ];
        },
      }),
      Link.configure({
        protocols: ["http", "https", "mailto", "tel"],
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
        validate: (href) => /^https?:\/\//.test(href),
        HTMLAttributes: {
          class:
            "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline decoration-orange-200/50 dark:decoration-orange-800/30",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-orange dark:prose-invert max-w-none focus:outline-none prose-headings:text-orange-600 dark:prose-headings:text-orange-400",
      },
      handleClick: (view, pos, event) => {
        const link = event?.target as HTMLAnchorElement;

        if (link?.tagName === "A") {
          window.open(link.href, "_blank");

          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML());
    },
  });

  return (
    <div className="bg-white dark:bg-transparent">
      <MenuBar editor={editor} imageService={imageService} />
      <div className="relative">
        <EditorContent
          className="px-4 pt-2 pb-4 max-h-[500px] overflow-y-auto prose-sm sm:prose 
                   prose-p:mt-2 prose-p:mb-2 prose-headings:mt-3 prose-headings:mb-2"
          editor={editor}
        />
      </div>
    </div>
  );
};

export default Editor;

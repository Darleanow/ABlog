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
    } catch (error) {
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

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  if (!editor) return null;

  return (
    <div className="border-b p-2 flex flex-wrap gap-2">
      <Button
        isIconOnly
        size="sm"
        variant={editor.isActive("heading", { level: 2 }) ? "solid" : "flat"}
        onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <HeadingIcon size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant={editor.isActive("bold") ? "solid" : "flat"}
        onPress={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant={editor.isActive("italic") ? "solid" : "flat"}
        onPress={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant={editor.isActive("bulletList") ? "solid" : "flat"}
        onPress={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant={editor.isActive("orderedList") ? "solid" : "flat"}
        onPress={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant={editor.isActive("link") ? "solid" : "flat"}
        onPress={handleLinkAdd}
      >
        <LinkIcon size={16} />
      </Button>

      <label className="cursor-pointer">
        <Button isIconOnly as="span" size="sm" variant="flat">
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
          class: "mx-auto rounded-lg max-w-full h-auto",
        },
      }).extend({
        renderHTML({ HTMLAttributes }) {
          // Remove classes from the attributes to handle them separately
          const { class: _, ...attrs } = HTMLAttributes;

          return [
            "div",
            { class: "flex justify-center my-4" },
            ["img", { ...attrs, class: "rounded-lg max-w-[80%] h-auto" }],
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
          class: "text-blue-500 underline hover:text-blue-700",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none",
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
    <div className="border rounded-lg overflow-hidden bg-content1">
      <MenuBar editor={editor} imageService={imageService} />
      <div className="relative">
        <EditorContent
          className="p-4 max-h-[500px] overflow-y-auto prose-sm sm:prose"
          editor={editor}
        />
      </div>
    </div>
  );
};

export default Editor;

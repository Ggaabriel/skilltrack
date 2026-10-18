
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Trash2,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourseNode } from "@/entities/node";

type NodeEditorProps = {
  node: CourseNode;
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  isSaving: boolean;
  onSave: (input: { title: string; content: string }) => void;
  onDelete: () => void;
};

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "secondary" : "ghost"}
      className="size-8 shrink-0"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function NodeEditor({
  node,
  title,
  content,
  onTitleChange,
  onContentChange,
  isSaving,
  onSave,
  onDelete,
}: NodeEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    contentType: "markdown",
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onContentChange(editor.getMarkdown());
    },

    editorProps: {
      attributes: {
        "aria-label": "Node content editor",
        class: [
          "min-h-[320px] px-4 py-3 outline-none",
          "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold",
          "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_p]:my-3",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:my-1",
          "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono",
          "[&_a]:text-primary [&_a]:underline",
          "[&_hr]:my-5 [&_hr]:border-border",
        ].join(" "),
      },
    },
  });

  const changed = title !== node.title || content !== node.content;

  function handleSave() {
    const normalizedTitle = title.trim();

    onTitleChange(normalizedTitle);
    onSave({
      title: normalizedTitle,
      content,
    });
  }

  function handleLink() {
    if (!editor) return;

    const currentUrl = editor.getAttributes("link").href ?? "";
    const input = window.prompt("Введите адрес ссылки:", currentUrl);

    if (input === null) return;

    const url = input.trim();

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedUrl })
      .run();
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label="Node title"
          placeholder="Название раздела"
        />

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!title.trim() || !changed || isSaving}
        >
          {isSaving ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Save />
          )}
          Сохранить
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-destructive"
          aria-label="Удалить раздел"
          title="Удалить раздел"
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>

      {editor && (
        <div className="mb-3 flex flex-wrap items-center gap-1 rounded-md border p-1">
          <ToolbarButton
            label="Заголовок 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Заголовок 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-6 w-px bg-border" />

          <ToolbarButton
            label="Жирный"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Курсив"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Зачёркнутый текст"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Встроенный код"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-6 w-px bg-border" />

          <ToolbarButton
            label="Маркированный список"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Нумерованный список"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Цитата"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Блок кода"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Вставить ссылку"
            active={editor.isActive("link")}
            onClick={handleLink}
          >
            <Link2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Горизонтальная линия"
            onClick={() =>
              editor.chain().focus().setHorizontalRule().run()
            }
          >
            <Minus className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-6 w-px bg-border" />

          <ToolbarButton
            label="Отменить"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Повторить"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      )}

      <div className="min-h-80 flex-1 overflow-y-auto rounded-md border bg-background">
        <EditorContent editor={editor} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Выдели текст или поставь курсор и используй кнопки форматирования.
      </p>
    </div>
  );
}

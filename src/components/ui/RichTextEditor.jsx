import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { useEffect, useState, useCallback } from 'react'
import {
  Bold as FormatBold,
  Italic as FormatItalic,
  Underline as FormatUnderlined,
  Strikethrough as FormatStrikethrough,
  List as FormatListBulleted,
  ListOrdered as FormatListNumbered,
  Quote as FormatQuote,
  AlignLeft as FormatAlignLeft,
  AlignCenter as FormatAlignCenter,
  AlignRight as FormatAlignRight,
  Code,
  Link as LinkIcon,
  Unlink as LinkOff,
  Undo,
  Redo,
  Highlighter as HighlightIcon,
  Minus as HorizontalRule,
  Heading as TitleIcon,
} from 'lucide-react'

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarButton({ onClick, isActive, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150 ${
        isActive
          ? 'bg-primary/15 text-primary shadow-sm'
          : 'text-text-muted hover:bg-background-subtle hover:text-text-heading'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-0.5" />
}

// ─── Main Editor Component ───────────────────────────────────────────────────

export default function RichTextEditor({ content, onChange, placeholder, error, isRTL }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // If the editor is empty (just <p></p>), return empty string
      if (html === '<p></p>') {
        onChange('')
      } else {
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[180px] px-4 py-3 text-text',
        dir: t("auto.ltr"),
      },
    },
  })

  // Sync external content changes (e.g. when editing a blog)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML()
      if (currentContent === '<p></p>' && !content) return
      if (content !== currentContent) {
        editor.commands.setContent(content || '')
      }
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!linkUrl) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      setShowLinkInput(false)
      return
    }
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  if (!editor) return null

  const iconSize = { width: 18, height: 18 }

  return (
    <div className={`rounded-xl border ${error ? 'border-red-400' : 'border-border'} bg-background overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary`}>
      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-background-subtle/50 border-b border-border">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo style={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <span className="text-xs font-black">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <span className="text-xs font-semibold">H3</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <FormatBold style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <FormatItalic style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <FormatUnderlined style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <FormatStrikethrough style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <HighlightIcon style={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <FormatAlignLeft style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <FormatAlignCenter style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <FormatAlignRight style={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <FormatListBulleted style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <FormatListNumbered style={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Blockquote / Code / HR */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <FormatQuote style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code style={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <HorizontalRule style={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        {showLinkInput ? (
          <div className="flex items-center gap-1.5 bg-background rounded-lg px-2 py-1 border border-border">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
              placeholder="https://..."
              className="text-xs bg-transparent border-none outline-none w-36 text-text"
              autoFocus
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                setLink()
              }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              OK
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                setShowLinkInput(false)
                setLinkUrl('')
              }}
              className="text-xs text-text-muted hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <ToolbarButton
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href
                setLinkUrl(previousUrl || '')
                setShowLinkInput(true)
              }}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <LinkIcon style={iconSize} />
            </ToolbarButton>
            {editor.isActive('link') && (
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="Remove Link"
              >
                <LinkOff style={iconSize} />
              </ToolbarButton>
            )}
          </>
        )}
      </div>

      {/* ─── Editor Area ────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ─── Editor Styles ──────────────────────────────────────── */}
      <style>{`
        .tiptap {
          min-height: 180px;
          padding: 12px 16px;
          outline: none;
          color: var(--color-text, #e0e0e0);
          font-size: 0.925rem;
          line-height: 1.7;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--color-text-muted, #6b7280);
          pointer-events: none;
          height: 0;
          opacity: 0.5;
        }
        .tiptap h1 { font-size: 1.5em; font-weight: 800; margin: 0.6em 0 0.3em; color: var(--color-text-heading, #fff); }
        .tiptap h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0 0.3em; color: var(--color-text-heading, #fff); }
        .tiptap h3 { font-size: 1.15em; font-weight: 600; margin: 0.4em 0 0.3em; color: var(--color-text-heading, #fff); }
        .tiptap ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap blockquote {
          border-left: 3px solid var(--color-primary, #4ade80);
          padding-left: 1em;
          margin: 0.6em 0;
          font-style: italic;
          color: var(--color-text-muted, #9ca3af);
        }
        .tiptap pre {
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 0.75em 1em;
          font-family: 'Fira Code', monospace;
          font-size: 0.85em;
          overflow-x: auto;
          margin: 0.5em 0;
        }
        .tiptap code {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
          padding: 0.15em 0.3em;
          font-size: 0.85em;
        }
        .tiptap mark {
          background: rgba(255, 230, 0, 0.3);
          border-radius: 2px;
          padding: 0.05em 0.15em;
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid var(--color-border, #333);
          margin: 1em 0;
        }
        .tiptap a {
          color: var(--color-primary, #4ade80);
          text-decoration: underline;
          cursor: pointer;
        }
        .tiptap p { margin: 0.3em 0; }
      `}</style>
    </div>
  )
}

"use client"

import { useState } from "react"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"
import { OverflowNode } from "@lexical/overflow"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ParagraphNode, TextNode, EditorState } from "lexical"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { TweetNode } from "@/components/editor/nodes/embeds/tweet-node"
import { EmojiNode } from "@/components/editor/nodes/emoji-node"
import { ImageNode } from "@/components/editor/nodes/image-node"
import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node"
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node"
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node"
import { KeywordNode } from "@/components/editor/nodes/keyword-node"
import { CodeActionMenuPlugin } from "@/components/editor/plugins/code-action-menu-plugin"
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin"
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin"
import { ContextMenuPlugin } from "@/components/editor/plugins/context-menu-plugin"
import { DragDropPastePlugin } from "@/components/editor/plugins/drag-drop-paste-plugin"
import { DraggableBlockPlugin } from "@/components/editor/plugins/draggable-block-plugin"
import { AutoEmbedPlugin } from "@/components/editor/plugins/embeds/auto-embed-plugin"
import { TwitterPlugin } from "@/components/editor/plugins/embeds/twitter-plugin"
import { YouTubePlugin } from "@/components/editor/plugins/embeds/youtube-plugin"
import { EmojiPickerPlugin } from "@/components/editor/plugins/emoji-picker-plugin"
import { EmojisPlugin } from "@/components/editor/plugins/emojis-plugin"
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin"
import { ImagesPlugin } from "@/components/editor/plugins/images-plugin"
import { KeywordsPlugin } from "@/components/editor/plugins/keywords-plugin"
import { LayoutPlugin } from "@/components/editor/plugins/layout-plugin"
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin"
import { LinkPlugin } from "@/components/editor/plugins/link-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { MentionsPlugin } from "@/components/editor/plugins/mentions-plugin"
import { TabFocusPlugin } from "@/components/editor/plugins/tab-focus-plugin"
import { ListMaxIndentLevelPlugin } from "@/components/editor/plugins/list-max-indent-level-plugin"
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin"
import { BlockInsertPlugin } from "@/components/editor/plugins/toolbar/block-insert-plugin"
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin"
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin"
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin"
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin"
import { FontSizeToolbarPlugin } from "@/components/editor/plugins/toolbar/font-size-toolbar-plugin"
import { FontFamilyToolbarPlugin } from "@/components/editor/plugins/toolbar/font-family-toolbar-plugin"
import { FontColorToolbarPlugin } from "@/components/editor/plugins/toolbar/font-color-toolbar-plugin"
import { FontBackgroundToolbarPlugin } from "@/components/editor/plugins/toolbar/font-background-toolbar-plugin"
import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin"
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin"
import { SubSuperToolbarPlugin } from "@/components/editor/plugins/toolbar/subsuper-toolbar-plugin"
import { FormatCodeBlock } from "@/components/editor/plugins/toolbar/block-format/format-code-block"
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph"
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading"
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list"
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list"
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list"
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote"
import { InsertImage } from "@/components/editor/plugins/toolbar/block-insert/insert-image"
import { InsertHorizontalRule } from "@/components/editor/plugins/toolbar/block-insert/insert-horizontal-rule"
import { InsertTable } from "@/components/editor/plugins/toolbar/block-insert/insert-table"
import { InsertEmbeds } from "@/components/editor/plugins/toolbar/block-insert/insert-embeds"
import { InsertColumnsLayout } from "@/components/editor/plugins/toolbar/block-insert/insert-columns-layout"
import { AlignmentPickerPlugin } from "@/components/editor/plugins/picker/alignment-picker-plugin"
import { HeadingPickerPlugin } from "@/components/editor/plugins/picker/heading-picker-plugin"
import { ParagraphPickerPlugin } from "@/components/editor/plugins/picker/paragraph-picker-plugin"
import { QuotePickerPlugin } from "@/components/editor/plugins/picker/quote-picker-plugin"
import { editorTheme } from "@/components/editor/themes/editor-theme"
import { EMOJI } from "@/components/editor/transformers/markdown-emoji-transformer"
import { HR } from "@/components/editor/transformers/markdown-hr-transformer"
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer"
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer"
import { TWEET } from "@/components/editor/transformers/markdown-tweet-transformer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const editorConfig: InitialConfigType = {
  namespace: "ProductDetailsEditor",
  theme: editorTheme,
  nodes: [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    OverflowNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    CodeNode,
    CodeHighlightNode,
    HorizontalRuleNode,
    ImageNode,
    EmojiNode,
    TweetNode,
    YouTubeNode,
    LayoutContainerNode,
    LayoutItemNode,
    KeywordNode,
  ],
  onError: (error: Error) => {
    console.error(error)
  },
}

interface ProductDetailsEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function ProductDetailsEditor({
  value,
  onChange,
  placeholder = "Enter product details...",
}: ProductDetailsEditorProps) {
  const handleChange = (editorState: EditorState) => {
    const serialized = editorState.toJSON()
    const jsonString = JSON.stringify(serialized)
    onChange?.(jsonString)
  }

  // Parse the stored JSON string - return JSON string for Lexical
  const getInitialEditorState = (): string | undefined => {
    if (!value) return undefined
    
    try {
      // Validate it's valid JSON by parsing it
      JSON.parse(value)
      // Return the JSON string (not the parsed object)
      return value
    } catch (error) {
      // If it's not valid JSON, start with empty editor
      console.warn('Invalid editor state JSON, starting with empty editor')
      return undefined
    }
  }

  const initialConfig = {
    ...editorConfig,
    editorState: getInitialEditorState(),
  }

  return (
    <div className="bg-background w-full overflow-hidden rounded-lg border">
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider>
          <EditorPlugins placeholder={placeholder} onChange={handleChange} />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}

interface EditorPluginsProps {
  placeholder: string
  onChange: (editorState: EditorState) => void
}

function EditorPlugins({ placeholder, onChange }: EditorPluginsProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative">
      {/* Toolbar with ALL formatting options */}
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="flex flex-wrap items-center gap-1 border-b p-2">
            {/* History Actions */}
            <HistoryToolbarPlugin />
            
            <Separator orientation="vertical" className="h-6" />

            {/* Block Format Dropdown */}
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatBulletedList />
              <FormatNumberedList />
              <FormatCheckList />
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>

            {blockType === "code" ? (
              <>
                <Separator orientation="vertical" className="h-6" />
                <CodeLanguageToolbarPlugin />
              </>
            ) : null}

            <Separator orientation="vertical" className="h-6" />

            {/* Font Family */}
            <FontFamilyToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Font Size */}
            <FontSizeToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Text Formatting (Bold, Italic, Underline, etc.) */}
            <FontFormatToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Font Color */}
            <FontColorToolbarPlugin />

            {/* Background Color */}
            <FontBackgroundToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Link */}
            <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />

            <Separator orientation="vertical" className="h-6" />

            {/* Subscript/Superscript */}
            <SubSuperToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Element Alignment */}
            <ElementFormatToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Block Insert (Image, Table, HR, Embeds, Columns) */}
            <BlockInsertPlugin>
              <InsertImage />
              <InsertTable />
              <InsertHorizontalRule />
              <InsertEmbeds />
              <InsertColumnsLayout />
            </BlockInsertPlugin>

            <Separator orientation="vertical" className="h-6" />

            {/* Clear Formatting */}
            <ClearFormattingToolbarPlugin />
          </div>
        )}
      </ToolbarPlugin>

      {/* Editor Content */}
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={placeholder}
                  className="ContentEditable__root relative block min-h-[200px] max-h-[400px] overflow-auto px-4 py-3 focus:outline-none"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        {/* Core Plugins */}
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <TabIndentationPlugin />
        <TabFocusPlugin />

        {/* List Plugins */}
        <ListPlugin />
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />

        {/* Link Plugins */}
        <ClickableLinkPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        {floatingAnchorElem && (
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}

        {/* Table Plugin */}
        <TablePlugin />

        {/* Code Plugins */}
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        <CodeHighlightPlugin />

        {/* Image Plugin */}
        <ImagesPlugin />

        {/* Embed Plugins */}
        <AutoEmbedPlugin />
        <TwitterPlugin />
        <YouTubePlugin />

        {/* Emoji Plugins */}
        <EmojisPlugin />
        <EmojiPickerPlugin />

        {/* Layout Plugin */}
        <LayoutPlugin />

        {/* Other Plugins */}
        <HorizontalRulePlugin />
        <ComponentPickerMenuPlugin
          baseOptions={[
            ParagraphPickerPlugin(),
            HeadingPickerPlugin({ n: 1 }),
            HeadingPickerPlugin({ n: 2 }),
            HeadingPickerPlugin({ n: 3 }),
            QuotePickerPlugin(),
            AlignmentPickerPlugin({ alignment: "left" }),
            AlignmentPickerPlugin({ alignment: "right" }),
            AlignmentPickerPlugin({ alignment: "center" }),
            AlignmentPickerPlugin({ alignment: "justify" }),
          ]}
        />
        <ContextMenuPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
        <DragDropPastePlugin />
        <KeywordsPlugin />
        <MentionsPlugin />
        {floatingAnchorElem && (
          <FloatingTextFormatToolbarPlugin
            anchorElem={floatingAnchorElem}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}

        {/* Markdown Shortcut Plugin */}
        <MarkdownShortcutPlugin
          transformers={[
            TABLE,
            HR,
            IMAGE,
            EMOJI,
            TWEET,
            CHECK_LIST,
            ...ELEMENT_TRANSFORMERS,
            ...MULTILINE_ELEMENT_TRANSFORMERS,
            ...TEXT_FORMAT_TRANSFORMERS,
            ...TEXT_MATCH_TRANSFORMERS,
          ]}
        />
      </div>
    </div>
  )
}

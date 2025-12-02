"use client"

import { useState } from "react"
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import { ParagraphNode, TextNode, EditorState, SerializedEditorState } from "lexical"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin"
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
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph"
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading"
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list"
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list"
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list"
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote"
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin"
import { LinkPlugin } from "@/components/editor/plugins/link-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { ListMaxIndentLevelPlugin } from "@/components/editor/plugins/list-max-indent-level-plugin"
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
              <FormatQuote />
            </BlockFormatDropDown>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Family */}
            <FontFamilyToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Font Size */}
            <FontSizeToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Text Formatting */}
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

            {/* Clear Formatting */}
            <ClearFormattingToolbarPlugin />
          </div>
        )}
      </ToolbarPlugin>

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
        
        {/* Additional Plugins */}
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <TabIndentationPlugin />
        <ClickableLinkPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        
        {floatingAnchorElem && (
          <FloatingLinkEditorPlugin 
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}
      </div>
    </div>
  )
}


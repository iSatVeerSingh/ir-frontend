import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  RangeSelection,
  LexicalEditor,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isAtNodeEnd } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { createPortal } from "react-dom";
import { Box, Flex, IconButton, Input } from "@chakra-ui/react";
import {
  BoldIcon,
  CheckIcon,
  CrossIcon,
  ItalicIcon,
  JustifyIcon,
  LeftAlignIcon,
  LinkIcon,
  PencilIcon,
  RightAlignIcon,
  UnderlineIcon,
} from "../../icons";

const LowPriority = 1;

const LinkEditor = ({ editor }) => {
  const inputRef = useRef(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const setLink = () => {
    if (linkUrl !== "") {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      setEditMode(false);
    }
  };

  return (
    <Box
      shadow={"dark-lg"}
      borderRadius={"md"}
      px={1}
      py={2}
      position={"absolute"}
      bg={"white"}
      zIndex={100}
      top={0}
      right={0}
    >
      {isEditMode ? (
        <Flex gap={1} alignItems={"center"}>
          <Input
            borderRadius={"full"}
            h={8}
            px={2}
            outline={"none"}
            bg={"gray.200"}
            ref={inputRef}
            value={linkUrl}
            onChange={(event) => {
              setLinkUrl(event.target.value.trim());
            }}
          />
          <IconButton
            icon={<CheckIcon boxSize="4" />}
            rounded={"full"}
            bg={"gray.500"}
            area-label="done"
            size={"xs"}
            onClick={setLink}
          />
        </Flex>
      ) : (
        <Flex alignItems={"center"} gap={2} px={"2"} minW={"200px"}>
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "blue", flexGrow: 1 }}
          >
            {linkUrl}
          </a>
          <IconButton
            rounded={"full"}
            bg={"gray.500"}
            area-label="clear"
            size={"xs"}
            aria-label="Edit Link"
            tabIndex={0}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setEditMode(true)}
            icon={<PencilIcon boxSize={5} />}
          />
        </Flex>
      )}
    </Box>
  );
};

function getSelectedNode(selection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const linkBtnRef = useRef(null);
  const [linkRect, setLinkRect] = useState(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <>
      <Flex ref={toolbarRef} gap={1} position={"relative"}>
        <IconButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          icon={<BoldIcon />}
          aria-label="Bold"
          isActive={isBold}
        />
        <IconButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          icon={<ItalicIcon />}
          aria-label="Italic"
          isActive={isItalic}
        />
        <IconButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          icon={<UnderlineIcon />}
          aria-label="Underline"
          isActive={isUnderline}
        />
        <IconButton
          onClick={insertLink}
          icon={<LinkIcon />}
          aria-label="Insert Link"
          isActive={isLink}
          ref={linkBtnRef}
        />
        {isLink && <LinkEditor editor={editor} />}
      </Flex>
    </>
  );
}

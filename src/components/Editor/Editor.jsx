import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
} from "@chakra-ui/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LinkNode } from "@lexical/link";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundry from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { forwardRef, useEffect } from "react";
import ToolbarPlugin from "./ToolbarPlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes } from "lexical";

const Editor = ({ label, inputError, id, editorText }, ref) => {
  const editorConfig = {
    namespace: "Editor",
    theme: {
      paragraph: "t-p",
      link: "t-link",
      text: {
        bold: "t-b",
        italic: "t-i",
        underline: "t-u",
      },
    },
    onError: (err) => {
      console.log(err);
    },
    nodes: [LinkNode],
  };

  useEffect(() => {
    if (ref.current && editorText) {
      ref.current.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(editorText, "text/html");
        const nodes = $generateNodesFromDOM(ref.current, dom);
        $insertNodes(nodes);
      });
    }
  }, []);

  return (
    <FormControl>
      <FormLabel htmlFor={id} mb={0} fontSize={"xl"}>
        {label}
      </FormLabel>
      <LexicalComposer initialConfig={editorConfig}>
        <Box
          borderRadius={"xl"}
          overflow={"hidden"}
          border={"2px"}
          borderColor={"blue.300"}
        >
          <ToolbarPlugin />
          <Box position={"relative"}>
            <RichTextPlugin
              contentEditable={
                <Box
                  as={ContentEditable}
                  minH={"150px"}
                  outline={"none"}
                  p={1}
                  borderTop={"1px"}
                  borderTopColor={"gray.500"}
                  maxH={"300px"}
                  overflow={"auto"}
                />
              }
              placeholder={
                <Text position="absolute" top={1} left={1} opacity="0.5">
                  Start typing here
                </Text>
              }
              ErrorBoundary={LexicalErrorBoundry}
            />
            <LinkPlugin />
            <ClearEditorPlugin />
            <EditorRefPlugin editorRef={ref} />
          </Box>
        </Box>
      </LexicalComposer>
      {inputError && <FormErrorMessage mt="0">{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(Editor);

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Image,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import FormSelect from "../../components/FormSelect";
import FormInput from "../../components/FormInput";
import FileInput from "../../components/FileInput";
import Editor from "../../components/Editor/Editor";
import { useRef, useState } from "react";
import FormTextarea from "../../components/FormTextarea";
import ButtonPrimary from "../../components/ButtonPrimary";
import { $generateHtmlFromNodes } from "@lexical/html";
import { embeddedResized } from "../../utils/getResizedImages";
import InputBtn from "../../components/InputBtn";
import inspectionApi from "../../api/inspectionApi";
import { CLEAR_EDITOR_COMMAND } from "lexical";
import ButtonOutline from "../../components/ButtonOutline";
import { useNavigate } from "react-router-dom";

const ItemForm = ({ categories, isEditing, editItem }) => {
  const opening_paragraphRef = useRef(null);
  const closing_paragraphRef = useRef(null);
  const [formErrors, setFormErrors] = useState(null);
  const parentRef = useRef(null);
  const [embRemoved, setEmbRemoved] = useState(false);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const cancelRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleItemForm = async (e) => {
    e.preventDefault();
    const category_id = e.target?.category?.value?.trim();
    const name = e.target?.name?.value?.trim();
    const embedded_images = e.target?.embedded_images?.files;
    const summary = e.target?.summary?.value.trim();

    let opening_paragraph = "";
    let closing_paragraph = "";

    if (opening_paragraphRef.current) {
      opening_paragraphRef.current.update(() => {
        opening_paragraph = $generateHtmlFromNodes(opening_paragraphRef.current);
      });
    }

    if (closing_paragraphRef.current) {
      closing_paragraphRef.current.update(() => {
        closing_paragraph = $generateHtmlFromNodes(closing_paragraphRef.current);
      });
    }

    const errors = {};

    if (!category_id || category_id === "") {
      errors.category = "Category is required";
    }
    if (!name || name === "") {
      errors.name = "Name is required";
    }

    if (!summary || summary === "") {
      errors.summary = "Summary is required";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);
    setSaving(true);

    const itemData = {
      category_id,
      name,
      summary,
      opening_paragraph,
      closing_paragraph,
    };

    if (embRemoved) {
      itemData.embedded_images = [];
    }

    if (embedded_images && embedded_images.length > 0) {
      itemData.embedded_images = await embeddedResized(embedded_images);
    }

    parentRef.current.innerHTML = "";
    parentRef.current.style.fontFamily = "Times, serif";
    parentRef.current.style.fontSize = "11pt";
    parentRef.current.style.width = "475pt";

    const namePara = document.createElement("p");
    namePara.style.fontWeight = "bold";
    namePara.textContent = itemData.name;

    parentRef.current.appendChild(namePara);

    const openingDiv = document.createElement("div");
    openingDiv.innerHTML = itemData.opening_paragraph;
    parentRef.current.appendChild(openingDiv);

    const images = itemData?.embedded_images || editItem?.embedded_images;

    if (images) {
      const imgDiv = document.createElement("div");
      imgDiv.style.display = "grid";
      imgDiv.style.gap = "5pt";
      imgDiv.style.gridTemplateColumns = "1fr 1fr";

      for (let i = 0; i < images.length; i++) {
        let embedded_image = images[i];
        const img = document.createElement("img");
        img.src = embedded_image;
        img.style.height = "200pt";
        imgDiv.appendChild(img);
      }

      parentRef.current.appendChild(imgDiv);
    }

    const closingDiv = document.createElement("div");
    closingDiv.innerHTML = itemData.closing_paragraph;
    parentRef.current.appendChild(closingDiv);

    const height = Math.ceil(parentRef.current.clientHeight * 0.75);

    itemData.height = height;

    if (isEditing) {
      const libraryItem = {};
      if (itemData.category_id !== editItem?.category_id) {
        libraryItem.category_id = itemData.category_id;
      }
      if (itemData.name !== editItem?.name) {
        libraryItem.name = itemData.name;
      }
      if (itemData.summary !== editItem.summary) {
        libraryItem.summary = itemData.summary;
      }
      if (itemData.opening_paragraph !== editItem.opening_paragraph) {
        libraryItem.opening_paragraph = itemData.opening_paragraph;
      }
      if (itemData.closing_paragraph !== editItem.closing_paragraph) {
        libraryItem.closing_paragraph = itemData.closing_paragraph;
      }
      if (itemData.embedded_images) {
        libraryItem.embedded_images = itemData.embedded_images;
      }
      if (itemData.height !== editItem.height) {
        libraryItem.height = itemData.height;
      }

      const { data, error } = await inspectionApi.put(
        `/items/${editItem.id}`,
        libraryItem
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return;
      }
      toast({
        title: data?.message,
        status: "success",
      });
      setSaving(false);
    } else {
      const { data, error } = await inspectionApi.post(`/items`, itemData);
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return;
      }
      toast({
        title: data?.message,
        status: "success",
      });
      setSaving(false);
      e.target.reset();
      opening_paragraphRef.current.dispatchCommand(
        CLEAR_EDITOR_COMMAND,
        undefined
      );
      closing_paragraphRef.current.dispatchCommand(
        CLEAR_EDITOR_COMMAND,
        undefined
      );
    }
  };

  const deleteItem = async () => {
    const { data, error } = await inspectionApi.delete(
      `/items/${editItem?.id}`
    );
    if (error) {
      toast({
        title: error,
        status: "error",
      });
      return;
    }
    toast({
      title: data?.message,
      status: "success",
    });
    onClose();
    navigate(-1);
  };

  return (
    <Card position={"relative"} zIndex={2} p={3}>
      <form onSubmit={handleItemForm}>
        <VStack alignItems={"start"}>
          <FormSelect
            id="category"
            label="Category"
            placeholder="Select a category"
            defaultValue={isEditing && editItem ? editItem?.category_id : ""}
            options={categories || []}
            inputError={formErrors?.category}
          />
          <FormInput
            id="name"
            label="Name"
            placeholder="enter item name"
            defaultValue={isEditing && editItem ? editItem?.name : ""}
            inputError={formErrors?.name}
          />
          {isEditing &&
            editItem?.embedded_images &&
            Array.isArray(editItem.embedded_images) &&
            !embRemoved && (
              <Box>
                <Text>Embedded Image</Text>
                <Flex wrap={"wrap"} gap={2}>
                  {editItem.embedded_images.map((img, index) => (
                    <Image src={img} key={index} width={"300px"} />
                  ))}
                </Flex>
                <InputBtn
                  value={"Remove"}
                  onClick={() => setEmbRemoved(true)}
                />
              </Box>
            )}
          <FileInput
            id="embedded_images"
            label="Embedded Images"
            multiple
            accept=".jpg, .png, .jpeg"
          />
          <Editor
            label="Opening Paragraph"
            ref={opening_paragraphRef}
            editorText={editItem?.opening_paragraph}
          />
          <Editor
            label="Closing Paragraph"
            ref={closing_paragraphRef}
            editorText={editItem?.closing_paragraph}
          />
          <FormTextarea
            label="Summary"
            id="summary"
            placeholder="type summary here"
            inputError={formErrors?.summary}
            defaultValue={isEditing && editItem ? editItem?.summary : ""}
          />
        </VStack>
        <Flex mt={3} justifyContent={"space-between"}>
          <Flex gap={2}>
            <ButtonPrimary
              type="submit"
              isLoading={saving}
              loadingText="Submitting"
            >
              Submit
            </ButtonPrimary>
            <ButtonOutline onClick={() => navigate(-1)}>Close</ButtonOutline>
          </Flex>
          {isEditing && (
            <Button colorScheme="red" borderRadius={"full"} onClick={onOpen}>
              Delete
            </Button>
          )}
        </Flex>
      </form>
      <div
        style={{
          position: "absolute",
          zIndex: -2,
          top: -1000,
          left: -1000,
          visibility: "hidden",
        }}
        ref={parentRef}
      ></div>

      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Item</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button borderRadius={"full"} ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                borderRadius={"full"}
                colorScheme="red"
                onClick={deleteItem}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  );
};

export default ItemForm;

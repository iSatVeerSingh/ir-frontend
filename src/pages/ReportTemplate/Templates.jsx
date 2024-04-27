import { useEffect, useRef, useState } from "react";
import inspectionApi from "../../api/inspectionApi";
import PageLayout from "../../layouts/PageLayout";
import Loading from "../../components/Loading";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Card from "../../components/Card";
import ButtonOutline from "../../components/ButtonOutline";
import ButtonPrimary from "../../components/ButtonPrimary";
import FormInput from "../../components/FormInput";
import Editor from "../../components/Editor/Editor";
import FormSelect from "../../components/FormSelect";
import DataNotFound from "../../components/DataNotFound";
import { MoreIcon } from "../../icons";

const Templates = () => {
  const [loading, setLoading] = useState(true);
  const [templateSections, setTemplateSections] = useState([]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isOpenAlert,
    onClose: onCloseAlert,
    onOpen: onOpenAlert,
  } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOptions, setSectionOptions] = useState([]);
  const editorRef = useRef(null);
  const [formErrors, setFormErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const toast = useToast();
  const cancelRef = useRef(null);
  const deleteTemplateRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const getAllTemplates = async () => {
    const { data, error } = await inspectionApi.get("/report-templates");
    if (error) {
      setLoading(false);
      return;
    }
    setTemplateSections(data);
    setSectionOptions(
      data.map((item) => ({ text: item.heading, value: item.id }))
    );
    setLoading(false);
  };

  useEffect(() => {
    getAllTemplates();
  }, []);

  const handleNewTemplateBtn = () => {
    setIsEditing(false);
    setEditSection(null);
    onOpen();
  };

  const handleTemplateForm = async (e) => {
    e.preventDefault();
    const heading = e.target?.heading.value.trim();
    const order = e.target?.order.value.trim();
    const page_break = e.target?.page_break.value.trim();

    let body = "";
    if (editorRef.current) {
      editorRef.current.update(() => {
        body = $generateHtmlFromNodes(editorRef.current);
      });
    }

    const errors = {};

    if (!heading || heading === "") {
      errors.heading = "Heading is required";
    }

    if (!order) {
      errors.order = "Please select order";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);

    if (isEditing) {
      const template = {};
      if (heading !== editSection?.heading) {
        template.heading = heading;
      }
      if (editSection?.is_template) {
        if (body !== editSection?.body) {
          template.body = body;
        }
      }

      if (order !== editSection?.order) {
        template.order = order;
      }

      template.page_break = page_break === "Yes";
      setSubmitting(true);

      const { data, error } = await inspectionApi.put(
        `/report-templates/${editSection?.id}`,
        template
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data?.message,
        status: "success",
      });
      setSubmitting(false);
      onClose();
      await getAllTemplates();
    } else {
      setSubmitting(true);
      const template = {
        heading,
        body,
        order,
        page_break: page_break === "Yes",
        is_template: true,
      };

      const { data, error } = await inspectionApi.post(
        "/report-templates",
        template
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data?.message,
        status: "success",
      });
      setSubmitting(false);
      onClose();
      await getAllTemplates();
    }
  };

  const handleEditBtn = (section) => {
    setIsEditing(true);
    setEditSection(section);
    onOpen();
  };

  const handleDeleteBtn = (id) => {
    deleteTemplateRef.current = id;
    onOpenAlert();
  };

  const deleteTemplate = async () => {
    if (deleteTemplateRef.current) {
      setSaving(true);
      const { data, error } = await inspectionApi.delete(
        `/report-templates/${deleteTemplateRef.current}`
      );
      if (error) {
        toast({ title: error, status: "error", duration: 3000 });
        setSaving(false);
        return;
      }
      toast({ title: data?.message, duration: 3000, status: "success" });
      setSaving(false);
      onCloseAlert();
      await getAllTemplates();
    }
  };

  return (
    <PageLayout
      title="Report Template Sections"
      isRoot
      btn={"New Template"}
      onClick={handleNewTemplateBtn}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          {templateSections.length !== 0 ? (
            <Grid gap={2} cursor={"pointer"}>
              {templateSections.map((section) => (
                <Flex
                  p={3}
                  borderRadius={"xl"}
                  bg={"main-bg"}
                  shadow={"xs"}
                  key={section?.id}
                  gap={2}
                >
                  <Box onClick={() => handleEditBtn(section)} flexGrow={1}>
                    <Text fontSize={"xl"}>{section?.heading}</Text>
                    <Text color="gray.500">
                      {section?.is_template
                        ? "Template section"
                        : "Dynamic section"}
                    </Text>
                  </Box>
                  {section?.is_template && (
                    <Menu>
                      <MenuButton>
                        <MoreIcon />
                      </MenuButton>
                      <MenuList shadow={"lg"}>
                        <MenuItem onClick={() => handleDeleteBtn(section.id)}>
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </Flex>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couln't find any template sections</DataNotFound>
          )}
        </>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit template section" : "New template section"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="template_form" onSubmit={handleTemplateForm}>
              <VStack>
                <FormInput
                  id="heading"
                  label="Section Heading"
                  type="text"
                  placeholder="enter section heading"
                  inputError={formErrors?.heading}
                  defaultValue={isEditing ? editSection?.heading : ""}
                />
                {isEditing && !editSection?.is_template ? null : (
                  <Editor
                    id="body"
                    label="Section Body"
                    ref={editorRef}
                    editorText={editSection?.body}
                  />
                )}
                <FormSelect
                  options={sectionOptions}
                  id="order"
                  placeholder="Select a section"
                  label="Order After"
                  subLabel="After which section the current section should appear in report"
                  defaultValue={isEditing ? editSection?.order : ""}
                  inputError={formErrors?.order}
                />
                <FormSelect
                  options={["Yes", "No"]}
                  id="page_break"
                  defaultValue={
                    isEditing && editSection?.page_break ? "Yes" : "No"
                  }
                  label="Page Break Before Section"
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3} justifyContent={"start"}>
            <ButtonPrimary
              isLoading={submitting}
              loadingText="Submitting"
              type="submit"
              form="template_form"
              px="10"
            >
              {isEditing ? "Save" : "Create"}
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Close</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete Report Template Section
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <ButtonOutline ref={cancelRef} onClick={onCloseAlert}>
                Cancel
              </ButtonOutline>
              <ButtonPrimary
                colorScheme="red"
                isLoading={saving}
                loadingText="Submitting"
                onClick={deleteTemplate}
              >
                Delete
              </ButtonPrimary>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default Templates;

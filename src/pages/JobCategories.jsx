import { useEffect, useRef, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import inspectionApi from "../api/inspectionApi";
import Loading from "../components/Loading";
import {
  Box,
  Flex,
  Grid,
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";
import { MoreIcon } from "../icons";
import FormInput from "../components/FormInput";
import ButtonPrimary from "../components/ButtonPrimary";
import ButtonOutline from "../components/ButtonOutline";
import FormTextArea from "../components/FormTextarea";
import DataNotFound from "../components/DataNotFound";

const JobCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formErrors, setFormErrors] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const toast = useToast();
  const deleteCategoryRef = useRef(null);
  const cancelRef = useRef(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  const [saving, setSaving] = useState(false);
  const getJobCategories = async () => {
    setLoading(true);
    const { data, error } = await inspectionApi.get("/job-categories");
    if (error) {
      setLoading(false);
      return;
    }
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    getJobCategories();
  }, []);

  const handleTitleBtn = () => {
    setIsEditing(false);
    setEditCategory(null);
    onOpen();
  };

  const handleJobCategoryForm = async (e) => {
    e.preventDefault();

    const name = e.target?.name?.value?.trim();
    const type = e.target?.type?.value?.trim();
    const stage_of_works = e.target?.stage_of_works?.value?.trim();

    const errors = {};

    if (!name || name === "") {
      errors.name = "Name is required";
    }
    if (!type || type === "") {
      errors.type = "Type is required";
    }
    if (!stage_of_works || stage_of_works === "") {
      errors.stage_of_works = "Stage of works is required";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);
    setSaving(true);

    if (isEditing) {
      const categoryData = {};
      if (name !== editCategory?.name) {
        categoryData.name = name;
      }
      if (type !== editCategory?.type) {
        categoryData.type = type;
      }
      if (stage_of_works !== editCategory?.stage_of_works) {
        categoryData.stage_of_works = stage_of_works;
      }

      const { data, error } = await inspectionApi.put(
        `/job-categories/${editCategory?.id}`,
        categoryData
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
      onClose();
      await getJobCategories();
    } else {
      const { data, error } = await inspectionApi.post(`/job-categories`, {
        name,
        type,
        stage_of_works,
      });
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
      e.target.reset();
      setSaving(false);
      onClose();
      await getJobCategories();
    }
  };

  const handleEditBtn = (category) => {
    setIsEditing(true);
    setEditCategory(category);
    onOpen();
  };

  const handleDeleteCategoryBtn = (id) => {
    deleteCategoryRef.current = id;
    onOpenAlert();
  };

  const deleteJobCategory = async () => {
    if (deleteCategoryRef.current) {
      setSaving(true);
      const { data, error } = await inspectionApi.delete(
        `/job-categories/${deleteCategoryRef.current}`
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
        title: data.message,
        status: "success",
      });
      setSaving(false);
      onCloseAlert();
      await getJobCategories();
    }
  };

  return (
    <PageLayout
      title="Job Categories"
      btn="New Job Category"
      onClick={handleTitleBtn}
      isRoot
    >
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {categories.length !== 0 ? (
            <Grid gap={2}>
              {categories.map((category) => (
                <Flex
                  alignItems={"center"}
                  key={category.id}
                  bg={"main-bg"}
                  p="2"
                  borderRadius={"lg"}
                  shadow={"xs"}
                  gap={3}
                >
                  <Box flexGrow={1}>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text>{category?.name}</Text>
                      <Text color={"gray.500"}>
                        Last Updated: {category?.updated_at}
                      </Text>
                    </Flex>
                    <Text color={"gray.600"}>
                      Report Type: {category?.type || "N/A"}
                    </Text>
                    <Text color={"gray.600"}>
                      Stage Of Works: {category?.stage_of_works || "N/A"}
                    </Text>
                  </Box>
                  <Menu>
                    <MenuButton>
                      <MoreIcon />
                    </MenuButton>
                    <MenuList shadow={"lg"}>
                      <MenuItem onClick={() => handleEditBtn(category)}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDeleteCategoryBtn(category.id)}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couldn't find any job categories</DataNotFound>
          )}
        </Box>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Job Category" : "New Job Category"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="job_category_form" onSubmit={handleJobCategoryForm}>
              <VStack>
                <FormInput
                  id="name"
                  name="name"
                  placeholder="Category name"
                  label="Name"
                  defaultValue={editCategory?.name}
                  inputError={formErrors?.name}
                />
                <FormInput
                  id="type"
                  name="type"
                  placeholder="Report type"
                  label="Type"
                  defaultValue={editCategory?.type}
                  inputError={formErrors?.type}
                />
                <FormTextArea
                  id="stage_of_works"
                  name="stage_of_works"
                  placeholder="Stage of works"
                  label="Stage Of Works"
                  defaultValue={editCategory?.stage_of_works}
                  inputError={formErrors?.stage_of_works}
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={2}>
            <ButtonPrimary
              isLoading={saving}
              loadingText="Submitting"
              type="submit"
              form="job_category_form"
            >
              Submit
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
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
              Delete Job Category
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                borderRadius={"full"}
                ref={cancelRef}
                onClick={onCloseAlert}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                borderRadius={"full"}
                isLoading={saving}
                loadingText="Submitting"
                onClick={deleteJobCategory}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default JobCategories;

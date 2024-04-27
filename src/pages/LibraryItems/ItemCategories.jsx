import { useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";
import PageLayout from "../../layouts/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogFooter,
  Box,
  Flex,
  Grid,
  IconButton,
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
  useDisclosure,
  useToast,
  Button,
} from "@chakra-ui/react";
import { MoreIcon } from "../../icons";
import FormInput from "../../components/FormInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOutline";
import DataNotFound from "../../components/DataNotFound";

const ItemCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const categoryRef = useRef(null);
  const [initCategory, setInitCategory] = useState(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const deleteCategoryRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const getCategories = async () => {
    const { error, data } = await inspectionApi.get("/item-categories");
    if (error) {
      setLoading(false);
      return;
    }
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleNewCategoryBtn = () => {
    setIsEditing(false);
    setInitCategory(null);
    onOpen();
  };

  const handleEditCategoryBtn = (category) => {
    setIsEditing(true);
    setInitCategory(category);
    onOpen();
  };

  function handleDeleteCategoryBtn(id) {
    deleteCategoryRef.current = id;
    onOpenAlert();
  }

  const deleteCategory = async () => {
    setSaving(true);
    if (deleteCategoryRef.current) {
      const { error, data } = await inspectionApi.delete(
        `/item-categories/${deleteCategoryRef.current}`
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        onCloseAlert();
        return;
      }
      toast({
        title: data?.message,
        status: "success",
      });
      setSaving(false);
      onCloseAlert();
      await getCategories();
    }
  };

  const handleSubmit = async () => {
    const name = categoryRef.current?.value.trim();
    if (!name || name === "") {
      return;
    }

    setSaving(true);
    if (!isEditing) {
      const { error, data } = await inspectionApi.post("/item-categories", {
        name,
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
      setSaving(false);
      onClose();
      await getCategories();
    } else {
      const { error, data } = await inspectionApi.put(
        `/item-categories/${initCategory?.id}`,
        {
          name,
        }
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
      onClose();
      await getCategories();
    }
  };

  return (
    <PageLayout
      title="Item Categories"
      btn="New Category"
      onClick={handleNewCategoryBtn}
      isRoot
    >
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {categories.length !== 0 ? (
            <Grid gap={2} gridTemplateColumns={"repeat(2, 1fr)"}>
              {categories.map((category) => (
                <Flex
                  alignItems={"center"}
                  key={category.id}
                  bg={"main-bg"}
                  p="2"
                  borderRadius={"lg"}
                  shadow={"xs"}
                >
                  <Box flexGrow={1}>
                    <Text fontSize={"lg"}>{category.name}</Text>
                    <Text color={"gray.600"}>Items: {category.items}</Text>
                  </Box>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      variant={"simple"}
                      icon={<MoreIcon />}
                    />
                    <MenuList>
                      <MenuItem onClick={() => handleEditCategoryBtn(category)}>
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
            <DataNotFound>Coudn't find any categories</DataNotFound>
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
          <ModalHeader>Create Item Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormInput
              defaultValue={initCategory?.name}
              name="category"
              type="text"
              id="category"
              ref={categoryRef}
              placeholder="category name"
            />
            <ModalFooter gap={2} justifyContent={"start"} px={0}>
              <ButtonPrimary
                onClick={handleSubmit}
                isLoading={saving}
                loadingText="Submitting"
              >
                Submit
              </ButtonPrimary>
              <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
            </ModalFooter>
          </ModalBody>
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
              Delete Category
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
                onClick={deleteCategory}
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

export default ItemCategories;

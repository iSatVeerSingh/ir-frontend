import { useEffect, useRef, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import inspectionApi from "../api/inspectionApi";
import Loading from "../components/Loading";
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
} from "@chakra-ui/react";
import { MoreIcon } from "../icons";
import { useSearchParams } from "react-router-dom";
import FilterInput from "../components/FilterInput";
import InputBtn from "../components/InputBtn";
import FormTextarea from "../components/FormTextarea";
import ButtonPrimary from "../components/ButtonPrimary";
import ButtonOutline from "../components/ButtonOutline";
import DataNotFound from "../components/DataNotFound";

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [pages, setPages] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const deleteRecommendationRef = useRef(null);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState(null);
  const [formErrors, setFormErrors] = useState(null);

  const getRecommendations = async (url = "/recommendations") => {
    setLoading(true);
    const { data, error } = await inspectionApi.get(url);
    if (error) {
      setLoading(false);
      return;
    }
    setRecommendations(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0
        ? "/recommendations"
        : "/recommendations?" + searchParams.toString();
    getRecommendations(searchUrl);
  }, [searchParams]);

  const updateSearch = (key, value, includePage) => {
    if (value && value !== "") {
      setSearchParams((prev) => {
        const updatedParams = {
          ...Object.fromEntries(prev),
          [key]: value,
        };

        if (!includePage) {
          delete updatedParams.page;
        }

        return updatedParams;
      });
    }
  };

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("keyword", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

  const handleTitleBtn = () => {
    setIsEditing(false);
    setEditRecommendation(null);
    onOpen();
  };

  const handleEditRecommendationBtn = (recommendation) => {
    setIsEditing(true);
    setEditRecommendation(recommendation);
    onOpen();
  };

  const handleDeleteRecommendationBtn = (id) => {
    deleteRecommendationRef.current = id;
    onOpenAlert();
  };

  const deleteRecommendation = async () => {
    if (deleteRecommendationRef.current) {
      setSaving(true);
      const { data, error } = await inspectionApi.delete(
        `/recommendations/${deleteRecommendationRef.current}`
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
      onCloseAlert();
      await getRecommendations();
    }
  };

  const handleRecommendationForm = async (e) => {
    e.preventDefault();
    const recommendation = e.target?.text?.value?.trim();
    if (!recommendation || recommendation === "") {
      setFormErrors({ text: "Recommendation text is required" });
      return;
    }
    setFormErrors(null);
    setSaving(true);

    if (isEditing) {
      const { data, error } = await inspectionApi.put(
        `/recommendations/${editRecommendation?.id}`,
        { text: recommendation }
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
      await getRecommendations();
    } else {
      const { data, error } = await inspectionApi.post(`/recommendations`, {
        text: recommendation,
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
      e.target.reset();
      onClose();
      await getRecommendations();
    }
  };

  return (
    <PageLayout
      title="Recommendations"
      isRoot
      btn={"Create Recommendation"}
      onClick={handleTitleBtn}
    >
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterInput
          flexGrow={1}
          placeholder="Search by name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <InputBtn value="Search" onClick={searchByName} />
        <InputBtn value="Clear" onClick={clearSearch} />
      </Flex>
      {loading ? (
        <Loading />
      ) : (
        <>
          {recommendations.length !== 0 ? (
            <Grid gap={2}>
              {recommendations.map((recommendation) => (
                <Flex
                  key={recommendation?.id}
                  alignItems="center"
                  p={3}
                  borderRadius={"xl"}
                  bg={"main-bg"}
                  shadow={"xs"}
                  gap={2}
                >
                  <Box flexGrow={1}>
                    <Text color={"gray.700"}>{recommendation?.text}</Text>
                    <Text color={"gray.500"}>
                      Last Updated: {recommendation?.updated_at}
                    </Text>
                  </Box>
                  <Menu>
                    <MenuButton>
                      <MoreIcon />
                    </MenuButton>
                    <MenuList shadow={"lg"}>
                      <MenuItem
                        onClick={() =>
                          handleEditRecommendationBtn(recommendation)
                        }
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleDeleteRecommendationBtn(recommendation?.id)
                        }
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couldn't find any recommendations</DataNotFound>
          )}
          {pages && recommendations.length !== 0 && (
            <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
              <Button
                borderRadius={"full"}
                isDisabled={pages.prev === null}
                onClick={() =>
                  updateSearch("page", pages.prev.toString(), true)
                }
              >
                Prev
              </Button>
              <Text>Current Page: {pages.current_page}</Text>
              <Button
                borderRadius={"full"}
                isDisabled={pages.next === null}
                onClick={() =>
                  updateSearch("page", pages.next.toString(), true)
                }
              >
                Next
              </Button>
            </Flex>
          )}
        </>
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
            {isEditing ? "Edit Recommendation" : "Create New Recommendation"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="recommendation_form" onSubmit={handleRecommendationForm}>
              <FormTextarea
                id="text"
                name="text"
                placeholder="Recommendation text"
                label="Recommendation Text"
                inputError={formErrors?.text}
                defaultValue={editRecommendation?.text}
                px={1}
              />
            </form>
          </ModalBody>
          <ModalFooter gap={3} justifyContent={"start"}>
            <ButtonPrimary
              type="submit"
              form="recommendation_form"
              isLoading={saving}
              loadingText="Submitting"
            >
              {isEditing ? "Update" : "Create"}
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onCloseAlert}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete Recommendation
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
                onClick={deleteRecommendation}
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

export default Recommendations;

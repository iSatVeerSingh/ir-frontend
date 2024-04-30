import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import {
  Box,
  Button,
  Flex,
  Grid,
  Image,
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
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";
import clientApi from "../../api/clientApi";
import ButtonOutline from "../../components/ButtonOutline";
import FormSelect from "../../components/FormSelect";
import FormInput from "../../components/FormInput";
import FormTextarea from "../../components/FormTextarea";
import FileInput from "../../components/FileInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import { embeddedResized } from "../../utils/getResizedImages";

const InspectorLibraryItems = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const [pages, setPages] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();
  const [summaryItem, setSummaryItem] = useState(null);
  const [formErrors, setFormErrors] = useState(null);
  const [saving, setSaving] = useState(false);

  const getAllItems = async (url) => {
    setLoading(true);
    const { data, error } = await clientApi.get(url);
    if (error) {
      setLoading(false);
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    setItems(data.data);
    setPages(data.pages);
    setLoading(false);
  };

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

  useEffect(() => {
    (async () => {
      const { data, error } = await clientApi.get("/categories");
      if (error) {
        return;
      }
      const allCategories = data.map((item) => ({
        text: item.name,
        value: item.id,
      }));
      setCategories(allCategories);
    })();
  }, []);

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0
        ? "/items-library"
        : "/items-library?" + searchParams.toString();
    getAllItems(searchUrl);
  }, [searchParams]);

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("name", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

  const showSummaryItem = (item) => {
    setSummaryItem(item);
    onOpen();
  };

  const handleSuggestionForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const category = formData.get("category").trim();
    const name = formData.get("name").trim();
    const opening_paragraph = formData.get("opening_paragraph").trim();
    const closing_paragraph = formData.get("closing_paragraph").trim();
    const embedded_image = formData.get("embedded_image");

    const errors = {};

    if (!category || category === "") {
      errors.category = "Category is required";
    }

    if (name === "") {
      errors.name = "Name is required";
    }

    if (opening_paragraph === "") {
      errors.opening_paragraph = "Opening paragraph is required";
    }

    if (closing_paragraph === "") {
      errors.closing_paragraph = "Closing paragraph is required";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);

    setSaving(true);
    const newItem = {
      category,
      name,
      opening_paragraph,
      closing_paragraph,
    };

    if (embedded_image.size !== 0) {
      const resizedImage = await embeddedResized([embedded_image]);
      newItem.embedded_image = resizedImage[0];
    }

    const { data, error } = await inspectionApi.post("/suggest-item", newItem);
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setSaving(false);
      return;
    }

    toast({
      title: data?.message,
      duration: 3000,
      status: "success",
    });
    setSaving(false);
    formOnClose();
  };

  const handleTitleBtn = () => {
    formOnOpen();
  };

  return (
    <PageLayout
      title="Library Items"
      isRoot
      btn="Suggest Item"
      onClick={handleTitleBtn}
    >
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterSelect
          value={searchParams.get("category_id") || ""}
          onChange={(e) => updateSearch("category_id", e.target.value)}
          placeholder="Select a category"
          options={categories}
          maxW={"300px"}
        />
        <FilterInput
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
        <Box>
          {items.length !== 0 ? (
            <Grid gap={2}>
              {items.map((item) => (
                <Box
                  p={3}
                  bg={"main-bg"}
                  borderRadius={"xl"}
                  shadow={"xs"}
                  key={item.id}
                  onClick={() => showSummaryItem(item)}
                >
                  <Text fontSize={"lg"} fontWeight={"medium"}>
                    {item.name}
                  </Text>
                  <Text
                    color={"blue.600"}
                    maxW={"max-content"}
                    borderRadius={"md"}
                  >
                    {item.category}
                  </Text>
                  <Text color={"gray.600"}>
                    <Text as="span" color={"text.700"} fontWeight={"bold"}>
                      Summary:
                    </Text>
                    {item.summary === "" ? "N/A" : item.summary}
                  </Text>
                </Box>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Coundn't find any items</DataNotFound>
          )}
        </Box>
      )}
      {pages && items.length !== 0 && (
        <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
          <Button
            borderRadius={"full"}
            isDisabled={pages.prev === null}
            variant={"outline"}
            onClick={() => updateSearch("page", pages.prev.toString(), true)}
          >
            Prev
          </Button>
          <Text>Current Page: {pages.current_page}</Text>
          <Button
            borderRadius={"full"}
            variant={"outline"}
            isDisabled={pages.next === null}
            onClick={() => updateSearch("page", pages.next.toString(), true)}
          >
            Next
          </Button>
        </Flex>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Item Name
              </Text>
              <Text color={"gray.600"}>{summaryItem?.name}</Text>
            </Flex>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Category
              </Text>
              <Text color={"gray.600"}>{summaryItem?.category}</Text>
            </Flex>
            {/* <Text fontSize={"lg"} color={"gra.700"} minW={"200px"}>
              Embedded Images
            </Text>
            {summaryItem?.embedded_images &&
            summaryItem?.embedded_images?.length !== 0 ? (
              <Grid gridTemplateColumns={"1fr 1fr"} gap={2}>
                {summaryItem?.embedded_images?.map((img, index) => (
                  <Image src={img} w={"400px"} maxH={"400px"} key={index} />
                ))}
              </Grid>
            ) : (
              "N/A"
            )} */}
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Summary
              </Text>
              <Text color={"gray.600"}>{summaryItem?.summary || "N/A"}</Text>
            </Flex>
            <ButtonOutline onClick={onClose} mt={2}>
              Close
            </ButtonOutline>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={formIsOpen}
        onClose={formOnClose}
        closeOnOverlayClick={false}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Suggest Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="item_suggestion_form" onSubmit={handleSuggestionForm}>
              <VStack>
                <FormSelect
                  id="category"
                  placeholder="Select a category"
                  name="category"
                  label="Category"
                  options={categories.map((item) => item.text)}
                  inputError={formErrors?.category}
                />
                <FormInput
                  id="name"
                  name="name"
                  placeholder="enter item name"
                  label="Name"
                  inputError={formErrors?.name}
                />
                <FormTextarea
                  id="opening_paragraph"
                  name="opening_paragraph"
                  label="Opening Paragraph"
                  placeholder="type here"
                  inputError={formErrors?.opening_paragraph}
                />
                <FormTextarea
                  id="closing_paragraph"
                  name="closing_paragraph"
                  label="Closing Paragraph"
                  placeholder="type here"
                  inputError={formErrors?.closing_paragraph}
                />
                <FileInput
                  id="embedded_image"
                  name="embedded_image"
                  label="Embedded Image"
                  accept=".jpg, .png, .jpeg"
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter justifyContent={"start"} gap={3}>
            <ButtonPrimary
              type="submit"
              form="item_suggestion_form"
              isLoading={saving}
              loadingText="Sending"
            >
              Submit
            </ButtonPrimary>
            <ButtonOutline onClick={formOnClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default InspectorLibraryItems;

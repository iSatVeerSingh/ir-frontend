import { FormEventHandler, useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import clientApi from "../../api/clientApi";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import {
  Flex,
  Heading,
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
import DatalistInput from "../../components/DatalistInput";
import FileInput from "../../components/FileInput";
import FormTextArea from "../../components/FormTextarea";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOutline";
import getResizedImages from "../../utils/getResizedImages";
import FormInput from "../../components/FormInput";
import inspectionApi from "../../api/inspectionApi";

const AddItems = () => {
  const { job_number } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const categoryRef = useRef(null);
  const nameRef = useRef(null);
  const [filteredNames, setFilteredNames] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const imagesRef = useRef(null);
  const parentRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const { onOpen, isOpen, onClose } = useDisclosure();

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?job_number=${job_number}`);
      if (response.error) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get("/categories");
      if (response.error) {
        setLoading(false);
        return;
      }
      const allCategories = response.data.map((item) => item.name);
      setCategories(allCategories);

      response = await clientApi.get("/items-index");
      if (response.error) {
        setLoading(false);
        return;
      }
      setItems(response.data);
      setLoading(false);
    })();
  }, []);

  const onCategorySelect = () => {
    const category = categoryRef.current?.value.trim();
    if (!category || category === "") {
      return;
    }

    const filteredItems = items
      .filter((item) => item.category === category)
      .map((item) => item.name);

    nameRef.current.value = "";
    setFilteredNames(filteredItems);
    nameRef.current.focus();
  };

  const onNameSelect = () => {
    imagesRef.current?.showPicker();
  };

  const addItem = async (reportItem) => {
    let url = "/jobs/report-items";

    if (job.status === "Completed") {
      url = url + "?job_number=" + job_number;
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const serverResponse = await inspectionApi.post(
      "/report-items",
      reportItem,
      {},
      controller.signal
    );
    if (serverResponse.data) {
      clearTimeout(timeout);
      const { data, error } = await clientApi.post(url, {
        ...reportItem,
        sync: "Synced Online",
      });
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return false;
      }
      toast({
        title: data.message,
        status: "success",
      });
      setSaving(false);
      return true;
    } else if (serverResponse.error === "AbortError" || !navigator.onLine) {
      const { data, error } = await clientApi.post(url, reportItem);
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return false;
      }
      toast({
        title: data.message,
        status: "success",
      });
      setSaving(false);
      return true;
    } else {
      toast({
        title: serverResponse.error,
        status: "error",
      });
      setSaving(false);
      return false;
    }
  };

  const handleItemForm = async (e) => {
    e.preventDefault();
    const target = e.target;
    const formdata = new FormData(target);

    const itemData = {
      category: formdata.get("category")?.toString().trim(),
      name: formdata.get("name")?.toString().trim(),
      images: formdata.getAll("images"),
      note: formdata.get("note")?.toString().trim(),
    };

    const errors = {};
    if (!itemData.category || itemData.category === "") {
      errors.category = "Select a category";
    }

    if (!itemData.name || itemData.name === "") {
      errors.name = "Please select a name";
    }

    if (!itemData.images || itemData.images[0].size === 0) {
      errors.images = "Please select at least one images";
    }

    if (itemData.images.length > 8) {
      errors.images = "Max 8 images are allowed";
    }

    if (Object.entries(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);

    setSaving(true);

    const resizedImages = await getResizedImages(itemData.images);
    const libItem = items.find(
      (item) =>
        item.name === itemData.name && item.category === itemData.category
    );
    const reportItem = {
      id: crypto.randomUUID(),
      item_id: libItem.id,
      report_id: job.report_id,
      name: itemData.name,
      images: resizedImages,
      note: itemData.note,
      category: itemData.category,
      sync: job.report_id,
      previous_item: 0,
      created_at: new Date(),
    };

    parentRef.current.innerHTML = "";
    parentRef.current.style.width = "475pt";
    parentRef.current.style.fontFamily = "Times, serif";
    parentRef.current.style.fontSize = "11pt";
    parentRef.current.style.lineHeight = "normal";
    const imgdiv = document.createElement("div");
    imgdiv.style.display = "grid";
    imgdiv.style.gridTemplateColumns = "1fr 1fr";

    for (let i = 0; i < resizedImages.length; i++) {
      let itemImg = resizedImages[i];
      const img = document.createElement("img");
      img.src = itemImg;
      img.style.width = "200pt";
      img.style.height = "200pt";
      img.style.marginBottom = "4px";
      imgdiv.appendChild(img);
    }
    parentRef.current.appendChild(imgdiv);

    if (reportItem.note && reportItem.note !== "") {
      const noteP = document.createElement("p");
      noteP.innerHTML = "Note: " + "<br>" + reportItem.note;
      parentRef.current.appendChild(noteP);
    }

    const height = Math.ceil(parentRef.current.clientHeight * 0.75);
    reportItem.height = height;

    const isAdded = await addItem(reportItem);
    if (isAdded) {
      target.reset();
      categoryRef.current?.focus();
    }
  };

  const handleCustomItemForm = async (e) => {
    e.preventDefault();
    const target = e.target;
    const formdata = new FormData(target);

    const itemData = {
      name: formdata.get("name")?.toString().trim(),
      images: formdata.getAll("images"),
      opening_paragraph: formdata.get("opening_paragraph")?.toString().trim(),
      closing_paragraph: formdata.get("closing_paragraph")?.toString().trim(),
      embedded_image: formdata.get("embedded_image"),
      note: formdata.get("note")?.toString().trim(),
    };

    const errors = {};
    if (!itemData.name || itemData.name === "") {
      errors.name = "Name is required";
    }

    if (!itemData.images || itemData.images[0].size === 0) {
      errors.images = "Please select at least one images";
    }

    if (itemData.images.length > 8) {
      errors.images = "Max 8 images are allowed";
    }

    if (!itemData.opening_paragraph || itemData.opening_paragraph === "") {
      errors.opening_paragraph = "Opening paragraph is required";
    }
    if (!itemData.closing_paragraph || itemData.closing_paragraph === "") {
      errors.closing_paragraph = "Closing paragraph is required";
    }

    if (Object.entries(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);
    setSaving(true);

    const resizedImages = await getResizedImages(itemData.images);

    const reportItem = {
      id: crypto.randomUUID(),
      item_id: null,
      report_id: job.report_id,
      name: itemData.name,
      images: resizedImages,
      note: itemData.note,
      opening_paragraph: itemData.opening_paragraph,
      closing_paragraph: itemData.closing_paragraph,
      sync: job.report_id,
      previous_item: 0,
      created_at: new Date(),
    };

    if (itemData.embedded_image && itemData.embedded_image.size > 0) {
      const resizedEmbedded = await getResizedImagesBase64Main([
        itemData.embedded_image,
      ]);
      reportItem.embedded_image = resizedEmbedded[0];
    }

    parentRef.current.innerHTML = "";
    parentRef.current.style.width = "475pt";
    parentRef.current.style.fontFamily = "Times, serif";
    parentRef.current.style.fontSize = "11pt";
    parentRef.current.style.lineHeight = "normal";

    const namediv = document.createElement("p");
    namediv.textContent = reportItem.name;
    namediv.style.fontWeight = "bold";
    parentRef.current.appendChild(namediv);

    const openingDiv = document.createElement("div");
    openingDiv.innerHTML = reportItem.opening_paragraph;
    parentRef.current.appendChild(openingDiv);

    const imgdiv = document.createElement("div");
    imgdiv.style.display = "grid";
    imgdiv.style.gridTemplateColumns = "1fr 1fr";

    for (let i = 0; i < resizedImages.length; i++) {
      let itemImg = resizedImages[i];
      const img = document.createElement("img");
      img.src = itemImg;
      img.style.width = "220pt";
      img.style.height = "220pt";
      img.style.marginBottom = "4px";
      imgdiv.appendChild(img);
    }
    parentRef.current.appendChild(imgdiv);

    const closingDiv = document.createElement("div");
    closingDiv.innerHTML = reportItem.closing_paragraph;
    parentRef.current.appendChild(closingDiv);

    if (reportItem.embedded_image) {
      const img = document.createElement("img");
      img.src = reportItem.embedded_image;
      img.style.height = "200pt";
      parentRef.current.appendChild(img);
    }

    if (reportItem.note && reportItem.note !== "") {
      const noteP = document.createElement("p");
      noteP.innerHTML = "Note: " + "<br>" + reportItem.note;
      parentRef.current.appendChild(noteP);
    }

    const height = Math.ceil(parentRef.current.clientHeight * 0.75);
    reportItem.height = height;

    const isAdded = await addItem(reportItem);
    if (isAdded) {
      onClose();
    }
  };

  return (
    <PageLayout title="Add Items" btn="Add Custom Item" onClick={onOpen}>
      {loading ? (
        <Loading />
      ) : (
        <Card>
          <Heading
            as="h2"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight={"semibold"}
            color={"gray.700"}
          >
            &#35;{job?.job_number} - {job?.category}
          </Heading>
          <Flex alignItems={"center"}>
            <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
              Name On Report
            </Text>
            <Text color={"gray.600"}>{job?.customer?.name_on_report}</Text>
          </Flex>
          <Flex alignItems={"center"} mt={2} mb={3}>
            <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
              Site Address
            </Text>
            <Text color={"gray.600"}>{job?.site_address}</Text>
          </Flex>

          <form id="inspection_item_form" onSubmit={handleItemForm}>
            <VStack>
              <DatalistInput
                dataList={categories}
                id="category"
                name="category"
                ref={categoryRef}
                autoFocus
                inputError={formErrors?.category}
                label="Category"
                onSelect={onCategorySelect}
                placeholder="Search here for category"
              />

              <DatalistInput
                dataList={filteredNames}
                id="name"
                name="name"
                ref={nameRef}
                inputError={formErrors?.name}
                onSelect={onNameSelect}
                label="Name"
                placeholder="Search here for name"
              />
              <FileInput
                ref={imagesRef}
                id="images"
                name="images"
                inputError={formErrors?.images}
                label="Images"
                subLabel="max 8"
                multiple
                accept=".jpg, .png, .jpeg"
              />
              <FormTextArea
                id="note"
                name="note"
                label="Note"
                subLabel="optional"
                placeholder="Type note here"
              />
            </VStack>
          </form>
          <Flex gap={2} mt={2}>
            <ButtonPrimary
              minW={"150px"}
              type="submit"
              form="inspection_item_form"
              loadingText="Saving"
              isLoading={saving}
            >
              Add Item
            </ButtonPrimary>
            <ButtonOuline onClick={() => navigate(`/jobs/${job_number}`)}>
              Cancel
            </ButtonOuline>
          </Flex>
          <div
            style={{
              position: "absolute",
              zIndex: -2,
              top: -1000,
              left: 0,
              visibility: "hidden",
            }}
          >
            <div ref={parentRef}></div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={"2xl"}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCustomItemForm} id="custom_item_form">
              <VStack>
                <FormInput
                  label="Name"
                  id="name"
                  name="name"
                  placeholder="Enter item name"
                  inputError={formErrors?.name}
                />
                <FileInput
                  label="Images"
                  subLabel="max 8"
                  id="images"
                  name="images"
                  multiple
                  accept=".jpeg, .jpg, .png"
                  inputError={formErrors?.images}
                />
                <FormTextArea
                  label="Opening Paragraph"
                  id="opening_paragraph"
                  name="opening_paragraph"
                  placeholder="Opening paragraph for the item"
                  inputError={formErrors?.opening_paragraph}
                />
                <FileInput
                  label="Embedded Image"
                  subLabel="optional"
                  id="embedded_image"
                  name="embedded_image"
                  accept=".jpeg, .jpg, .png"
                />
                <FormTextArea
                  label="Closing Paragraph"
                  id="closing_paragraph"
                  name="closing_paragraph"
                  placeholder="Closing paragraph for the item"
                  inputError={formErrors?.closing_paragraph}
                />
                <FormTextArea
                  label="Note"
                  id="note"
                  name="note"
                  subLabel="optional"
                  placeholder="Type note here"
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3} justifyContent={"start"}>
            <ButtonPrimary
              form="custom_item_form"
              type="submit"
              w={"200px"}
              isLoading={saving}
              loadingText="Saving"
            >
              Add Item
            </ButtonPrimary>
            <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default AddItems;

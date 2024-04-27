import { Link, useParams, useSearchParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useRef, useState } from "react";
import inspectionApi from "../../api/inspectionApi";
import Loading from "../../components/Loading";
import Card from "../../components/Card";
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
  IconButton,
  Image,
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
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";
import FormTextarea from "../../components/FormTextarea";
import { CrossIcon, MoreIcon } from "../../icons";
import FileInput from "../../components/FileInput";
import getResizedImages from "../../utils/getResizedImages";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";
import FormInput from "../../components/FormInput";

const Report = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const toast = useToast();
  const [reportItems, setreportItems] = useState([]);
  const [pages, setPages] = useState(null);
  // const [editItem, setEditItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const newImagesRef = useRef(null);
  // const noteRef = useRef(null);
  const parentRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formErrors, setFormErrors] = useState(null);
  // const deleteItemRef = useRef(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const cancelRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );

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

  const getReport = async () => {
    const { data, error } = await inspectionApi.get(`/reports/${id}`);
    if (error) {
      setLoading(false);
      return;
    }
    setReport(data.data);
  };

  const getreportItems = async (url = `/report-items?report_id=${id}`) => {
    setLoading(true);
    const { data, error } = await inspectionApi.get(url);
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setLoading(false);
      return;
    }
    setreportItems(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    getReport();
    getreportItems();
  }, []);

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0
        ? `/report-items?report_id=${id}`
        : `/report-items?report_id=${id}&` + searchParams.toString();
    // getAllItems(searchUrl);
    getreportItems(searchUrl);
  }, [searchParams]);

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

  // const handleEditBtn = (item) => {
  //   setEditItem(item);
  //   onOpen();
  // };

  // const handleRemoveImgBtn = (img) => {
  //   setEditItem((prev) => {
  //     return { ...prev, images: prev.images.filter((i) => i !== img) };
  //   });
  // };

  // const handleEditreportItem = async () => {
  //   const images = editItem?.images;

  //   const newImagesFiles = newImagesRef.current?.files;
  //   const newImages = await getResizedImages(newImagesFiles);
  //   const note = noteRef.current?.value?.trim();

  //   const newreportItem = {
  //     images: [...images, ...newImages],
  //     note: note !== "" ? note : null,
  //     previousItem: false,
  //     previous_item_id: null,
  //   };

  //   if (newreportItem.images.length === 0) {
  //     return;
  //   }

  //   setSaving(true);
  //   parentRef.current.innerHTML = "";
  //   parentRef.current.style.width = "475pt";
  //   parentRef.current.style.fontFamily = "Times, serif";
  //   parentRef.current.style.fontSize = "11pt";
  //   parentRef.current.style.lineHeight = "normal";
  //   const imgdiv = document.createElement("div");
  //   imgdiv.style.display = "grid";
  //   imgdiv.style.gridTemplateColumns = "1fr 1fr";

  //   for (let i = 0; i < newreportItem.images.length; i++) {
  //     let itemImg = newreportItem.images[i];
  //     const img = document.createElement("img");
  //     img.src = itemImg;
  //     img.style.width = "200pt";
  //     img.style.height = "200pt";
  //     img.style.marginBottom = "4px";
  //     imgdiv.appendChild(img);
  //   }
  //   parentRef.current.appendChild(imgdiv);

  //   if (newreportItem.note && newreportItem.note !== "") {
  //     const noteP = document.createElement("p");
  //     noteP.innerHTML = "Note: " + "<br>" + newreportItem.note;
  //     parentRef.current.appendChild(noteP);
  //   }

  //   const height = Math.ceil(parentRef.current.clientHeight * 0.75);
  //   newreportItem.height = height;

  //   if (newreportItem.images.length > 6) {
  //     newreportItem.height = height + 130;
  //   }

  //   const { error, data } = await inspectionApi.put(
  //     `/inspection-items/${editItem?.id}`,
  //     newreportItem
  //   );
  //   if (error) {
  //     toast({ title: error, duration: 4000, status: "error" });
  //     setSaving(false);
  //     return;
  //   }
  //   toast({ title: data?.message, status: "success", duration: 3000 });
  //   setSaving(false);
  //   onClose();
  //   await getreportItems();
  // };

  const regenerateReport = async () => {
    setGenerating(true);
    const { error, data } = await inspectionApi.post(`/generate-report`, {
      report_id: report.id,
      job_id: report.job_id,
      customer_id: report.customer_id,
      notes: report.notes,
      recommendation: report.recommendation,
    });
    if (error) {
      toast({ title: error, status: "error", duration: 4000 });
      setGenerating(false);
      return;
    }
    toast({
      title: "Report generated successfully",
      status: "success",
      duration: 3000,
    });
    setGenerating(false);
    await getReport();
  };

  // const handleDeleteBtn = (id) => {
  //   deleteItemRef.current = id;
  //   onOpenAlert();
  // };

  // const deleteItem = async () => {
  //   if (deleteItemRef.current) {
  //     setSaving(true);
  //     const { error, data } = await inspectionApi.delete(
  //       `/inspection-items/${deleteItemRef.current}`
  //     );
  //     if (error) {
  //       toast({ title: error, status: "error", duration: 4000 });
  //       setSaving(false);
  //       return;
  //     }
  //     toast({ title: data?.message, status: "success", duration: 3000 });
  //     setSaving(false);
  //     onCloseAlert();
  //     await getreportItems();
  //   }
  // };

  const handleDuplicateReportBtn = () => {
    onOpenAlert();
  };

  const generateEmptyReport = async () => {
    setSaving(false);
    const { data, error } = await inspectionApi.post("/reports", {
      id: crypto.randomUUID(),
      job_id: report.job_id,
      customer_id: report.customer_id,
      original_report_id: report.id,
      is_revised: true,
      notes: report.notes,
      recommendation: report.recommendation,
    });

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
      status: "success",
      title: "Emtpy report created successfully",
      duration: 3000,
    });
    setSaving(false);
    onCloseAlert();
    await getReport();
  };

  const handleTitleBtn = () => {
    onOpen();
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
      report_id: report.id,
      name: itemData.name,
      images: resizedImages,
      note: itemData.note,
      opening_paragraph: itemData.opening_paragraph,
      closing_paragraph: itemData.closing_paragraph,
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

    const { data, error } = await inspectionApi.post(
      "/report-items",
      reportItem
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
    target.reset();
    onClose();
  };

  return (
    <PageLayout
      title="Report"
      btn={report?.is_revised ? "Add Report Item" : undefined}
      onClick={report?.is_revised ? handleTitleBtn : undefined}
    >
      {loading ? (
        <Loading />
      ) : report ? (
        <>
          <Card>
            <Heading
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight={"semibold"}
              color={"text.700"}
            >
              &#35;{report?.job_number} - {report?.category}
            </Heading>
            <Grid gap={2}>
              <Flex alignItems={"center"}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Name On Report
                </Text>
                <Text color={"text.600"}>{report?.customer_name}</Text>
              </Flex>
              <Flex alignItems={"center"}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Inspector
                </Text>
                <Text color={"text.600"}>{report?.inspector}</Text>
              </Flex>
              <Flex alignItems={"center"}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Site Address
                </Text>
                <Text color={"text.600"}>{report?.site_address}</Text>
              </Flex>
              <Flex alignItems={"center"}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Completed At
                </Text>
                <Text color={"text.600"}>
                  {report?.completed_at || "In Progress"}
                </Text>
              </Flex>
              {report?.notes && report?.notes.length !== 0 && (
                <Flex direction={"column"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Report Notes
                  </Text>
                  <Flex direction={"column"} px={2} color={"gray.600"}>
                    {report?.notes.map((note, index) => (
                      <Text key={index}>{note}</Text>
                    ))}
                  </Flex>
                </Flex>
              )}
            </Grid>
            {report.completed_at ? (
              <>
                <Flex alignItems={"center"} gap={3} mt={3}>
                  <ButtonPrimary
                    onClick={regenerateReport}
                    isLoading={generating}
                    loadingText="Generating report"
                  >
                    Regenerate Report
                  </ButtonPrimary>
                  {!generating && (
                    <a
                      href={`https://${location.hostname}/api/pdf-report/${id}/${report?.category} - ${report?.customer}.pdf`}
                      target="_blank"
                      style={{
                        textDecoration: "underline",
                        color: "blue",
                        fontSize: "20px",
                      }}
                    >
                      Click to view pdf
                    </a>
                  )}
                </Flex>
                {report?.revised_report_id ? (
                  <Text mt={3}>
                    A duplicate revised report has been generated.
                  </Text>
                ) : (
                  !report.is_revised && (
                    <ButtonOutline mt={3} onClick={handleDuplicateReportBtn}>
                      Generate a new duplicate revised report
                    </ButtonOutline>
                  )
                )}
              </>
            ) : report?.is_revised ? (
              <Box mt={3}>
                <Text color="red.400">
                  This is a revised report still in progress. Please generate a
                  report
                </Text>
                <ButtonPrimary
                  onClick={regenerateReport}
                  isLoading={generating}
                  loadingText="Generating report"
                >
                  Generate Report
                </ButtonPrimary>
              </Box>
            ) : (
              <Text color={"red.400"} mt={3}>
                This is report is in progress
              </Text>
            )}
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
          <Flex gap={3} mb={3} alignItems={"center"} mt={3}>
            <Text>Filter</Text>
            <FilterInput
              placeholder="Search by name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <InputBtn value="Search" onClick={searchByName} />
            <InputBtn value="Clear" onClick={clearSearch} />
          </Flex>
          {reportItems.length !== 0 ? (
            <Grid mt={3} gap={2}>
              {reportItems.map((item) => (
                <Link key={item?.id} to={"./" + item.id} state={{ report }}>
                  <Box
                    flexGrow={1}
                    p={3}
                    bg={"main-bg"}
                    rounded={"xl"}
                    key={item?.id}
                  >
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"lg"} color={"gray.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"gray.500"}>
                        Total Images: {item?.total_images}
                      </Text>
                    </Flex>
                    <Text
                      color={"blue.500"}
                      borderRadius={"md"}
                      maxW={"max-content"}
                    >
                      {item?.category}
                    </Text>
                    <Text color={"gray.600"} mt={1}>
                      Note:{" "}
                      {item?.note && item?.note !== "" ? item.note : "N/A"}
                    </Text>
                  </Box>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound>
              Coudn't find any inspection items for this report
            </DataNotFound>
          )}
        </>
      ) : (
        <DataNotFound>Report not found</DataNotFound>
      )}
      {pages && reportItems.length !== 0 && (
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
                  placeholder="type name here"
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
                <FormTextarea
                  label="Opening Paragraph"
                  id="opening_paragraph"
                  name="opening_paragraph"
                  placeholder="type here"
                  inputError={formErrors?.opening_paragraph}
                />
                <FileInput
                  label="Embedded Image"
                  subLabel="optional"
                  id="embedded_image"
                  name="embedded_image"
                  accept=".jpeg, .jpg, .png"
                />
                <FormTextarea
                  label="Closing Paragraph"
                  id="closing_paragraph"
                  name="closing_paragraph"
                  placeholder="type here"
                  inputError={formErrors?.closing_paragraph}
                />
                <FormTextarea
                  label="Note"
                  id="note"
                  name="note"
                  subLabel="optional"
                  placeholder="type note here"
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
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Create Revised Report
            </AlertDialogHeader>

            <AlertDialogBody>
              This will create a new revised report. You can add, update or
              delete items in new revised report. The items from original report
              will remain untouched. Are you sure you want to create a duplicate
              report?.
            </AlertDialogBody>

            <AlertDialogFooter gap={2}>
              <ButtonOutline ref={cancelRef} onClick={onCloseAlert}>
                Cancel
              </ButtonOutline>
              <ButtonPrimary
                onClick={generateEmptyReport}
                isLoading={saving}
                loadingText="Generating"
              >
                Create
              </ButtonPrimary>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>View & Edit Inspection Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Item Name
              </Text>
              <Text color={"gray.600"}>{editItem?.name}</Text>
            </Flex>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Category
              </Text>
              <Text color={"gray.600"}>{editItem?.category}</Text>
            </Flex>
            <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
              Images
            </Text>
            <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2}>
              {editItem?.images?.length !== 0 ? (
                editItem?.images.map((img, index) => (
                  <Box key={index} position={"relative"}>
                    <IconButton
                      icon={<CrossIcon boxSize={5} />}
                      rounded={"full"}
                      position={"absolute"}
                      top={0}
                      right={0}
                      size={"sm"}
                      zIndex={50}
                      color={"red"}
                      onClick={() => handleRemoveImgBtn(img)}
                    />
                    <Image src={img} w={"200px"} maxH={"300px"} key={index} />
                  </Box>
                ))
              ) : (
                <Text color={"gray.600"}>N/A</Text>
              )}
            </Grid>
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Note
              </Text>
              <FormTextarea
                id="note"
                placeholder="type note here"
                defaultValue={editItem?.note}
                ref={noteRef}
              />
            </Flex>
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Summary
              </Text>
              <Text color={"gray.600"}>{editItem?.summary || "N/A"}</Text>
            </Flex>
            <FileInput
              id="newimages"
              label="New Images"
              ref={newImagesRef}
              subLabel="upload extra images here"
              multiple
              accept=".jpg, .png, .jpeg"
            />
          </ModalBody>

          <ModalFooter justifyContent={"start"} gap={3}>
            <ButtonPrimary
              onClick={handleEditreportItem}
              isLoading={saving}
              loadingText="Saving"
            >
              Update
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Close</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </PageLayout>
  );
};

export default Report;

import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useRef, useState } from "react";
import inspectionApi from "../../api/inspectionApi";
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
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Loading from "../../components/Loading";
import Card from "../../components/Card";
import DataNotFound from "../../components/DataNotFound";
import { CrossIcon } from "../../icons";
import FormTextarea from "../../components/FormTextarea";
import FileInput from "../../components/FileInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";
import getResizedImages from "../../utils/getResizedImages";

const ReportItem = () => {
  const { id } = useParams();

  const {
    state: { report },
  } = useLocation();

  const [loading, setLoading] = useState(true);
  const [reportItem, setReportItem] = useState(null);
  const toast = useToast();
  const noteRef = useRef(null);
  const parentRef = useRef(null);
  const newImagesRef = useRef(null);
  const editItemRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDeleteAlert,
    onOpen: onOpenDeleteAlert,
    onClose: onCloseDeleteAlert,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const cancelRefDelete = useRef(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const getReportItem = async () => {
    const { data, error } = await inspectionApi.get(`/report-items/${id}`);
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setLoading(false);
      return;
    }

    setReportItem(data.data);
    setLoading(false);
  };

  useEffect(() => {
    getReportItem();
  }, []);

  const handleRemoveImgBtn = (img) => {
    setReportItem((prev) => {
      return { ...prev, images: prev.images.filter((i) => i !== img) };
    });
  };

  const handleEditItemBtn = async () => {
    if (!report?.is_revised) {
      return;
    }

    const images = reportItem.images;

    const newImagesFiles = newImagesRef.current.files;
    const newImages = await getResizedImages(newImagesFiles);
    const note = noteRef.current?.value?.trim();

    if (images.length === 0 && newImages.length === 0) {
      toast({
        title: "Please add any images",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const newReportItem = {
      id: crypto.randomUUID(),
      item_id: reportItem?.item_id,
      report_id: report.id,
      name: reportItem.name,
      images: [...images, ...newImages],
      note: note,
      previous_report_item_id: reportItem.previous_report_item_id || null,
      opening_paragraph: reportItem.opening_paragraph || null,
      closing_paragraph: reportItem.closing_paragraph || null,
      embedded_image: reportItem.embedded_image || null,
      is_revised: false,
      original_report_item_id: reportItem.id,
    };

    parentRef.current.innerHTML = "";
    parentRef.current.style.width = "475pt";
    parentRef.current.style.fontFamily = "Times, serif";
    parentRef.current.style.fontSize = "11pt";
    parentRef.current.style.lineHeight = "normal";
    const imgdiv = document.createElement("div");
    imgdiv.style.display = "grid";
    imgdiv.style.gridTemplateColumns = "1fr 1fr";

    for (let i = 0; i < newReportItem.images.length; i++) {
      let itemImg = newReportItem.images[i];
      const img = document.createElement("img");
      img.src = itemImg;
      img.style.width = "200pt";
      img.style.height = "200pt";
      img.style.marginBottom = "4px";
      imgdiv.appendChild(img);
    }
    parentRef.current.appendChild(imgdiv);

    if (newReportItem.note && newReportItem.note !== "") {
      const noteP = document.createElement("p");
      noteP.innerHTML = "Note: " + "<br>" + newReportItem.note;
      parentRef.current.appendChild(noteP);
    }

    if (!newReportItem.item_id) {
      const opening_paragraphDiv = document.createElement("p");
      (opening_paragraphDiv.innerHTML = newReportItem.opening_paragraph),
        parentRef.current.appendChild(opening_paragraphDiv);

      const closing_paragraphDiv = document.createElement("p");
      (closing_paragraphDiv.innerHTML = newReportItem.closing_paragraph),
        parentRef.current.appendChild(closing_paragraphDiv);

      if (newReportItem.embedded_image) {
        const embimg = document.createElement("img");
        embimg.src = newReportItem.embedded_image;
        parentRef.current.appendChild(embimg);
      }
    }

    const height = Math.ceil(parentRef.current.clientHeight * 0.75);
    newReportItem.height = height;

    editItemRef.current = newReportItem;
    onOpen();
  };

  const handleEditItem = async () => {
    if (!editItemRef.current) {
      return;
    }
    setSaving(true);
    if (
      reportItem.report_id === report.id &&
      reportItem?.original_report_item_id
    ) {
      const { data, error } = await inspectionApi.put(
        `/report-items/${reportItem.id}`,
        {
          images: editItemRef.current.images,
          note: editItemRef.current.note,
          height: editItemRef.current.height,
        }
      );
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
        title: data.message,
        duration: 3000,
        status: "success",
      });
      setSaving(false);
      newImagesRef.current.value = "";
      onClose();
    } else {
      const { data, error } = await inspectionApi.post(
        "/report-items",
        editItemRef.current
      );
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
        title: data.message,
        duration: 3000,
        status: "success",
      });
      setSaving(false);
      newImagesRef.current.value = "";
      onClose();
    }
  };

  const handleDeleteBtn = () => {
    onOpenDeleteAlert();
  };

  const deleteItem = async () => {
    setSaving(true);
    if (
      reportItem.report_id === report.id &&
      reportItem?.original_report_item_id
    ) {
      const { data, error } = await inspectionApi.delete(
        `/report-items/${reportItem.id}`
      );
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
      onCloseDeleteAlert();
      navigate(-1);
    } else {
      const { data, error } = await inspectionApi.put(
        `/report-items/${reportItem.id}`,
        {
          is_revised: true,
          revised_report_id: report.id,
        }
      );

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
        title: data.message,
        duration: 3000,
        status: "success",
      });
      setSaving(false);
      onCloseDeleteAlert();
      navigate(-1);
    }
  };

  return (
    <PageLayout title="Report Item">
      {loading ? (
        <Loading />
      ) : !reportItem ? (
        <DataNotFound>Report item not found</DataNotFound>
      ) : (
        <>
          {report?.is_revised ? (
            <Card>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight={"semibold"}
                color={"text.700"}
              >
                &#35;{report?.job_number} - {report?.category}
              </Heading>
              {report?.is_revised && (
                <Text color={"orange.500"}>
                  The report is a duplicate revised report.
                </Text>
              )}
              <Flex alignItems={"center"} mb={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Item Name
                </Text>
                <Text color={"gray.600"}>{reportItem?.name}</Text>
              </Flex>
              <Flex alignItems={"center"} mb={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Category
                </Text>
                <Text color={"gray.600"}>{reportItem?.category}</Text>
              </Flex>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Images
              </Text>
              <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2} maxW={"700px"}>
                {reportItem?.images?.length
                  ? reportItem.images.map((img, index) => (
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
                        <Image src={img} maxH={"300px"} key={index} />
                      </Box>
                    ))
                  : "N/A"}
              </Grid>
              <Box mt={2}>
                <FileInput
                  id="newimages"
                  label="New Images"
                  ref={newImagesRef}
                  subLabel="upload extra images here"
                  multiple
                  accept=".jpg, .png, .jpeg"
                />
              </Box>
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Note
                </Text>
                <FormTextarea
                  id="note"
                  placeholder="type note here"
                  defaultValue={reportItem?.note}
                  ref={noteRef}
                />
              </Flex>
              {!reportItem.item_id && (
                <>
                  <Flex direction={"column"} mt={2}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Opening Paragaph
                    </Text>
                    <Text color={"gray.600"}>
                      {reportItem?.opening_paragraph || "N/A"}
                    </Text>
                  </Flex>
                  <Flex direction={"column"} mt={2}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Closing Paragraph
                    </Text>
                    <Text color={"gray.600"}>
                      {reportItem?.closing_paragraph || "N/A"}
                    </Text>
                  </Flex>
                  {reportItem.embedded_image && (
                    <Flex direction={"column"} mt={2}>
                      <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                        Embedded Image
                      </Text>
                      <Text color={"gray.600"}>
                        <Image
                          src={reportItem.embedded_image}
                          width={"200px"}
                        />
                      </Text>
                    </Flex>
                  )}
                </>
              )}
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Summary
                </Text>
                <Text color={"gray.600"}>{reportItem?.summary || "N/A"}</Text>
              </Flex>

              <Flex
                alignItems={"center"}
                justify={"space-between"}
                gap={2}
                mt={3}
              >
                <Flex alignItems={"center"} gap={2}>
                  <ButtonPrimary onClick={handleEditItemBtn}>
                    Update
                  </ButtonPrimary>
                  <ButtonOutline onClick={() => navigate(-1)}>
                    Close
                  </ButtonOutline>
                </Flex>
                <Button
                  colorScheme="red"
                  rounded={"full"}
                  onClick={handleDeleteBtn}
                >
                  Delete
                </Button>
              </Flex>
            </Card>
          ) : (
            <Card>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight={"semibold"}
                color={"text.700"}
              >
                &#35;{report?.job_number} - {report?.category}
              </Heading>
              <Flex alignItems={"center"} mb={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Item Name
                </Text>
                <Text color={"gray.600"}>{reportItem?.name}</Text>
              </Flex>
              <Flex alignItems={"center"} mb={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Category
                </Text>
                <Text color={"gray.600"}>{reportItem?.category}</Text>
              </Flex>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Images
              </Text>
              <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={3} maxW={"700px"}>
                {reportItem?.images.map((img, index) => (
                  <Image src={img} key={index} maxHeight={"300px"} />
                ))}
              </Grid>
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Note
                </Text>
                <Text color={"gray.600"}>{reportItem?.note || "N/A"}</Text>
              </Flex>
              {reportItem.embedded_image && (
                <Flex direction={"column"} mt={2}>
                  <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                    Embedded Image
                  </Text>
                  <Text color={"gray.600"}>
                    <Image src={reportItem.embedded_image} width={"200px"} />
                  </Text>
                </Flex>
              )}
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Summary
                </Text>
                <Text color={"gray.600"}>{reportItem?.summary || "N/A"}</Text>
              </Flex>
              <Box mt={3}>
                {reportItem?.is_revised ? (
                  <Text color={"orange.500"}>
                    This item has already revised in new revised report{" "}
                  </Text>
                ) : (
                  <Text color={"orange.500"}>
                    You can update or delete this item in new duplicate revised
                    report.
                  </Text>
                )}
              </Box>
            </Card>
          )}
        </>
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

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Edit and Revise Item
            </AlertDialogHeader>
            <AlertDialogBody>
              After updating the item, this will be revised in new revised
              report and original report item will remain unchanged.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <ButtonOutline
                borderRadius={"full"}
                ref={cancelRef}
                onClick={onClose}
              >
                Cancel
              </ButtonOutline>
              <ButtonPrimary
                borderRadius={"full"}
                isLoading={saving}
                loadingText="Submitting"
                onClick={handleEditItem}
              >
                Submit
              </ButtonPrimary>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isOpenDeleteAlert}
        leastDestructiveRef={cancelRefDelete}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Edit and Revise Item
            </AlertDialogHeader>
            <AlertDialogBody>
              This item will be removed from new duplicate revised report but
              will remain unchanged in original report. Are you sure you want to
              remove this item?
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <ButtonOutline
                borderRadius={"full"}
                ref={cancelRefDelete}
                onClick={onCloseDeleteAlert}
              >
                Cancel
              </ButtonOutline>
              <ButtonPrimary
                colorScheme="red"
                borderRadius={"full"}
                isLoading={saving}
                loadingText="Submitting"
                onClick={deleteItem}
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

export default ReportItem;

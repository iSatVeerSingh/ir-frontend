import { useParams } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import PageLayout from "../../layouts/PageLayout";
import Card from "../../components/Card";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import Loading from "../../components/Loading";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import ButtonOutline from "../../components/ButtonOutline";
import { DeleteIcon, PlusIcon } from "../../icons";
import FileInput from "../../components/FileInput";
import getResizedImages from "../../utils/getResizedImages";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";
import useAxios from "../../utils/useAxios";

const PreviousReport = () => {
  const { job_number } = useParams();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [fetchingOnline, setFetchingOnline] = useState(false);
  const [previousReport, setPreviousReport] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const itemRef = useRef();
  const filterRef = useRef(null);
  const toast = useToast();
  const [inputError, setInputError] = useState();

  const { progress, fetchData } = useAxios();

  const { onOpen, onClose, isOpen } = useDisclosure();
  const {
    onOpen: onOpenForm,
    onClose: onCloseForm,
    isOpen: isOpenForm,
  } = useDisclosure();
  const {
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
    isOpen: isOpenAlert,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const imagesRef = useRef(null);

  const [previousItemIds, setPreviousItemIds] = useState([]);

  const getPreviousItemsIds = async (report_id = job.report_id) => {
    const response = await clientApi.get(
      `/previous-item-id?report_id=${report_id}`
    );
    if (response.error) {
      return;
    }
    setPreviousItemIds(response.data);
  };

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?job_number=${job_number}`);
      if (response.error) {
        setLoading(false);
        return;
      }
      const jobdata = response.data;
      setJob(jobdata);

      response = await clientApi.get(
        `/previous-report?job_number=${job_number}`
      );
      setLoading(false);
      if (response.error) {
        setFetchingOnline(true);
        const previousResponse = await fetchData(
          `/previous-report?customer_id=${jobdata.customer.id}`
        );
        if (previousResponse.error) {
          toast({
            title: previousResponse.error,
            duration: 4000,
            status: "error",
          });
          setFetchingOnline(false);
          return;
        }
        const res = await clientApi.post(
          `/previous-report?job_number=${job_number}`,
          previousResponse.data
        );
        if (res.error) {
          setFetchingOnline(false);
          return;
        }
        setPreviousReport(previousResponse.data);
        setFilteredItems(previousResponse.data.report_items);
        setFetchingOnline(false);
        return;
      }
      setPreviousReport(response.data);
      setFilteredItems(response.data.report_items);

      await getPreviousItemsIds(jobdata.report_id);
    })();
  }, []);

  const previewItem = (item) => {
    itemRef.current = item;
    onOpen();
  };

  const handleAddBtn = (item) => {
    itemRef.current = item;
    onOpenForm();
  };

  const isAdded = (itemid) => {
    return !!previousItemIds.find(
      (item) => item.previous_report_item_id === itemid
    );
  };

  const addItem = async (isImages) => {
    const reportItem = {
      id: crypto.randomUUID(),
      item_id: itemRef.current.item_id || null,
      report_id: job.report_id,
      name: itemRef.current.name,
      images: [],
      previous_item_images: itemRef.current.images,
      note: itemRef.current.note,
      height: itemRef.current.height,
      previous_report_item_id: itemRef.current.id,
      previous_item: 1,
      sync: job.report_id,
      category: itemRef.current.category,
    };

    if (isImages) {
      const files = imagesRef.current?.files;
      if (files?.length === 0) {
        return;
      }

      if (files.length > 8) {
        setInputError("Max 8 images allowed");
        return;
      }

      setInputError(undefined);

      const resizedImages = await getResizedImages(files);
      reportItem.images = resizedImages;
      reportItem.height =
        itemRef.current.images.length % 2 !== 0
          ? Math.ceil((resizedImages.length - 1) / 2) * 200 +
            itemRef.current.height
          : Math.ceil((resizedImages.length - 1) / 2) * 200 +
            itemRef.current.height;
    }

    let url = "/jobs/report-items";

    if (job.status === "Completed") {
      url = url + "?job_number=" + job_number;
    }

    const { data, error } = await clientApi.post(url, reportItem);
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }

    toast({
      title: data.message,
      duration: 4000,
      status: "success",
    });
    onCloseForm();
    await getPreviousItemsIds();
  };

  const handleRemoveItembtn = (item) => {
    itemRef.current = item;
    onOpenAlert();
  };

  const deleteItem = async () => {
    const reportItem = previousItemIds.find(
      (item) => item.previous_report_item_id === itemRef.current.id
    );
    if (!reportItem) {
      return;
    }

    const { data, error } = await clientApi.delete(
      `/jobs/report-items?id=${reportItem?.id}`
    );
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }

    toast({
      title: data.message,
      duration: 4000,
      status: "success",
    });
    onCloseAlert();
    await getPreviousItemsIds();
  };

  const filterSearch = (e) => {
    const searchTerm = e.target.value.trim();
    if (!searchTerm || searchTerm === "") {
      return;
    }

    const filtered = previousReport?.report_items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredItems(filtered);
  };

  const clearSearch = () => {
    setFilteredItems(previousReport?.report_items);
    filterRef.current.value = "";
  };

  return (
    <PageLayout title="Add Items From Previous Report">
      {loading ? (
        <Loading />
      ) : (
        <>
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
            {previousReport && (
              <>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight={"semibold"}
                  color={"gray.700"}
                >
                  Previous Report
                </Heading>
                <Flex alignItems={"center"} mb={2}>
                  <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                    Job
                  </Text>
                  <Text color={"gray.600"}>
                    {previousReport?.previous_job} - {previousReport?.category}
                  </Text>
                </Flex>
                <Flex alignItems={"center"} mb={2}>
                  <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                    Completed At
                  </Text>
                  <Text color={"gray.600"}>{previousReport?.completed_at}</Text>
                </Flex>
              </>
            )}
          </Card>
          <Flex mt={2} alignItems={"center"} gap={2}>
            <Text>Filter</Text>
            <FilterInput
              placeholder="Search by name, category"
              onChange={filterSearch}
              ref={filterRef}
            />
            <InputBtn value="Clear" onClick={clearSearch} />
          </Flex>
          {previousReport ? (
            <Grid gap={2} mt={2}>
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  display={"flex"}
                  gap={2}
                  alignItems={"center"}
                >
                  <Box flexGrow={1} onClick={() => previewItem(item)}>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"lg"} color={"gray.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"gray.500"}>
                        Images: {item?.images?.length}
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
                      Note:
                      {item?.note && item?.note !== "" ? item.note : "N/A"}
                    </Text>
                  </Box>
                  {isAdded(item.id) ? (
                    <Box>
                      <Text fontSize={"xs"} color={"gray.500"}>
                        Remove
                      </Text>
                      <IconButton
                        minW={"60px"}
                        colorScheme="red"
                        variant={"outline"}
                        icon={<DeleteIcon />}
                        aria-label="Remove Item"
                        onClick={() => handleRemoveItembtn(item)}
                      />
                    </Box>
                  ) : (
                    <Box textAlign={"center"}>
                      <Text fontSize={"xs"} color={"gray.500"}>
                        ADD
                      </Text>
                      <IconButton
                        minW={"60px"}
                        icon={<PlusIcon />}
                        aria-label="Add Item"
                        onClick={() => handleAddBtn(item)}
                      />
                    </Box>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <Card mt={2}>
              {fetchingOnline ? (
                <Box textAlign={"center"}>
                  <Text>
                    No previous report for this customer found in offline
                    database. Fetching from server
                  </Text>
                  <Progress
                    maxW={"400px"}
                    mx={"auto"}
                    value={progress}
                    mt={2}
                    rounded={"full"}
                  />
                </Box>
              ) : (
                <DataNotFound>
                  Couldn't find any previous reports for this customer.
                </DataNotFound>
              )}
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        returnFocusOnClose={false}
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
              <Text color={"gray.600"}>{itemRef.current?.name}</Text>
            </Flex>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Category
              </Text>
              <Text color={"gray.600"}>{itemRef.current?.category}</Text>
            </Flex>
            <Text fontSize={"lg"} color={"gra.700"} minW={"200px"}>
              Images
            </Text>
            <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2}>
              {itemRef.current?.images.map((img, index) => (
                <Image src={img} w={"200px"} maxH={"300px"} key={index} />
              ))}
            </Grid>
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Note
              </Text>
              <Text color={"gray.600"}>{itemRef.current?.note || "N/A"}</Text>
            </Flex>
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Summary
              </Text>
              <Text color={"gray.600"}>
                {itemRef.current?.summary || "N/A"}
              </Text>
            </Flex>
            <ButtonOutline onClick={onClose} mt={2}>
              Close
            </ButtonOutline>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenForm}
        onClose={onCloseForm}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Images</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FileInput
              id="images"
              multiple
              accept=".png, .jpg, .jpeg"
              ref={imagesRef}
              inputError={inputError}
            />
          </ModalBody>
          <ModalFooter gap={2}>
            <ButtonPrimary onClick={() => addItem(true)}>
              Add Images
            </ButtonPrimary>
            <ButtonOutline onClick={() => addItem(false)}>Skip</ButtonOutline>
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
              Delete Item
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
                loadingText="Submitting"
                onClick={deleteItem}
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

export default PreviousReport;

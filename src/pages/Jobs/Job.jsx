import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Flex,
  Grid,
  Heading,
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
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
import ButtonPrimary from "../../components/ButtonPrimary";
import DatalistInput from "../../components/DatalistInput";
import ButtonOutline from "../../components/ButtonOutline";
import inspectionApi, { inspectionApiAxios } from "../../api/inspectionApi";
// reports@correctinspections.com.au

const Job = () => {
  const { job_number } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [starting, setStarting] = useState(false);
  const cancelRef = useRef(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const recommendationRef = useRef(null);

  const getJob = async () => {
    setLoading(true);
    const { error, data } = await clientApi.get(
      `/jobs?job_number=${job_number}`
    );
    if (error) {
      setLoading(false);
      return;
    }
    setJob(data);

    const response = await clientApi.get("/recommendations");
    if (response.data) {
      const allRecommendations = response.data.map((item) => item);
      setRecommendations(allRecommendations);
    }
    setLoading(false);
  };

  useEffect(() => {
    getJob();
  }, []);

  const startInspection = async () => {
    setStarting(true);
    const report_id = crypto.randomUUID();

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const serverResponse = await inspectionApi.post("/reports", {
      id: report_id,
      job_id: job.id,
      customer_id: job.customer.id,
    });

    if (serverResponse.data) {
      clearTimeout(timeout);
      const { error } = await clientApi.put(`/jobs?job_number=${job_number}`, {
        status: "In Progress",
        report_id: report_id,
        sync: "Synced Online",
      });
      if (error) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setStarting(false);
        return;
      }
      setStarting(false);
    } else if (serverResponse.error === "AbortError" || !navigator.onLine) {
      const { error } = await clientApi.put(`/jobs?job_number=${job_number}`, {
        status: "In Progress",
        report_id: report_id,
      });
      if (error) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setStarting(false);
        return;
      }
      setStarting(false);
    } else {
      toast({
        title: serverResponse.error,
        duration: 4000,
        status: "error",
      });
      setStarting(false);
      return;
    }

    await getJob();
  };

  const addRecommendation = async () => {
    if (recommendationRef.current) {
      const recommendation = recommendationRef.current.value.trim();
      if (!recommendation || recommendation === "") {
        return;
      }

      const { data, error } = await clientApi.post(
        `/recommendations?job_number=${job_number}`,
        { recommendation }
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        return;
      }
      toast({
        title: data.message,
        duration: 3000,
        status: "success",
      });
      onClose();
      await getJob();
    }
  };

  const removeRecommendation = async () => {
    const { data, error } = await clientApi.delete(
      `/recommendations?job_number=${job_number}`
    );
    if (error) {
      toast({
        title: error,
        duration: 3000,
        status: "error",
      });
      return;
    }
    toast({
      title: data.message,
      duration: 3000,
      status: "success",
    });
    onClose();
    await getJob();
  };

  const submitReport = async () => {
    setSubmitting(true);
    const nonSyncedItemsResponse = await clientApi.get(
      `/non-synced-items?job_number=${job_number}`
    );
    if (nonSyncedItemsResponse.error) {
      toast({
        title: nonSyncedItemsResponse.error,
        status: "error",
      });
      setSubmitting(false);
      return;
    }

    const data = nonSyncedItemsResponse.data;
    if (data.report_items.length > 0 || data.deleted_report_items.length > 0) {
      setUploading(true);
      let syncResponse = await inspectionApiAxios.post(
        "/report-items?bulk=true",
        data,
        {
          onUploadProgress: (e) => {
            const upload = Math.floor(e.progress * 100);
            setProgress(upload);
          },
        }
      );

      if (syncResponse.status < 200 || syncResponse.status > 299) {
        toast({
          title: syncResponse.data.message,
          status: "error",
          duration: 4000,
        });
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);

      const { error } = await clientApi.put("/non-synced-items", {
        reportItems: syncResponse.data,
      });

      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSubmitting(false);
        return;
      }
    }

    setGenerating(true);
    const finishResponse = await inspectionApi.post("/generate-report", {
      report_id: job.report_id,
      job_id: job.id,
      customer_id: job.customer.id,
      notes: job.notes || null,
      recommendation: job.recommendation || null,
    });

    if (finishResponse.error) {
      toast({
        title: finishResponse.error,
        status: "error",
      });
      setGenerating(false);
      setSubmitting(false);
      return;
    }

    const response = await clientApi.put(`/jobs?job_number=${job_number}`, {
      status: "Completed",
      completed_at: finishResponse.data.completed_at,
    });
    setGenerating(false);
    if (response.error) {
      return;
    }
    setSubmitting(false);
    await getJob();
  };

  const sendAlert = async () => {
    setSubmitting(true);
    const { data, error } = await inspectionApi.post("/send-email", {
      report_id: job.report_id,
    });
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    toast({
      duration: 4000,
      title: data.message,
      status: "success",
    });
  };

  return (
    <PageLayout title="Job Details">
      {loading ? (
        <Loading />
      ) : (
        <>
          {job ? (
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
                <Grid gap={2}>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Name On Report
                    </Text>
                    <Text color={"gray.600"}>
                      {job?.customer?.name_on_report}
                    </Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Customer Name
                    </Text>
                    <Text color={"gray.600"}>{job?.customer?.name}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Customer Email
                    </Text>
                    <Text color={"gray.600"}>{job?.customer?.email}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Site Address
                    </Text>
                    <Text color={"gray.600"}>{job?.site_address}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Date & Time
                    </Text>
                    <Text color={"gray.600"}>{job?.starts_at}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Status
                    </Text>
                    <Text color={"gray.600"}>{job?.status}</Text>
                  </Flex>
                  <Flex
                    alignItems={
                      job?.description.length > 30 ? "start" : "center"
                    }
                    direction={job?.description.length > 30 ? "column" : "row"}
                  >
                    <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                      Description
                    </Text>
                    <Text color={"gray.600"}>{job?.description}</Text>
                  </Flex>
                </Grid>
              </Card>
              <Card mt={2}>
                {job?.status === "Not Started" ? (
                  <Box>
                    <ButtonPrimary
                      onClick={startInspection}
                      isLoading={starting}
                      loadingText="Starting"
                    >
                      Start Inspection
                    </ButtonPrimary>
                  </Box>
                ) : (
                  <>
                    <Box>
                      <Heading as="h3" fontSize={"xl"} color={"gray.700"}>
                        Report Notes
                      </Heading>
                      <Flex alignItems={"center"} gap={2} mt={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total Notes
                        </Text>
                        <Text
                          color={"gray.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.notes?.length || 0}
                        </Text>
                      </Flex>
                      <Flex mt={2} alignItems={"center"} gap={2}>
                        <ButtonPrimary
                          minW={"200px"}
                          onClick={() => navigate("./add-notes")}
                        >
                          Add Notes
                        </ButtonPrimary>
                        <ButtonOutline
                          minW={"200px"}
                          onClick={() => navigate("./all-notes")}
                        >
                          View Notes
                        </ButtonOutline>
                      </Flex>
                    </Box>
                    <Box mt={3}>
                      <Heading as="h3" fontSize={"xl"} color={"gray.700"}>
                        Add items from previous report
                      </Heading>
                      <Flex alignItems={"center"} gap={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total items from previous report
                        </Text>
                        <Text
                          color={"gray.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.previousReportItems}
                        </Text>
                      </Flex>
                      <Flex mt={2} alignItems={"center"} gap={2}>
                        <ButtonPrimary
                          minW={"200px"}
                          onClick={() => navigate("./previous-report")}
                        >
                          Add Items
                        </ButtonPrimary>
                        <ButtonOutline
                          minW={"200px"}
                          onClick={() => navigate("./previous-items")}
                        >
                          View Items
                        </ButtonOutline>
                      </Flex>
                    </Box>
                    <Box mt={3}>
                      <Heading as="h3" fontSize={"xl"} color={"gray.700"}>
                        Add New Report Items
                      </Heading>
                      <Flex alignItems={"center"} gap={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total items from current report
                        </Text>
                        <Text
                          color={"gray.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.newReportItems}
                        </Text>
                      </Flex>
                      <Flex mt={2} alignItems={"center"} gap={2}>
                        <ButtonPrimary
                          minW={"200px"}
                          onClick={() => navigate("./add-items")}
                        >
                          Add Items
                        </ButtonPrimary>
                        <ButtonOutline
                          minW={"200px"}
                          onClick={() => navigate("./all-items")}
                        >
                          View Items
                        </ButtonOutline>
                      </Flex>
                    </Box>
                    <Box mt={2}>
                      <Heading as="h3" fontSize={"xl"} color={"gray.700"}>
                        Recommendation
                      </Heading>

                      {job?.recommendation && job.recommendation !== "" ? (
                        <Box>
                          <Text>{job?.recommendation}</Text>
                          <ButtonOutline onClick={removeRecommendation}>
                            Remove Recommendation
                          </ButtonOutline>
                        </Box>
                      ) : (
                        <Box>
                          <ButtonPrimary onClick={onOpen}>
                            Add Recommendation
                          </ButtonPrimary>
                        </Box>
                      )}
                    </Box>
                    <Box mt={4}>
                      <ButtonPrimary onClick={onOpenAlert} minW="250px">
                        Finish Report
                      </ButtonPrimary>
                    </Box>
                  </>
                )}
              </Card>
            </>
          ) : (
            <DataNotFound>Job not found</DataNotFound>
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
          <ModalHeader>Add Recommendation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DatalistInput
              dataList={recommendations}
              id="recommendations"
              ref={recommendationRef}
            />
          </ModalBody>
          <ModalFooter gap={2} justifyContent={"start"}>
            <ButtonPrimary onClick={addRecommendation}>
              Add Recommendation
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
            <AlertDialogHeader>Finish Report</AlertDialogHeader>
            <AlertDialogBody>
              {job?.status === "Completed" ? (
                <>
                  <Text>The report generated successfully</Text>
                  <Text>You can view the pdf report by visiting this link</Text>
                  <a
                    href={`https://${location.hostname}/api/pdf-report/${job?.report_id}/${job?.type} - Inspection Report - ${job?.customer.name_on_report}.pdf`}
                    target="_blank"
                    style={{
                      textDecoration: "underline",
                      color: "blue",
                      fontSize: "20px",
                      marginTop: "15px",
                      display: "block",
                    }}
                  >
                    Click to view pdf
                  </a>
                  <Flex
                    alignItems={"center"}
                    gap={2}
                    justify={"space-between"}
                    mt={4}
                  >
                    <ButtonPrimary
                      onClick={sendAlert}
                      isLoading={submitting}
                      loadingText="Sending"
                    >
                      Send Email Alert
                    </ButtonPrimary>

                    <ButtonOutline
                      ref={cancelRef}
                      isDisabled={submitting}
                      onClick={onCloseAlert}
                    >
                      Close
                    </ButtonOutline>
                  </Flex>
                </>
              ) : (
                <>
                  {generating ? (
                    <Box>
                      <Text>
                        Please wait while report is being generated. This can
                        take a few minutes depending on total items in report
                      </Text>
                      <Loading />
                    </Box>
                  ) : uploading ? (
                    <Box>
                      <Text>Uploading all items for current report</Text>
                      <Progress value={progress} rounded={"full"} />
                    </Box>
                  ) : (
                    <Box>
                      Are you sure? Please review the report once before
                      submitting.
                    </Box>
                  )}
                </>
              )}
            </AlertDialogBody>

            {!uploading && !generating && job?.status !== "Completed" && (
              <AlertDialogFooter gap={3} justifyContent={"start"}>
                <ButtonPrimary
                  isLoading={submitting}
                  loadingText="Submitting"
                  onClick={submitReport}
                >
                  Submit Report
                </ButtonPrimary>
                <ButtonOutline
                  ref={cancelRef}
                  isDisabled={submitting}
                  onClick={onCloseAlert}
                >
                  Cancel and Review
                </ButtonOutline>
              </AlertDialogFooter>
            )}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default Job;

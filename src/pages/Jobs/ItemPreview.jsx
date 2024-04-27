import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
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
  Image,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

const ItemPreview = () => {
  const { job_number, id } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [reportItem, setreportItem] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const cancelRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?job_number=${job_number}`);
      if (response.error) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get(`/jobs/report-items?id=${id}`);
      if (response.error) {
        setLoading(false);
        return;
      }
      setreportItem(response.data);
      setLoading(false);
    })();
  }, []);

  const handleDeleteBtn = () => {
    onOpenAlert();
  };

  const deleteItem = async () => {
    setSaving(true);
    const { data, error } = await clientApi.delete(
      `/jobs/report-items?id=${id}`
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
    navigate(-1);
  };

  return (
    <PageLayout title="Item Preview">
      {loading ? (
        <Loading />
      ) : (
        <>
          {reportItem ? (
            <Card>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight={"semibold"}
                color={"gray.700"}
              >
                &#35;{job?.job_number} - {job?.category}
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
              {reportItem.images && reportItem.images.length !== 0 && (
                <>
                  <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                    New Images
                  </Text>
                  <Grid
                    gridTemplateColumns={"1fr 1fr 1fr"}
                    gap={3}
                    maxW={"700px"}
                  >
                    {reportItem.images.map((img, index) => (
                      <Image src={img} key={index} maxHeight={"300px"} />
                    ))}
                  </Grid>
                </>
              )}
              {reportItem.previous_item_images && (
                <>
                  <Text fontSize={"lg"} color={"gray.700"} minW={"200px"} mt={2}>
                    Previous Images
                  </Text>
                  <Grid
                    gridTemplateColumns={"1fr 1fr 1fr"}
                    gap={2}
                    maxW={"700px"}
                  >
                    {reportItem.previous_item_images.map((img, index) => (
                      <Image src={img} maxH={"300px"} key={index} />
                    ))}
                  </Grid>
                </>
              )}
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Note
                </Text>
                <Text color={"gray.600"}>{reportItem?.note || "N/A"}</Text>
              </Flex>
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Summary
                </Text>
                <Text color={"gray.600"}>{reportItem?.summary || "N/A"}</Text>
              </Flex>
              {reportItem.embedded_images && (
                <>
                  <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                    Embedded Images
                  </Text>
                  <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2}>
                    {reportItem.embedded_images.map((img, index) => (
                      <Image
                        src={img}
                        maxW={"300px"}
                        maxH={"300px"}
                        key={index}
                      />
                    ))}
                  </Grid>
                </>
              )}
              <Box mt={3}>
                <Button
                  colorScheme="red"
                  borderRadius={"full"}
                  onClick={handleDeleteBtn}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          ) : (
            <DataNotFound>Item not found</DataNotFound>
          )}
        </>
      )}

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
                isLoading={saving}
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

export default ItemPreview;

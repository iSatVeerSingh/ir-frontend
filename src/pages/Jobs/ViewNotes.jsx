import {
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import PageLayout from "../../layouts/PageLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import clientApi from "../../api/clientApi";
import { DeleteIcon } from "../../icons";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";

const ViewNotes = () => {
  const { job_number } = useParams();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const getJob = async () => {
    setLoading(true);
    const response = await clientApi.get(`/jobs?job_number=${job_number}`);
    if (response.error) {
      return;
    }
    setJob(response.data);
    setLoading(false);
  };

  useEffect(() => {
    getJob();
  }, []);

  const deleteNote = async (note) => {
    const response = await clientApi.put(
      `/jobs/notes?job_number=${job_number}`,
      {
        note,
      }
    );
    if (response.error) {
      toast({
        title: response.error,
        status: "error",
      });
      return;
    }
    toast({
      title: response.data.message,
      status: "success",
    });
    await getJob();
  };

  return (
    <PageLayout title="All Notes">
      {loading ? (
        <Loading />
      ) : (
        <>
          <Card>
            <Heading
              as="h2"
              fontSize={"2xl"}
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
            <Flex alignItems={"center"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Site Address
              </Text>
              <Text color={"gray.600"}>{job?.site_address}</Text>
            </Flex>
          </Card>
          {job?.notes && job.notes.length !== 0 ? (
            <Grid gap={2} mt={3}>
              {job.notes.map((note, index) => (
                <Flex
                  key={index}
                  p={2}
                  borderRadius={"xl"}
                  shadow={"xs"}
                  bg={"main-bg"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Text color={"gray.700"}>{note}</Text>
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete Note"
                    onClick={() => deleteNote(note)}
                  />
                </Flex>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couldn't find any notes</DataNotFound>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default ViewNotes;

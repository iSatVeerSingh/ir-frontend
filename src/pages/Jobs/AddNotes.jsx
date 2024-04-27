import { useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import clientApi from "../../api/clientApi";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { Box, Flex, Heading, Text, useToast } from "@chakra-ui/react";
import DatalistInput from "../../components/DatalistInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import FormTextarea from "../../components/FormTextarea";

const AddNotes = () => {
  const { job_number } = useParams();
  const [allNotes, setAllNotes] = useState([]);
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const commonNoteRef = useRef(null);
  const customNoteRef = useRef(null);

  useEffect(() => {
    (async () => {
      let response = await clientApi.get("/notes");
      if (response.error) {
        return;
      }
      const notesOnly = response.data.map((note) => note.text);
      setAllNotes(notesOnly);

      response = await clientApi.get(`/jobs?job_number=${job_number}`);
      if (response.error) {
        setLoading(false);
        return;
      }
      setJob(response.data);
      setLoading(false);
    })();
  }, []);

  const addInspectionNote = async (note) => {
    const response = await clientApi.post(
      `/jobs/notes?job_number=${job_number}`,
      {
        note,
      }
    );
    if (response.error) {
      toast({
        title: response.error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    toast({
      title: response.data.message,
      duration: 3000,
      status: "success",
    });
    commonNoteRef.current.value = "";
    customNoteRef.current.value = "";
  };

  const handleAddCommonNote = async () => {
    const note = commonNoteRef.current?.value.trim();
    if (note && note === "") {
      return;
    }
    await addInspectionNote(note);
    commonNoteRef.current?.focus();
  };

  const handleAddCustomNote = async () => {
    const note = customNoteRef.current?.value.trim();
    if (note && note === "") {
      return;
    }
    await addInspectionNote(note);
    customNoteRef.current?.focus();
  };

  return (
    <PageLayout title="Add Notes">
      {loading ? (
        <Loading />
      ) : (
        <Card>
          {job ? (
            <>
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
              <Flex alignItems={"center"} mt={2}>
                <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                  Site Address
                </Text>
                <Text color={"gray.600"}>{job?.site_address}</Text>
              </Flex>
              <Box mt={4}>
                <DatalistInput
                  label="Choose from a list of common notes"
                  dataList={allNotes}
                  ref={commonNoteRef}
                  placeholder="Type here to search notes"
                />
                <ButtonPrimary mt={2} w={"250px"} onClick={handleAddCommonNote}>
                  Add Note
                </ButtonPrimary>
              </Box>
              <Box mt={4} fontSize={"2xl"} textAlign={"center"}>
                OR
              </Box>
              <Box mt={4}>
                <Text color={"gray.700"}>
                  If you have not found any relevant note in common list you can
                  custom note.
                </Text>
                <FormTextarea
                  ref={customNoteRef}
                  placeholder="Type note here"
                />
                <ButtonPrimary mt={2} w={"250px"} onClick={handleAddCustomNote}>
                  Add Custom Note
                </ButtonPrimary>
              </Box>
            </>
          ) : (
            <DataNotFound />
          )}
        </Card>
      )}
    </PageLayout>
  );
};

export default AddNotes;

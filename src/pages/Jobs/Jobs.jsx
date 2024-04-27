import { useEffect, useState } from "react";
import clientApi from "../../api/clientApi";
import PageLayout from "../../layouts/PageLayout";
import Loading from "../../components/Loading";
import { Box, Flex, Grid, Text, useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { LocationIcon, UserIcon } from "../../icons";
import DataNotFound from "../../components/DataNotFound";

const Jobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  const getJobs = async () => {
    setLoading(true);
    const { error, data } = await clientApi.get("/jobs");
    if (error) {
      setLoading(false);
      return;
    }
    setJobs(data);
    setLoading(false);
  };

  const syncOnline = async () => {
    setSyncing(true);
    const { data, error } = await clientApi.get("/sync-jobs");
    if (error) {
      toast({ title: error, status: "error", duration: 3000 });
      setSyncing(false);
      return;
    }

    toast({ title: data?.message, status: "success", duration: 3000 });
    setSyncing(false);
    await getJobs();
  };

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <PageLayout
      title="Jobs"
      isRoot
      btn="Sync Jobs"
      onClick={syncOnline}
      loadingText="Syncing"
      isLoading={syncing}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          {jobs.length !== 0 ? (
            <Grid gap={2}>
              {jobs.map((job) => (
                <Link key={job?.id} to={"./" + job?.job_number}>
                  <Box
                    key={job?.id}
                    alignItems={"center"}
                    bg={"main-bg"}
                    p="2"
                    borderRadius={"lg"}
                    shadow={"xs"}
                    justifyContent={"space-between"}
                    gap={2}
                  >
                    <Flex
                      alignItems={"center"}
                      justify={"space-between"}
                      flexGrow={1}
                    >
                      <Text fontSize={"lg"}>
                        &#35;{job?.job_number} - {job?.category}
                      </Text>
                      <Text color={"gray.500"}>{job?.starts_at}</Text>
                    </Flex>
                    <Flex alignItems={"start"}>
                      <Box flexGrow={1}>
                        <Text color={"gray.600"}>
                          <UserIcon boxSize={5} />{" "}
                          {job?.customer?.name_on_report}
                        </Text>
                        <Text color={"gray.600"}>
                          <LocationIcon boxSize={5} /> {job?.site_address}
                        </Text>
                      </Box>
                      <Text
                        px={3}
                        bg={"gray.200"}
                        color={
                          job?.status === "In Progress"
                            ? "orange.500"
                            : job?.status === "Completed"
                            ? "green.500"
                            : "gray.600"
                        }
                        borderRadius={"lg"}
                      >
                        {job?.status}
                      </Text>
                    </Flex>
                  </Box>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Coundn't find any jobs</DataNotFound>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Jobs;

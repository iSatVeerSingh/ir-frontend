import {
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Text,
  Progress,
} from "@chakra-ui/react";
import Card from "../components/Card";
import { useState } from "react";
import ButtonPrimary from "../components/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import clientApi from "../api/clientApi";
import useAxios from "../utils/useAxios";

export const initLoader = () => {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      return redirect("/login");
    }

    return null;
  } catch (err) {
    console.log(err);
    return redirect("/login");
  }
};

const Init = () => {
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { progress, fetchData } = useAxios();

  const installApp = async () => {
    setInstalling(true);

    try {
      const storage = navigator.storage;
      if (storage) {
        await storage.persist();
      }

      const user = localStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }
      const userresponse = await clientApi.post("/init-user", JSON.parse(user));
      if (userresponse.error) {
        navigate("/login");
        return;
      }

      setStatus("Fetching notes");
      // Fetch notes from server and save offline to use it while adding report items;
      let response = await fetchData("/install-notes");

      if (response.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      let initResponse = await clientApi.post("/init-notes", response.data);
      if (initResponse.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      // Fetch library items and save to offline database
      setStatus("Fetching items");
      response = await fetchData(`/install-items`);
      if (response.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      initResponse = await clientApi.post("/init-items", response.data);
      if (initResponse.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }
      // Fetch item categories and save to offline database
      setStatus("Fetching item categories");
      // Fetch notes from server and save offline to use it while adding report items;
      response = await fetchData("/install-categories");

      if (response.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      initResponse = await clientApi.post("/init-categories", response.data);
      if (initResponse.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }
      // Fetch recommendations and save to offline database
      setStatus("Fetching recommendations");
      // Fetch notes from server and save offline to use it while adding report items;
      response = await fetchData("/install-recommendations");

      if (response.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      initResponse = await clientApi.post(
        "/init-recommendations",
        response.data
      );
      if (initResponse.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      // Fetch recommendations and save to offline database
      setStatus("Fetching initial jobs");
      // Fetch notes from server and save offline to use it while adding report items;
      response = await fetchData("/jobs");

      if (response.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      initResponse = await clientApi.post("/init-jobs", response.data);
      if (initResponse.error) {
        setError(response.error || "Something went wrong");
        setInstalling(false);
        return;
      }

      setInstalling(false);
      setInstalled(true);
    } catch (err) {
      setInstalling(false);
      console.log(err);
      return;
    }
  };

  return (
    <Center as="main" h={"100vh"} bg={"app-bg"} p={3}>
      <Card w={"100%"} maxW={"600px"} px={5} py={5} textAlign={"center"}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius={"lg"}
          mb={3}
        >
          <AlertIcon boxSize="40px" />
          <AlertTitle mt={4} mb={1} fontSize="2xl" color={"gray.800"}>
            Important
          </AlertTitle>
          <AlertDescription color={"gray.700"}>
            This is a Progressive web app, which means this app works as an
            offline website. So if you delete or clear browsing data/history,
            the data of this app will be deleted. So be carefull before clearing
            browsing data.
          </AlertDescription>
        </Alert>
        {!installing && !installed && !error && (
          <ButtonPrimary onClick={installApp}>Setup App</ButtonPrimary>
        )}
        {installing && !installed && !error && (
          <Box textAlign={"center"}>
            <Text fontSize={"lg"} color={"gray.700"}>
              {status}
            </Text>
            <Progress value={progress} mt={2} rounded={"full"} />
          </Box>
        )}

        {!installing && installed && !error && (
          <Box>
            <Text>App successfully setup</Text>
            <ButtonPrimary onClick={() => navigate("/jobs")}>
              Go To App
            </ButtonPrimary>
          </Box>
        )}

        {!installing && !installed && error && (
          <Box>
            <Text color={"red"}>Error: {error}. Please try again</Text>
          </Box>
        )}
      </Card>
    </Center>
  );
};

export default Init;

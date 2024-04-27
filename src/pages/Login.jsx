import { Box, Center, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import Card from "../components/Card";
import FormInput from "../components/FormInput";
import ButtonPrimary from "../components/ButtonPrimary";
import { FormEventHandler, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState(null);
  const [logging, setLogging] = useState(false);
  const [installing, setInstalling] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target?.email?.value?.trim();
    const password = e.target?.password?.value?.trim();

    if (!email || email === "") {
      setFormErrors({ email: "Please provide a valid email" });
      return;
    }
    if (!password || password === "") {
      setFormErrors({ password: "Password is required" });
      return;
    }
    setFormErrors(null);
    setLogging(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: data.message || "Invalid request",
          duration: 4000,
          status: "error",
        });
        setLogging(false);

        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      setLogging(false);
    } catch (err) {
      toast({
        title: err.message || "Invalid request",
        duration: 4000,
        status: "error",
      });
      setLogging(false);

      return;
    }

    if ("serviceWorker" in navigator) {
      setInstalling(true);
      let serviceWorker;
      const registration = await navigator.serviceWorker.register(
        import.meta.env.MODE === "production" ? "/sw.js" : "/dev-sw.js?dev-sw",
        { type: import.meta.env.MODE === "production" ? "classic" : "module" }
      );
      if (registration.installing) {
        serviceWorker = registration.installing;
      } else if (registration.waiting) {
        serviceWorker = registration.waiting;
      } else if (registration.active) {
        serviceWorker = registration.active;
      }
      if (serviceWorker) {
        serviceWorker.addEventListener("statechange", (e) => {
          if (e.currentTarget.state === "activated") {
            console.log("Service worker activated");
            setInstalling(false);
            navigate("/init");
          }
        });
      }
    }
  };

  return (
    <Center as="main" h={"100vh"} bg={"app-bg"} p={3}>
      <Card w={"100%"} maxW={"600px"} px={5} py={5}>
        <Box textAlign={"center"} mb={3}>
          <Text fontSize={"lg"} color={"gray.600"}>
            Inspection Report App by Correct Inspections
          </Text>
          <Heading as="h2">Welcome</Heading>
        </Box>
        <form onSubmit={handleSubmit}>
          <VStack>
            <FormInput
              id="email"
              type="email"
              name="email"
              placeholder="example@gmail.com"
              label="Email"
              inputError={formErrors?.email}
            />
            <FormInput
              id="password"
              type="password"
              name="password"
              placeholder="John@!23"
              label="Password"
              inputError={formErrors?.password}
            />
            <ButtonPrimary
              type="submit"
              w={"full"}
              mt={3}
              loadingText="Logging in"
              isLoading={logging}
              isDisabled={installing}
            >
              Login
            </ButtonPrimary>
          </VStack>
        </form>
        {installing && (
          <Text color={"orange.500"} textAlign={"center"}>
            Please wait. Service worker is installing.
          </Text>
        )}
      </Card>
    </Center>
  );
};

export default Login;

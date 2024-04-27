import { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import inspectionApi from "../api/inspectionApi";
import Loading from "../components/Loading";
import Card from "../components/Card";
import {
  Flex,
  Grid,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import ButtonPrimary from "../components/ButtonPrimary";
import ButtonOutline from "../components/ButtonOutline";
import FormInput from "../components/FormInput";
import FileInput from "../components/FileInput";
import { useGlobalContext } from "../context/GlobalContext";
import { embeddedResized } from "../utils/getResizedImages";

const Settings = () => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const getCompany = async () => {
    const { data, error } = await inspectionApi.get("/companies");
    if (error) {
      setLoading(false);
      return;
    }
    setCompany(data);
    setLoading(false);
  };
  useEffect(() => {
    getCompany();
  }, []);

  const handleTitleBtn = () => {
    onOpen();
  };

  const handleForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const name = formData.get("name").trim();
    const logo = formData.get("logo");
    const email = formData.get("email").trim();
    const phone = formData.get("phone").trim();
    const website = formData.get("website").trim();
    const address_line1 = formData.get("address_line1").trim();
    const address_line2 = formData.get("address_line2").trim();
    const city = formData.get("city").trim();
    const country = formData.get("country").trim();
    const manager_email = formData.get("manager_email").trim();
    const reports_email = formData.get("reports_email").trim();
    const sender_email = formData.get("sender_email").trim();

    const companyData = {};

    if (name !== "" && name !== company.name) {
      companyData.name = name;
    }
    if (logo && logo.size !== 0) {
      companyData.logo = (await embeddedResized([logo]))[0];
    }
    if (email !== "" && email !== company.email) {
      companyData.email = email;
    }
    if (phone !== "" && phone !== company.phone) {
      companyData.phone = phone;
    }
    if (website !== "" && website !== company.website) {
      companyData.website = website;
    }
    if (address_line1 !== "" && address_line1 !== company.address_line1) {
      companyData.address_line1 = address_line1;
    }
    if (address_line2 !== "" && address_line2 !== company.address_line2) {
      companyData.address_line2 = address_line2;
    }
    if (city !== "" && city !== company.city) {
      companyData.city = city;
    }
    if (country !== "" && country !== company.country) {
      companyData.country = country;
    }
    if (manager_email !== "" && manager_email !== company.manager_email) {
      companyData.manager_email = manager_email;
    }
    if (
      reports_email !== "" &&
      reports_email !== company.reports_email
    ) {
      companyData.reports_email = reports_email;
    }
    if (sender_email !== "" && sender_email !== company.sender_email) {
      companyData.sender_email = sender_email;
    }

    setSaving(true);

    const { data, error } = await inspectionApi.put("/companies", companyData);
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
      status: "success",
      duration: 3000,
    });
    setSaving(false);
    onClose();
    await getCompany();
  };

  return (
    <PageLayout
      title={"Settings"}
      isRoot
      btn={user.role === "Owner" ? "Edit" : undefined}
      onClick={user.role === "Owner" ? handleTitleBtn : undefined}
    >
      {loading ? (
        <Loading />
      ) : (
        <Card>
          <Grid gap={2}>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Company Name
              </Text>
              <Text color={"gray.600"}>{company?.name}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Logo
              </Text>
              <Image src={company?.logo} width="100px" />
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Email
              </Text>
              <Text color={"gray.600"}>{company?.email}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Phone
              </Text>
              <Text color={"gray.600"}>{company?.phone}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Website
              </Text>
              <Text color={"gray.600"}>{company?.website}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Address Line 1
              </Text>
              <Text color={"gray.600"}>{company?.address_line1}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Address Line 2
              </Text>
              <Text color={"gray.600"}>{company?.address_line2}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                City
              </Text>
              <Text color={"gray.600"}>{company?.city}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Country
              </Text>
              <Text color={"gray.600"}>{company?.country}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Manager Email
              </Text>
              <Text color={"gray.600"}>{company?.manager_email || "N/A"}</Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Reports Email
              </Text>
              <Text color={"gray.600"}>
                {company?.reports_email || "N/A"}
              </Text>
            </Flex>
            <Flex alignItems={"center"}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Sender Email
              </Text>
              <Text color={"gray.600"}>{company?.sender_email || "N/A"}</Text>
            </Flex>
          </Grid>
        </Card>
      )}

      {user.role === "Owner" && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          closeOnOverlayClick={false}
          size={"xl"}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Company Data</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form id="company_form" onSubmit={handleForm}>
                <FormInput
                  id="name"
                  name="name"
                  placeholder="company name here"
                  label="Name"
                  defaultValue={company?.name}
                />
                <FileInput id="logo" name="logo" label="Logo" />
                <FormInput
                  id="email"
                  name="email"
                  placeholder="enter email here"
                  label="Email"
                  defaultValue={company?.email}
                />
                <FormInput
                  id="phone"
                  name="phone"
                  placeholder="enter phone here"
                  label="Phone"
                  defaultValue={company?.phone}
                />
                <FormInput
                  id="website"
                  name="website"
                  placeholder="enter website here"
                  label="Website"
                  defaultValue={company?.website}
                />
                <FormInput
                  id="address_line1"
                  name="address_line1"
                  placeholder="Address line 1"
                  label="Address Line 1"
                  defaultValue={company?.address_line1}
                />
                <FormInput
                  id="address_line2"
                  name="address_line2"
                  placeholder="Address line 2"
                  label="Address Line 2"
                  defaultValue={company?.address_line2}
                />
                <FormInput
                  id="city"
                  name="city"
                  placeholder="enter city here"
                  label="City"
                  defaultValue={company?.city}
                />
                <FormInput
                  id="country"
                  name="country"
                  placeholder="enter country here"
                  label="Country"
                  defaultValue={company?.country}
                />
                <FormInput
                  id="manager_email"
                  name="manager_email"
                  placeholder="manager email here"
                  label="Manager Email"
                  defaultValue={company?.manager_email}
                />
                <FormInput
                  id="reports_email"
                  name="reports_email"
                  placeholder="reports_email"
                  label="Reports Email"
                  defaultValue={company?.reports_email}
                />
                <FormInput
                  id="sender_email"
                  name="sender_email"
                  placeholder="sender_email"
                  label="Sender Email"
                  defaultValue={company?.sender_email}
                />
              </form>
            </ModalBody>

            <ModalFooter gap={2} justifyContent={"start"}>
              <ButtonPrimary
                type="submit"
                form="company_form"
                isLoading={saving}
                loadingText="Saving"
              >
                Submit
              </ButtonPrimary>
              <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </PageLayout>
  );
};

export default Settings;

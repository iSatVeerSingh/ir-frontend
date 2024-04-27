import { useEffect, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import clientApi from "../../api/clientApi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";

const ViewItems = () => {
  const { job_number } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?job_number=${job_number}`);
      if (response.error) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get("/categories");
      if (response.error) {
        setLoading(false);
        return;
      }
      const allCategories = response.data.map((item) => item.name);
      setCategories(allCategories);
      setLoading(false);
    })();
  }, []);

  const updateSearch = (key, value, includePage) => {
    if (value && value !== "") {
      setSearchParams((prev) => {
        const updatedParams = {
          ...Object.fromEntries(prev),
          [key]: value,
        };

        if (!includePage) {
          delete updatedParams.page;
        }

        return updatedParams;
      });
    }
  };

  const getreportItems = async (url) => {
    setLoading(true);
    const { error, data } = await clientApi.get(url);
    if (error) {
      setLoading(false);
      return;
    }
    setItems(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    const baseurl = `/jobs/report-items?job_number=${job_number}`;
    const searchUrl =
      searchParams.size === 0
        ? baseurl
        : baseurl + "&" + searchParams.toString();
    getreportItems(searchUrl);
  }, [searchParams]);

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("name", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

  return (
    <PageLayout title="View Items" backPage={"/jobs/" + job_number}>
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
            <Flex alignItems={"center"} mt={2}>
              <Text fontSize={"lg"} color={"gray.700"} minW={"200px"}>
                Site Address
              </Text>
              <Text color={"gray.600"}>{job?.site_address}</Text>
            </Flex>
          </Card>
          <Flex gap={3} mb={3} alignItems={"center"} mt={2}>
            <Text>Filter</Text>
            <FilterSelect
              value={searchParams.get("category") || ""}
              onChange={(e) => updateSearch("category", e.target.value)}
              placeholder="Select a category"
              options={categories}
              maxW={"300px"}
            />
            <FilterInput
              placeholder="Search by name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <InputBtn value="Search" onClick={searchByName} />
            <InputBtn value="Clear" onClick={clearSearch} />
          </Flex>
          {items.length !== 0 ? (
            <Grid gap={2} mt={2}>
              {items.map((item) => (
                <Link to={"./" + item?.id} key={item?.id}>
                  <Card>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"lg"} color={"gray.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"gray.500"}>
                        Images: {item?.images?.length}
                      </Text>
                    </Flex>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Text
                        color={"blue.500"}
                        borderRadius={"md"}
                        maxW={"max-content"}
                      >
                        {item?.category}
                      </Text>
                      {item?.sync === "Synced Online" && (
                        <Text fontSize={"small"} color={"gray.400"}>
                          {item?.sync}
                        </Text>
                      )}
                    </Flex>
                    <Text color={"gray.600"} mt={1}>
                      Note:{" "}
                      {item?.note && item?.note !== "" ? item.note : "N/A"}
                    </Text>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couldn't find any items</DataNotFound>
          )}
        </>
      )}
      {pages && items.length !== 0 && (
        <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
          <Button
            borderRadius={"full"}
            isDisabled={pages.prev === null}
            onClick={() => updateSearch("page", pages.prev.toString(), true)}
          >
            Prev
          </Button>
          <Text>Current Page: {pages.current_page}</Text>
          <Text>Total Pages: {pages.total_pages}</Text>
          <Button
            borderRadius={"full"}
            isDisabled={pages.next === null}
            onClick={() => updateSearch("page", pages.next.toString(), true)}
          >
            Next
          </Button>
        </Flex>
      )}
    </PageLayout>
  );
};

export default ViewItems;

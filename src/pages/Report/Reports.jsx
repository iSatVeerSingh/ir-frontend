import { Button, Flex, Grid, Heading, Text, useToast } from "@chakra-ui/react";
import inspectionApi from "../../api/inspectionApi";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Card from "../../components/Card";
import { LocationIcon, UserIcon } from "../../icons";
import { Link, useSearchParams } from "react-router-dom";
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [pages, setPages] = useState(null);
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );

  const getReports = async (url = "/reports") => {
    setLoading(true);
    const { error, data } = await inspectionApi.get(url);
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setLoading(false);
      return;
    }
    setReports(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await inspectionApi.get(
        "/job-categories?nameonly=true"
      );
      if (error) {
        return;
      }
      const allCategories = data.map((item) => ({
        text: item.name,
        value: item.id,
      }));
      setCategories(allCategories);
    })();
  }, []);

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0
        ? "/reports"
        : "/reports?" + searchParams.toString();
    getReports(searchUrl);
  }, [searchParams]);

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("keyword", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

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

  return (
    <PageLayout title="Reports" isRoot>
      <Flex gap={3} mb={3} alignItems={"center"}>
        <FilterSelect
          value={searchParams.get("category_id") || ""}
          onChange={(e) => updateSearch("category_id", e.target.value)}
          placeholder="Select a category"
          options={categories}
          maxW={"300px"}
        />
        <FilterInput
          type="date"
          value={searchParams.get("completed_at") || ""}
          onChange={(e) => updateSearch("completed_at", e.target.value)}
          placeholder="Search by date"
        />
        <FilterInput
          placeholder="Search by customer name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <InputBtn value="Search" onClick={searchByName} />
        <InputBtn value="Clear" onClick={clearSearch} />
      </Flex>
      {loading ? (
        <Loading />
      ) : (
        <>
          {reports.length !== 0 ? (
            <Grid gap={2}>
              {reports.map((report) => (
                <Link key={report?.id} to={"./" + report?.id}>
                  <Card key={report?.id}>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"xl"}>
                        &#35;{report?.job_number} - {report?.category}
                      </Text>
                      <Text
                        color={report?.completed_at ? "gray.500" : "orange.500"}
                      >
                        {report?.completed_at || "In Progress"}
                      </Text>
                    </Flex>
                    <Text color={"gray.600"}>
                      <UserIcon boxSize={5} />
                      {report?.customer_name}
                    </Text>
                    <Text color={"gray.600"}>
                      <LocationIcon boxSize={5} /> {report?.site_address}
                    </Text>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text color={"gray.600"}>
                        Inspector :- {report?.inspector}
                      </Text>
                      {report.is_revised && (
                        <Text color={"green"}>Revised</Text>
                      )}
                    </Flex>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Coundn't find any reports</DataNotFound>
          )}
        </>
      )}
      {pages && reports.length !== 0 && (
        <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
          <Button
            borderRadius={"full"}
            isDisabled={pages.prev === null}
            variant={"outline"}
            onClick={() => updateSearch("page", pages.prev.toString(), true)}
          >
            Prev
          </Button>
          <Text>Current Page: {pages.current_page}</Text>
          <Button
            borderRadius={"full"}
            variant={"outline"}
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

export default Reports;

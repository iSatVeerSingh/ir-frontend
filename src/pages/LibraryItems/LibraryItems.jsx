import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { Box, Button, Flex, Grid, Text, useToast } from "@chakra-ui/react";
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";

const LibraryItems = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const [pages, setPages] = useState(null);
  const toast = useToast();

  const getAllItems = async (url) => {
    setLoading(true);
    const { data, error } = await inspectionApi.get(url);
    if (error) {
      setLoading(false);
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    setItems(data.data);
    setPages(data.pages);
    setLoading(false);
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

  useEffect(() => {
    (async () => {
      const { data, error } = await inspectionApi.get(
        "/item-categories?nameonly=true"
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
      searchParams.size === 0 ? "/items" : "/items?" + searchParams.toString();
    getAllItems(searchUrl);
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

  return (
    <PageLayout
      title="Library Items"
      btn={"Create Item"}
      onClick={() => navigate("./new", { state: { categories } })}
      isRoot
    >
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterSelect
          value={searchParams.get("category_id") || ""}
          onChange={(e) => updateSearch("category_id", e.target.value)}
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
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {items.length !== 0 ? (
            <Grid gap={2}>
              {items.map((item) => (
                <Link to={"./" + item.id} key={item.id} state={{ categories }}>
                  <Card>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Text fontSize={"lg"} fontWeight={"medium"}>
                        {item.name}
                      </Text>
                      <Text color={"gray.500"}>
                        Last Updated: {item.updated_at}
                      </Text>
                    </Flex>
                    <Text
                      color={"blue.600"}
                      maxW={"max-content"}
                      borderRadius={"md"}
                    >
                      {item.category}
                    </Text>
                    <Text color={"gray.600"}>
                      <Text as="span" color={"text.700"} fontWeight={"bold"}>
                        Summary:
                      </Text>
                      {item.summary === "" ? "N/A" : item.summary}
                    </Text>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Coundn't find any items</DataNotFound>
          )}
        </Box>
      )}
      {pages && items.length !== 0 && (
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

export default LibraryItems;

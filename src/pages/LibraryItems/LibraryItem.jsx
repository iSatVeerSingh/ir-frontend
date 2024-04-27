import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import inspectionApi from "../../api/inspectionApi";
import ItemForm from "./ItemForm";
import PageLayout from "../../layouts/PageLayout";
import Loading from "../../components/Loading";
import { Text } from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";

const LibraryItem = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { categories } = state;
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await inspectionApi.get(`/items/${id}`);
      if (error) {
        setLoading(false);
        return;
      }
      setItem(data.data);
      setLoading(false);
    })();
  }, []);

  return (
    <PageLayout title="View & Edit Item">
      {loading ? (
        <Loading />
      ) : (
        <>
          {item ? (
            <ItemForm categories={categories} isEditing editItem={item} />
          ) : (
            <DataNotFound>Item not found</DataNotFound>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default LibraryItem;

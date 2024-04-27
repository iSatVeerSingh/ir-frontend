import { useLocation } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import ItemForm from "./ItemForm";

const NewLibraryItem = () => {
  const { state } = useLocation();
  const { categories } = state;

  return (
    <PageLayout title="New Library Item">
      <ItemForm categories={categories} />
    </PageLayout>
  )
};

export default NewLibraryItem;

import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import PageLayout from "../../layouts/PageLayout";
import Loading from "../../components/Loading";
import {
  Flex,
  Grid,
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
import Card from "../../components/Card";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";
import FormTextarea from "../../components/FormTextarea";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";
import inspectionApi from "../../api/inspectionApi";

const InspectorLibraryNotes = () => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const filterRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [saving, setSaving] = useState(false);
  const noteInputRef = useRef(null);
  const toast = useToast();

  const getNotes = async () => {
    const { error, data } = await clientApi.get("/notes");
    if (error) {
      setLoading(false);
      return;
    }
    setNotes(data);
    setFilteredNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    getNotes();
  }, []);

  const filterNotes = (e) => {
    const searchValue = e.target?.value?.trim();
    if (searchValue === "") {
      return;
    }

    const filter = notes.filter((note) =>
      note.text.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredNotes(filter);
  };

  const clearFilter = () => {
    setFilteredNotes(notes);
    filterRef.current.value = "";
  };

  const handleTitleBtn = () => {
    onOpen();
  };

  const sendSuggestion = async () => {
    const noteValue = noteInputRef.current?.value?.trim();
    if (noteValue === "") {
      return;
    }

    setSaving(true);

    const { error, data } = await inspectionApi.post("/suggest-note", {
      text: noteValue,
    });
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setSaving(false);
      return;
    }

    toast({ title: data?.message, duration: 3000, status: "success" });
    setSaving(false);
    onClose();
  };

  return (
    <PageLayout
      title="Notes Library"
      isRoot
      btn="Suggest Note"
      onClick={handleTitleBtn}
    >
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterInput onChange={filterNotes} ref={filterRef} />
        <InputBtn value="Clear" onClick={clearFilter} />
      </Flex>
      {loading ? (
        <Loading />
      ) : (
        <>
          {filteredNotes.length !== 0 ? (
            <Grid gap={2}>
              {filteredNotes.map((note) => (
                <Card key={note?.id}>{note?.text}</Card>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couldn't find any notes</DataNotFound>
          )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Suggest Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormTextarea
              id="text"
              name="text"
              placeholder="Note text"
              label="Note Text"
              px={1}
              ref={noteInputRef}
            />
          </ModalBody>
          <ModalFooter gap={3} justifyContent={"start"}>
            <ButtonPrimary
              isLoading={saving}
              loadingText="Submitting"
              onClick={sendSuggestion}
            >
              Send suggestion
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default InspectorLibraryNotes;

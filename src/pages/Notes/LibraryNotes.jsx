import { useEffect, useRef, useState } from "react";
import PageLayout from "../../layouts/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import Loading from "../../components/Loading";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
import { MoreIcon } from "../../icons";
import { useSearchParams } from "react-router-dom";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import FormTextarea from "../../components/FormTextarea";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";
import DataNotFound from "../../components/DataNotFound";

const LibraryNotes = () => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [pages, setPages] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const deleteNoteRef = useRef(null);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [formErrors, setFormErrors] = useState(null);

  const getNotes = async (url = "/notes") => {
    setLoading(true);
    const { data, error } = await inspectionApi.get(url);
    if (error) {
      setLoading(false);
      return;
    }
    setNotes(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0 ? "/notes" : "/notes?" + searchParams.toString();
    getNotes(searchUrl);
  }, [searchParams]);

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

  const handleTitleBtn = () => {
    setIsEditing(false);
    setEditNote(null);
    onOpen();
  };

  const handleEditNoteBtn = (note) => {
    setIsEditing(true);
    setEditNote(note);
    onOpen();
  };

  const handleDeleteNoteBtn = (id) => {
    deleteNoteRef.current = id;
    onOpenAlert();
  };

  const deleteNote = async () => {
    if (deleteNoteRef.current) {
      setSaving(true);
      const { data, error } = await inspectionApi.delete(
        `/notes/${deleteNoteRef.current}`
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return;
      }
      toast({
        title: data?.message,
        status: "success",
      });
      setSaving(false);
      onCloseAlert();
      await getNotes();
    }
  };

  const handleNoteForm = async (e) => {
    e.preventDefault();
    const note = e.target?.text?.value?.trim();
    if (!note || note === "") {
      setFormErrors({ text: "Note text is required" });
      return;
    }
    setFormErrors(null);
    setSaving(true);

    if (isEditing) {
      const { data, error } = await inspectionApi.put(
        `/notes/${editNote?.id}`,
        { text: note }
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return;
      }
      toast({
        title: data?.message,
        status: "success",
      });
      setSaving(false);
      onClose();
      await getNotes();
    } else {
      const { data, error } = await inspectionApi.post(`/notes`, {
        text: note,
      });
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSaving(false);
        return;
      }
      toast({
        title: data?.message,
        status: "success",
      });
      setSaving(false);
      e.target.reset();
      onClose();
      await getNotes();
    }
  };

  return (
    <PageLayout
      title="Library Notes"
      isRoot
      btn={"Create Note"}
      onClick={handleTitleBtn}
    >
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterInput
          flexGrow={1}
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
        <>
          {notes.length !== 0 ? (
            <Grid gap={2}>
              {notes.map((note) => (
                <Flex
                  key={note?.id}
                  alignItems="center"
                  p={3}
                  borderRadius={"xl"}
                  bg={"main-bg"}
                  shadow={"xs"}
                  gap={2}
                >
                  <Box flexGrow={1}>
                    <Text color={"gray.700"}>{note?.text}</Text>
                    <Text color={"gray.500"}>
                      Last Updated: {note?.updated_at}
                    </Text>
                  </Box>
                  <Menu>
                    <MenuButton>
                      <MoreIcon />
                    </MenuButton>
                    <MenuList shadow={"lg"}>
                      <MenuItem onClick={() => handleEditNoteBtn(note)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteNoteBtn(note?.id)}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              ))}
            </Grid>
          ) : (
            <DataNotFound>Couldn't find any notes</DataNotFound>
          )}
          {pages && notes.length !== 0 && (
            <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
              <Button
                borderRadius={"full"}
                isDisabled={pages.prev === null}
                onClick={() =>
                  updateSearch("page", pages.prev.toString(), true)
                }
              >
                Prev
              </Button>
              <Text>Current Page: {pages.current_page}</Text>
              <Button
                borderRadius={"full"}
                isDisabled={pages.next === null}
                onClick={() =>
                  updateSearch("page", pages.next.toString(), true)
                }
              >
                Next
              </Button>
            </Flex>
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
          <ModalHeader>
            {isEditing ? "Edit Note" : "Create New Note"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="note_form" onSubmit={handleNoteForm}>
              <FormTextarea
                id="text"
                name="text"
                placeholder="Note text"
                label="Note Text"
                inputError={formErrors?.text}
                defaultValue={editNote?.text}
                px={1}
              />
            </form>
          </ModalBody>
          <ModalFooter gap={2} justifyContent={"start"}>
            <ButtonPrimary
              type="submit"
              form="note_form"
              isLoading={saving}
              loadingText="Submitting"
            >
              {isEditing ? "Update" : "Create"}
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onCloseAlert}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete Note
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                borderRadius={"full"}
                ref={cancelRef}
                onClick={onCloseAlert}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                borderRadius={"full"}
                isLoading={saving}
                loadingText="Submitting"
                onClick={deleteNote}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default LibraryNotes;

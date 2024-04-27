import { useEffect, useRef, useState } from "react";
import inspectionApi from "../api/inspectionApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Grid,
  IconButton,
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
  AlertDialogBody,
  useDisclosure,
  useToast,
  AlertDialogFooter,
  VStack,
  Button,
} from "@chakra-ui/react";
import PageLayout from "../layouts/PageLayout";
import Loading from "../components/Loading";
import Card from "../components/Card";
import { MoreIcon } from "../icons";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import ButtonPrimary from "../components/ButtonPrimary";
import ButtonOuline from "../components/ButtonOutline";
import DataNotFound from "../components/DataNotFound";

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const deleteUserRef = useRef();
  const cancelRef = useRef(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  const getAllUsers = async () => {
    setLoading(true);
    const { data, error } = await inspectionApi.get("/users");
    if (error) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setLoading(false);
      return;
    }
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  function handleEditUserBtn(user) {
    setIsEditing(true);
    setEditUser(user);
    onOpen();
  }

  const handleDeleteUserBtn = (id) => {
    deleteUserRef.current = id;
    onOpenAlert();
  };

  const handleUserForm = async (e) => {
    e.preventDefault();
    const target = e.target;
    const formData = new FormData(target);
    const userData = {
      first: formData.get("first")?.toString().trim(),
      last: formData.get("last")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      password: formData.get("password")?.toString().trim(),
      role: formData.get("role")?.toString().trim(),
    };

    if (!isEditing) {
      const errors = {};
      if (!userData.first || userData.first === "") {
        errors.name = "First name is required";
      }
      if (!userData.email || userData.email === "") {
        errors.email = "Email is required";
      }
      if (!userData.phone || userData.phone === "") {
        errors.phone = "Phone is required";
      }
      if (!userData.password || userData.password === "") {
        errors.password = "Password is requred";
      }
      if (!userData.role || userData.role === "") {
        errors.role = "Role is requred";
      }

      if (Object.keys(errors).length !== 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors(null);
      setSubmitting(true);

      const { data, error } = await inspectionApi.post("/users", userData);
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data.message,
        status: "success",
      });
      setSubmitting(false);
      onClose();
      await getAllUsers();
    } else {
      const editUserData = {};
      if (userData.first !== editUser.first) {
        editUserData.first = userData.first;
      }
      if (userData.last !== editUser.last) {
        editUserData.last = userData.last;
      }
      if (userData.email !== editUser.email) {
        editUserData.email = userData.email;
      }
      if (userData.phone !== editUser.phone) {
        editUserData.phone = userData.phone;
      }
      if (userData.role !== editUser.role) {
        editUserData.role = userData.role;
      }
      if (editUserData.password === "") {
        editUserData.password = undefined;
      }

      setSubmitting(true);

      const { data, error } = await inspectionApi.put(
        `/users/${editUser?.id}`,
        editUserData
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data.message,
        status: "success",
      });
      setSubmitting(false);
      onClose();
      await getAllUsers();
    }
  };

  const handleCreateUserBtn = () => {
    setIsEditing(false);
    setEditUser(null);
    onOpen();
  };

  const deleteUser = async () => {
    if (deleteUserRef.current) {
      setSubmitting(true);
      const { data, error } = await inspectionApi.delete(
        `/users/${deleteUserRef.current}`
      );
      if (error) {
        toast({
          title: error,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data.message,
        status: "success",
      });
      setSubmitting(false);
      onCloseAlert();
      await getAllUsers();
    }
  };

  return (
    <PageLayout
      title="Users"
      isRoot
      btn="Create User"
      onClick={handleCreateUserBtn}
    >
      {loading ? (
        <Loading />
      ) : (
        <Card px={0}>
          {users.length !== 0 ? (
            <>
              <Grid
                px={2}
                py={1}
                gridTemplateColumns={"180px auto 100px 70px 50px"}
                gap={3}
                color={"blue"}
                fontWeight={"semibold"}
              >
                <Text flexGrow={1}>Name</Text>
                <Text>Email</Text>
                <Text>Phone</Text>
                <Text>Role</Text>
                <Text>Action</Text>
              </Grid>
              {users.map((user) => (
                <Grid
                  key={user.id}
                  py={3}
                  px={2}
                  alignItems={"center"}
                  gridTemplateColumns={"180px auto 100px 70px 50px"}
                  gap={3}
                  _hover={{
                    backgroundColor: "gray.100",
                    boxShadow: "xs",
                  }}
                >
                  <Text fontSize={"lg"} fontWeight={"medium"} flexGrow={1}>
                    {user?.first} {user?.last}
                  </Text>
                  <Text>{user.email}</Text>
                  <Text>{user.phone}</Text>
                  <Text>{user.role}</Text>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      variant={"simple"}
                      icon={<MoreIcon />}
                    />
                    <MenuList shadow={"lg"}>
                      <MenuItem onClick={() => handleEditUserBtn(user)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteUserBtn(user.id)}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Grid>
              ))}
            </>
          ) : (
            <DataNotFound>Coundn't find any users</DataNotFound>
          )}
        </Card>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit User" : "Create User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="user_form" onSubmit={handleUserForm}>
              <VStack>
                <FormInput
                  defaultValue={editUser?.first}
                  type="text"
                  id="first"
                  name="first"
                  label="First Name"
                  placeholder="enter first name"
                  inputError={formErrors?.first}
                  isRequired={!isEditing}
                />
                <FormInput
                  defaultValue={editUser?.last}
                  type="text"
                  id="last"
                  name="last"
                  label="Last Name"
                  placeholder="enter last name"
                  inputError={formErrors?.last}
                  isRequired={!isEditing}
                />
                <FormInput
                  defaultValue={editUser?.email}
                  type="email"
                  id="email"
                  name="email"
                  label="Email"
                  placeholder="enter email"
                  inputError={formErrors?.email}
                  isRequired={!isEditing}
                />
                <FormInput
                  defaultValue={editUser?.phone || ""}
                  type="text"
                  id="phone"
                  name="phone"
                  label="Phone"
                  placeholder="enter phone"
                  inputError={formErrors?.phone}
                  isRequired={!isEditing}
                />
                <FormInput
                  type="text"
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="enter password"
                  inputError={formErrors?.password}
                  isRequired={!isEditing}
                />
                <FormSelect
                  defaultValue={editUser?.role}
                  options={["Admin", "Inspector"]}
                  id="role"
                  name="role"
                  label="Role"
                  placeholder="select a role"
                  inputError={formErrors?.role}
                  isRequired={!isEditing}
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3}>
            <ButtonPrimary
              isLoading={submitting}
              loadingText="Submitting"
              type="submit"
              form="user_form"
            >
              {isEditing ? "Update" : "Create"}
            </ButtonPrimary>
            <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <ButtonOuline ref={cancelRef} onClick={onCloseAlert}>
                Cancel
              </ButtonOuline>
              <Button
                borderRadius={"full"}
                colorScheme="red"
                onClick={deleteUser}
                isLoading={submitting}
                loadingText="Submitting"
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

export default Users;

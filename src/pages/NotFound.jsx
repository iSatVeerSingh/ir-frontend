import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import Card from "../components/Card";

const NotFound = () => {
  return (
    <Center minH={"300px"}>
      <Card>
        <Alert status="warning">
          <AlertIcon />
          Page Not Found
        </Alert>
      </Card>
    </Center>
  );
};

export default NotFound;

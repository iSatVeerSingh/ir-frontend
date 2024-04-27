import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import Card from "./Card";

const DataNotFound = ({ children }) => {
  return (
    <Center minH={"300px"}>
      <Card>
        <Alert status="warning">
          <AlertIcon />
          {children}
        </Alert>
      </Card>
    </Center>
  );
};

export default DataNotFound;

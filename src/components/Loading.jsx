import { Box, Spinner } from "@chakra-ui/react";

const Loading = () => {
  return (
    <Box w="full" h={"full"} display={"grid"} placeItems={"center"}>
      <Spinner
        size={"xl"}
        thickness="5px"
        speed="1s"
        emptyColor="gray.400"
        color="blue.500"
      />
    </Box>
  );
};

export default Loading;

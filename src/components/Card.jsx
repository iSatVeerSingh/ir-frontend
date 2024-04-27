import { Box } from "@chakra-ui/react";

const Card = ({ children, ...props }) => {
  return (
    <Box
      p={3}
      borderRadius={"xl"}
      bg={"main-bg"}
      shadow={"xs"}
      zIndex={100}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;

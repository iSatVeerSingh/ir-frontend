import { Button } from "@chakra-ui/react";
import { forwardRef } from "react";

const ButtonPrimary = ({ children, ...props }, ref) => {
  return (
    <Button colorScheme="messenger" minW={"150px"} borderRadius={"full"} {...props} ref={ref}>
      {children}
    </Button>
  );
};

export default forwardRef(ButtonPrimary);

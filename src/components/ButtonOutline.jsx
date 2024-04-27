import { Button } from "@chakra-ui/react";
import { forwardRef } from "react";

const ButtonOutline = ({ children, ...props }, ref) => {
  return (
    <Button
      variant="outline"
      borderRadius={"full"}
      colorScheme="messenger"
      border="2px"
      {...props}
      ref={ref}
    >
      {children}
    </Button>
  );
};

export default forwardRef(ButtonOutline);

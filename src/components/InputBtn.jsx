import { Input } from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

const FilterInput = ({ ...props }, ref) => {
  return (
    <Input
      {...props}
      border={"1px"}
      borderColor={"blue.500"}
      bg={"gray.200"}
      type="button"
      borderRadius={"lg"}
      h="8"
      cursor={"pointer"}
      maxW={"max-content"}
      autoComplete="off"
      ref={ref}
    />
  );
};

export default forwardRef(FilterInput);

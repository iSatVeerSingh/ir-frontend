import { Input } from "@chakra-ui/react";
import { forwardRef } from "react";

const FilterInput = ({ ...props }, ref) => {
  return (
    <Input
      {...props}
      border={"1px"}
      borderColor={"blue.400"}
      borderRadius={"lg"}
      px={1}
      h="8"
      autoComplete="off"
      ref={ref}
    />
  );
};

export default forwardRef(FilterInput);

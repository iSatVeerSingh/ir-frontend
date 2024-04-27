import { Select } from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

const FilterSelect = ({ options, ...props }, ref) => {
  return (
    <Select
      {...props}
      border={"1px"}
      borderColor={"blue.400"}
      borderRadius={"lg"}
      h="8"
      px={1}
      autoComplete="off"
      ref={ref}
    >
      {options.map((opt, index) =>
        typeof opt === "string" ? (
          <option value={opt} key={index}>
            {opt}
          </option>
        ) : (
          <option value={opt.value} key={index}>
            {opt.text}
          </option>
        )
      )}
    </Select>
  );
};

export default forwardRef(FilterSelect);

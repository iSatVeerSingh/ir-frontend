import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  Text,
} from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

const FormSelect = (
  { inputError, label, id, options, subLabel, ...props },
  ref
) => {
  return (
    <FormControl isInvalid={inputError !== undefined && inputError !== ""}>
      <FormLabel htmlFor={id} mb={0} fontSize={"xl"}>
        {label}
        {subLabel && (
          <Text as="span" color={"text.500"} fontSize={"sm"} ml={3}>
            {subLabel}
          </Text>
        )}
      </FormLabel>
      <Select
        {...props}
        id={id}
        h="10"
        autoComplete="off"
        borderRadius={"full"}
        borderColor={"blue.400"}
        borderWidth={"2px"}
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
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(FormSelect);

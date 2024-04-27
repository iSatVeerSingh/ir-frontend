import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { forwardRef } from "react";

const FormInput = ({ inputError, id, label, subLabel, ...props }, ref) => {
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
      <Input
        {...props}
        id={id}
        h="10"
        autoComplete="off"
        borderRadius={"full"}
        borderColor={"blue.400"}
        borderWidth={"2px"}
        ref={ref}
      />
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(FormInput);

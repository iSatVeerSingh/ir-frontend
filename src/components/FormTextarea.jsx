import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { forwardRef } from "react";

const FormTextarea = ({ inputError, id, label, subLabel, ...props }, ref) => {
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
      <Textarea
        {...props}
        id={id}
        autoComplete="off"
        borderRadius={"xl"}
        borderColor={"blue.400"}
        borderWidth={"2px"}
        ref={ref}
      />
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(FormTextarea);

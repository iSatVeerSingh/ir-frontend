import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { forwardRef, useRef, useState } from "react";

const DatalistInput = (
  { dataList, inputError, id, label, subLabel, onSelect, ...props },
  ref
) => {
  const inputRef = ref || useRef(null);
  const [listItems, setListItems] = useState([]);

  const filterDataList = (e) => {
    e.preventDefault();
    const searchText = e.target?.value?.trim();
    if (searchText === "") {
      setListItems([]);
      return;
    }

    const filteredList = dataList.filter((item) => {
      if (typeof item === "string") {
        return item.toLowerCase().includes(searchText.toLowerCase());
      }
      return item.text.toLowerCase().includes(searchText.toLowerCase());
    });
    setListItems(filteredList);
  };

  const selectValue = (item) => {
    if (typeof item === "string") {
      inputRef.current.value = item;
    } else {
      inputRef.current.value = item.text;
      inputRef.current.dataset.value = item.value;
    }
    setListItems([]);
    if (typeof onSelect === "function") {
      onSelect();
    }
  };

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
        onChange={filterDataList}
        id={id}
        h="10"
        autoComplete="off"
        borderRadius={"full"}
        borderColor={"blue.400"}
        borderWidth={"2px"}
        ref={inputRef}
      />
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
      {listItems.length !== 0 && (
        <List
          position={"absolute"}
          shadow={"xl"}
          zIndex={10}
          bg={"white"}
          width={"full"}
          border="1px"
          borderRadius={"md"}
          maxH={"200px"}
          overflowY={"scroll"}
        >
          {listItems.map((item, index) =>
            typeof item === "string" ? (
              <ListItem
                key={index}
                p={1}
                borderBottom={"1px"}
                _hover={{ backgroundColor: "gray.200" }}
                cursor={"pointer"}
                onClick={() => selectValue(item)}
              >
                {item}
              </ListItem>
            ) : (
              <ListItem
                key={index}
                p={1}
                borderBottom={"1px"}
                _hover={{ backgroundColor: "gray.200" }}
                cursor={"pointer"}
                onClick={() => selectValue(item)}
              >
                {item.text}
              </ListItem>
            )
          )}
        </List>
      )}
    </FormControl>
  );
};

export default forwardRef(DatalistInput);

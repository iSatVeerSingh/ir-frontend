import { Box, Flex, Grid, Heading, IconButton } from "@chakra-ui/react";
import { ChevronLeft } from "../icons";
import { useNavigate } from "react-router-dom";
import ButtonPrimary from "../components/ButtonPrimary";

const PageLayout = ({
  children,
  isRoot,
  backPage,
  title,
  btn,
  onClick,
  isLoading,
  loadingText,
}) => {
  const navigate = useNavigate();

  return (
    <Grid shadow={"xs"} gridTemplateRows={"60px auto"} overflow={"hidden"}>
      <Flex
        px={3}
        gap={2}
        alignItems={"center"}
        bg={"main-bg"}
        justify={"space-between"}
        zIndex={100}
        shadow={"xs"}
      >
        <Flex gap={2} alignItems={"center"}>
          {!isRoot && (
            <IconButton
              icon={<ChevronLeft boxSize="5" />}
              aria-label="Go Back"
              borderRadius={"full"}
              // bg={"blue.200"}
              colorScheme="twitter"
              onClick={() => (backPage ? navigate(backPage) : navigate(-1))}
            />
          )}
          <Heading as="h2" fontSize={"2xl"}>
            {title}
          </Heading>
        </Flex>
        {btn && (
          <ButtonPrimary
            isLoading={isLoading}
            loadingText={loadingText}
            onClick={onClick}
          >
            {btn}
          </ButtonPrimary>
        )}
      </Flex>
      <Box p={2} overflowY={"auto"}>
        {children}
      </Box>
    </Grid>
  );
};

export default PageLayout;

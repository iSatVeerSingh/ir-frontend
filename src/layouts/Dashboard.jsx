import { Avatar, Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  Link,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { GlobalContext } from "../context/GlobalContext";
import { useEffect, useState } from "react";
import clientApi from "../api/clientApi";

export const dashboardLoader = ({ request }) => {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      return redirect("/login");
    }

    const url = new URL(request.url);
    if (url.pathname === "/") {
      return redirect("/jobs");
    }

    return JSON.parse(user);
  } catch (err) {
    console.log(err);
    return redirect("/login");
  }
};

const Dashboard = () => {
  const { pathname } = useLocation();
  const currentPath = pathname.split("/")[1];
  const nestedPath = pathname.split("/")[2];
  const [isOnline, setIsOnline] = useState(true);

  const user = useLoaderData();

  const menuItems = [
    {
      name: "Jobs",
      path: "/jobs",
    },
    {
      name: "Items Library",
      path: "/items-library",
    },
    {
      name: "Notes Library",
      path: "/notes-library",
    },
  ];

  const settingsMenu = [
    {
      name: "Items",
      path: "/items",
    },
    {
      name: "Item Categories",
      path: "/categories",
    },
    {
      name: "Notes",
      path: "/notes",
    },
    {
      name: "Job Categories",
      path: "/job-categories",
    },
    {
      name: "Recommendations",
      path: "/recommendations",
    },
    {
      name: "Report Templates",
      path: "/templates",
    },
  ];

  const setOnline = async () => {
    setIsOnline(true);
    setTimeout(async () => {
      await clientApi.get("/sync-items");
    }, 5000);
  };

  const setOffline = () => {
    setIsOnline(false);
  };

  useEffect(() => {
    if (navigator.onLine) {
      setOnline();
    } else {
      setOffline();
    }

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ user }}>
      <Grid bg={"app-bg"} h={"100vh"} templateColumns={"250px auto"}>
        <Grid
          bg={"main-bg"}
          px={"3"}
          shadow={"xs"}
          gridTemplateRows={"60px auto"}
        >
          <Flex gap={2} alignItems={"center"} py={3}>
            <Avatar src="/logo.png" size={"sm"} />
            <Box>
              <Text fontSize={"lg"} lineHeight={1}>
                {user?.name}
              </Text>
              <Text fontSize={"small"}>{isOnline ? "Online" : "Offline"}</Text>
            </Box>
          </Flex>
          <Flex direction={"column"} gap={2}>
            {menuItems.map((item, index) => (
              <Link key={index} to={item.path}>
                <Box
                  px={3}
                  py={2}
                  borderRadius={"full"}
                  bg={item.path === "/" + currentPath ? "main-blue" : "blue.50"}
                  color={item.path === "/" + currentPath ? "white" : "gray.700"}
                >
                  {item.name}
                </Box>
              </Link>
            ))}
            {user?.role !== "Inspector" && (
              <Link to={"/reports"}>
                <Box
                  px={3}
                  py={2}
                  borderRadius={"full"}
                  bg={
                    "/reports" === "/" + currentPath ? "main-blue" : "blue.50"
                  }
                  color={
                    "/reports" === "/" + currentPath ? "white" : "gray.700"
                  }
                >
                  Reports
                </Box>
              </Link>
            )}
            <Link to={"/settings"}>
              <Box
                px={3}
                py={2}
                borderRadius={"full"}
                bg={"/settings" === "/" + currentPath ? "main-blue" : "blue.50"}
                color={"/settings" === "/" + currentPath ? "white" : "gray.700"}
              >
                Settings
              </Box>
            </Link>
            {"/" + currentPath === "/settings" &&
              user?.role !== "Inspector" && (
                <Flex direction={"column"} pl={3} gap={1}>
                  {settingsMenu.map((subitem, index) => (
                    <Link to={"/settings" + subitem.path} key={index}>
                      <Box
                        px={3}
                        py={2}
                        bg={
                          "/settings" + subitem.path ===
                          "/" + currentPath + "/" + nestedPath
                            ? "blue.400"
                            : "blue.50"
                        }
                        color={
                          "/settings" + subitem.path ===
                          "/" + currentPath + "/" + nestedPath
                            ? "white"
                            : "gray.700"
                        }
                        rounded={"full"}
                      >
                        {subitem.name}
                      </Box>
                    </Link>
                  ))}
                  {user?.role === "Owner" && (
                    <Link to={"/settings/users"}>
                      <Box
                        px={3}
                        py={2}
                        bg={
                          "/settings/users" ===
                          "/" + currentPath + "/" + nestedPath
                            ? "blue.400"
                            : "blue.50"
                        }
                        color={
                          "/settings/users" ===
                          "/" + currentPath + "/" + nestedPath
                            ? "white"
                            : "gray.700"
                        }
                        rounded={"full"}
                      >
                        Users
                      </Box>
                    </Link>
                  )}
                </Flex>
              )}
          </Flex>
        </Grid>
        <Outlet />
      </Grid>
    </GlobalContext.Provider>
  );
};

export default Dashboard;

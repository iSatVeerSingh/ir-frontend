import { createBrowserRouter } from "react-router-dom";
import Dashboard, { dashboardLoader } from "../layouts/Dashboard";
import Templates from "../pages/ReportTemplate/Templates";
import LibraryItems from "../pages/LibraryItems/LibraryItems";
import NewLibraryItem from "../pages/LibraryItems/NewLibraryItem";
import LibraryItem from "../pages/LibraryItems/LibraryItem";
import ItemCategories from "../pages/LibraryItems/ItemCategories";
import LibraryNotes from "../pages/Notes/LibraryNotes";
import Recommendations from "../pages/Recommendations";
import JobCategories from "../pages/JobCategories";
import Login from "../pages/Login";
import Init, { initLoader } from "../pages/Init";
import Users from "../pages/Users";
import Jobs from "../pages/Jobs/Jobs";
import Job from "../pages/Jobs/Job";
import AddNotes from "../pages/Jobs/AddNotes";
import ViewNotes from "../pages/Jobs/ViewNotes";
import AddItems from "../pages/Jobs/AddItems";
import ViewItems from "../pages/Jobs/ViewItems";
import ItemPreview from "../pages/Jobs/ItemPreview";
import PreviousReport from "../pages/Jobs/PreviousReport";
import ViewPreviousItems from "../pages/Jobs/ViewPreviousItems";
import Reports from "../pages/Report/Reports";
import Report from "../pages/Report/Report";
import Settings from "../pages/Settings";
import InspectorLibraryItems from "../pages/LibraryItems/InspectorLibraryItems";
import InspectorLibraryNotes from "../pages/Notes/InspectorLibraryNotes";
import ReportItem from "../pages/Report/ReportItem";
import NotFound from "../pages/NotFound";

export default createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: dashboardLoader,
    errorElement: <NotFound />,
    children: [
      {
        path: "/jobs",
        element: <Jobs />,
      },
      {
        path: "/jobs/:job_number",
        element: <Job />,
      },
      {
        path: "/jobs/:job_number/add-notes",
        element: <AddNotes />,
      },
      {
        path: "/jobs/:job_number/all-notes",
        element: <ViewNotes />,
      },
      {
        path: "/jobs/:job_number/previous-report",
        element: <PreviousReport />,
      },
      {
        path: "/jobs/:job_number/previous-items",
        element: <ViewPreviousItems />,
      },
      {
        path: "/jobs/:job_number/previous-items/:id",
        element: <ItemPreview />,
      },
      {
        path: "/jobs/:job_number/add-items",
        element: <AddItems />,
      },
      {
        path: "/jobs/:job_number/all-items",
        element: <ViewItems />,
      },
      {
        path: "/jobs/:job_number/all-items/:id",
        element: <ItemPreview />,
      },
      {
        path: "/items-library",
        element: <InspectorLibraryItems />,
      },
      {
        path: "/notes-library",
        element: <InspectorLibraryNotes />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
      {
        path: "/reports/:id",
        element: <Report />,
      },
      {
        path: "/reports/:id/:id",
        element: <ReportItem />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/settings/items",
        element: <LibraryItems />,
      },
      {
        path: "/settings/items/new",
        element: <NewLibraryItem />,
      },
      {
        path: "/settings/items/:id",
        element: <LibraryItem />,
      },
      {
        path: "/settings/categories",
        element: <ItemCategories />,
      },
      {
        path: "/settings/notes",
        element: <LibraryNotes />,
      },
      {
        path: "/settings/job-categories",
        element: <JobCategories />,
      },
      {
        path: "/settings/recommendations",
        element: <Recommendations />,
      },
      {
        path: "/settings/templates",
        element: <Templates />,
      },
      {
        path: "/settings/users",
        element: <Users />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/init",
    element: <Init />,
    loader: initLoader,
  },
]);

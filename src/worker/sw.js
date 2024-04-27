import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";

import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import {
  addItems,
  addNotes,
  addRecommendationsByJob,
  deletereportItem,
  deleteNote,
  getCategories,
  getreportItemsByJob,
  getJobs,
  getLibraryItems,
  getLibraryItemsIndex,
  getNonSyncedItems,
  getNotes,
  getPreviousItems,
  getPreviousItemsId,
  getPreviousReport,
  getRecommendations,
  initCategories,
  initItems,
  initJobs,
  initNotes,
  initRecommendations,
  initUser,
  removeRecommendations,
  setPreviousReport,
  updateJob,
  updateSyncedItems,
} from "./controller";
import { DB } from "./db";
import serverApi from "./api";
import { errorResponse, successResponse } from "./response";

// // self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);
// clean old assets
cleanupOutdatedCaches();

// Save user to indexeddb
registerRoute(
  ({ url }) => url.pathname === "/client/init-user",
  initUser,
  "POST"
);

// save notes to indexeddb to use offline database
registerRoute(
  ({ url }) => url.pathname === "/client/init-notes",
  initNotes,
  "POST"
);

// save items to indexeddb to use offlie
registerRoute(
  ({ url }) => url.pathname === "/client/init-items",
  initItems,
  "POST"
);
// save item categories to indexeddb to use offlie
registerRoute(
  ({ url }) => url.pathname === "/client/init-categories",
  initCategories,
  "POST"
);

// save recommendations to indexeddb to use offline
registerRoute(
  ({ url }) => url.pathname === "/client/init-recommendations",
  initRecommendations,
  "POST"
);

// save jobs to indexeddb to use offline
registerRoute(
  ({ url }) => url.pathname === "/client/init-jobs",
  initJobs,
  "POST"
);

// get jobs from offline storage
registerRoute(({ url }) => url.pathname === "/client/jobs", getJobs, "GET");

// get update job in offline storage
registerRoute(({ url }) => url.pathname === "/client/jobs", updateJob, "PUT");

// get notes from offline storage
registerRoute(({ url }) => url.pathname === "/client/notes", getNotes, "GET");

// add notes to job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/notes",
  addNotes,
  "POST"
);
// modify notes  to job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/notes",
  deleteNote,
  "PUT"
);
// get item categories
registerRoute(
  ({ url }) => url.pathname === "/client/categories",
  getCategories,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/items-index",
  getLibraryItemsIndex,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/report-items",
  addItems,
  "POST"
);
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/report-items",
  getreportItemsByJob,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/report-items",
  deletereportItem,
  "DELETE"
);
registerRoute(
  ({ url }) => url.pathname === "/client/recommendations",
  getRecommendations,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/recommendations",
  addRecommendationsByJob,
  "POST"
);
registerRoute(
  ({ url }) => url.pathname === "/client/recommendations",
  removeRecommendations,
  "DELETE"
);
registerRoute(
  ({ url }) => url.pathname === "/client/non-synced-items",
  getNonSyncedItems,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/non-synced-items",
  updateSyncedItems,
  "PUT"
);
registerRoute(
  ({ url }) => url.pathname === "/client/previous-report",
  getPreviousReport,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/previous-report",
  setPreviousReport,
  "POST"
);

registerRoute(
  ({ url }) => url.pathname === "/client/previous-item-id",
  getPreviousItemsId,
  "GET"
);

registerRoute(
  ({ url }) => url.pathname === "/client/previous-items",
  getPreviousItems,
  "GET"
);
registerRoute(
  ({ url }) => url.pathname === "/client/items-library",
  getLibraryItems,
  "GET"
);

registerRoute(
  ({ url }) => url.pathname === "/client/sync-jobs",
  async () => {
    if (!navigator.onLine) {
      return errorResponse("No Internet Connection");
    }

    try {
      const { error, data } = await serverApi.get("/jobs");
      if (error) {
        return errorResponse(error);
      }

      await DB.jobs.where("status").equals("Not Started").delete();

      data.forEach(async (job) => {
        const isExstingJob = await DB.jobs.get(job.job_number);
        if (!isExstingJob) {
          await DB.jobs.add(job);
        }
      });

      await syncLibrary();
      await clearSync();

      return successResponse({ message: "App and jobs synced successfully" });
    } catch (err) {
      return errorResponse(err?.name || err?.message);
    }
  },
  "GET"
);

registerRoute(
  ({ url }) => url.pathname === "/client/sync-items",
  async () => {
    await syncReportAndreportItems();
    return successResponse({ message: "Items synced successfully" });
  },
  "GET"
);

const syncReportAndreportItems = async () => {
  try {
    if (!navigator.onLine) {
      return;
    }

    const currentTime = Date.now();
    const sync = await DB.sync.get("sync");
    if (!sync) {
      return;
    }

    const job = await DB.jobs.where("status").equals("In Progress").first();
    if (!job) {
      return;
    }

    if (!job.sync || job.sync !== "Synced Online") {
      const { data, error } = await serverApi.post("/reports", {
        id: job.report_id,
        job_id: job.id,
        customer_id: job.customer.id,
      });

      if (error) {
        console.log(error);
        return;
      }

      await DB.jobs.update(job.job_number, { sync: "Synced Online" });
    }

    const allreportItemsNotSynced = await DB.reportItems
      .where("sync")
      .equals(job.report_id)
      .toArray();

    const deletedItems = await DB.deletedItems.toArray();

    if (allreportItemsNotSynced.length === 0 && deletedItems.length === 0) {
      return;
    }

    const { error, data } = await serverApi.post("/report-items?bulk=true", {
      report_items: allreportItemsNotSynced,
      deleted_report_items: deletedItems,
    });

    if (error) {
      console.log(error);
      return;
    }

    await DB.deletedItems.clear();
    const syncedItemsIds = data;
    if (!Array.isArray(syncedItemsIds)) {
      return;
    }
    await DB.reportItems
      .where("id")
      .anyOf(syncedItemsIds)
      .modify((item) => {
        item.sync = "Synced Online";
      });

    await DB.sync.update("sync", {
      lastSync: currentTime,
    });

    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const syncLibrary = async () => {
  try {
    if (!navigator.onLine) {
      return;
    }

    const sync = await DB.sync.get("sync");
    if (!sync) {
      return;
    }

    const lastSyncLibrary = sync.lastSyncLibrary;
    const currentTime = Date.now();

    let date = new Date(lastSyncLibrary);

    let hours = date.getHours();
    let ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be displayed as 12 in 12-hour format

    let formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${hours
      .toString()
      .padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} ${ampm}`;

    const { data, error } = await serverApi.get(
      `/sync-library?lastSync=${formattedDate}`
    );
    if (error) {
      console.log(error);
      return;
    }

    data.items.forEach(async (item) => {
      if (!item.active) {
        await DB.items.delete(item.id);
      } else {
        await DB.items.put(item);
      }
    });
    data.categories.forEach(async (category) => {
      if (!category.active) {
        await DB.categories.delete(category.id);
      } else {
        await DB.categories.put(category);
        await DB.items
          .where("category_id")
          .equals(category.id)
          .modify((item) => {
            item.category = category.name;
            item.category_id = category.id;
          });
      }
    });
    data.notes.forEach(async (item) => {
      if (!item.active) {
        await DB.notes.delete(item.id);
      } else {
        await DB.notes.put(item);
      }
    });
    data.recommendations.forEach(async (item) => {
      if (!item.active) {
        await DB.recommendations.delete(item.id);
      } else {
        await DB.recommendations.put(item);
      }
    });

    await DB.sync.update("sync", { lastSyncLibrary: currentTime });
  } catch (err) {
    console.log(err);
  }
};

const clearSync = async () => {
  try {
    const currentTime = Date.now();
    const sync = await DB.sync.get("sync");
    if (!sync) {
      return;
    }
    if (currentTime - sync.clearSync < 1000 * 60 * 60 * 24) {
      return;
    }

    const completedJobs = await DB.jobs
      .where("status")
      .equals("Completed")
      .toArray();
    if (!completedJobs || completedJobs.length === 0) {
      return;
    }

    completedJobs.forEach(async (job) => {
      await DB.reportItems.where("report_id").equals(job.report_id).delete();
      await DB.jobs.delete(job.job_number);
    });

    await DB.previousReports.clear();

    await DB.sync.update("sync", { clearSync: currentTime });
  } catch (err) {
    console.log(err);
  }
};

let allowlist;
if (import.meta.env.DEV) {
  allowlist = [/^\/$/];
} else {
  allowlist = [/^\/(?!api\/)/]; // Exclude URLs starting with "/api"
}
// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.skipWaiting();
clientsClaim();

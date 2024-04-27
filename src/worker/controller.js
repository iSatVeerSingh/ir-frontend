import { DB } from "./db";
import { errorResponse, successResponse } from "./response";

export const initUser = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body) {
      return errorResponse();
    }

    await DB.users.clear();
    const user = await DB.users.add({ type: "user", ...body });
    if (!user) {
      return errorResponse();
    }
    await DB.sync.add({
      type: "sync",
      lastSync: Date.now(),
      lastSyncLibrary: Date.now(),
      clearSync: Date.now(),
    });
    return successResponse({ message: "User added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const initNotes = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body) {
      return errorResponse();
    }

    await DB.notes.clear();
    await DB.notes.bulkAdd(body);
    return successResponse({ message: "Notes added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const initItems = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body) {
      return errorResponse();
    }

    await DB.items.clear();
    await DB.items.bulkAdd(body);
    return successResponse({ message: "Items added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const initCategories = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body) {
      return errorResponse();
    }

    await DB.categories.clear();
    await DB.categories.bulkAdd(body);
    return successResponse({ message: "Categories added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};
export const initRecommendations = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body) {
      return errorResponse();
    }

    await DB.recommendations.clear();
    await DB.recommendations.bulkAdd(body);
    return successResponse({ message: "Recommendations added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

// sync not started or work order jobs
export const initJobs = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body) {
      return errorResponse();
    }

    await DB.jobs.clear();
    await DB.jobs.bulkAdd(body);
    return successResponse({ message: "Jobs added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

// get jobs from offline storage
export const getJobs = async ({ url }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    if (job_number) {
      const transaction = await DB.transaction(
        "rw",
        DB.jobs,
        DB.reportItems,
        async () => {
          const job = await DB.jobs.get(job_number);
          if (!job) {
            return null;
          }

          if (!job.report_id) {
            return {
              ...job,
              newReportItems: 0,
            };
          }

          const newReportItems = await DB.reportItems
            .where({ report_id: job.report_id, previous_item: 0 })
            .count();
          const previousReportItems = await DB.reportItems
            .where({ report_id: job.report_id, previous_item: 1 })
            .count();
          return {
            ...job,
            newReportItems,
            previousReportItems,
          };
        }
      );

      if (!transaction) {
        return errorResponse("No Job found");
      }
      return successResponse(transaction);
    }

    const jobs = await DB.jobs.toArray();
    const sortedJobs = jobs.sort((a, b) => {
      return new Date(a.starts_at) - new Date(b.starts_at);
    });
    return successResponse(sortedJobs);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const updateJob = async ({ url, request }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    const body = await request.json();

    const updated = await DB.jobs.update(job_number, body);
    if (updated === 0) {
      return errorResponse("Job not found");
    }
    return successResponse({ message: "Job updated successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

// get notes from offline storage
export const getNotes = async () => {
  try {
    const notes = await DB.notes.toArray();
    return successResponse(notes);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const addNotes = async ({ url, request }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    const body = await request.json();

    const currentJob = await DB.jobs.get(job_number);
    if (!currentJob) {
      return errorResponse();
    }

    const isExists = currentJob?.notes?.find((note) => note === body.note);
    if (isExists) {
      return errorResponse("Note already exists.");
    }
    const added = await DB.jobs
      .where("job_number")
      .equals(job_number)
      .modify((job) => {
        if (!job.notes) {
          job.notes = [body.note];
        } else {
          job.notes.push(body.note);
        }
      });
    if (added === 0) {
      return errorResponse();
    }
    return successResponse({ message: "Note added successfully" });
  } catch (err) {
    return errorResponse();
  }
};

export const deleteNote = async ({ url, request }) => {
  try {
    const job_number = url.searchParams.get("job_number");

    const body = await request.json();

    const deleted = await DB.jobs
      .where("job_number")
      .equals(job_number)
      .modify((job) => {
        if (job.notes && job.notes.length !== 0) {
          job.notes = job.notes.filter((note) => note !== body.note);
        }
      });
    if (deleted === 0) {
      return errorResponse();
    }
    return successResponse({ message: "Note deleted successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const getCategories = async () => {
  try {
    const categories = await DB.categories.toArray();
    return successResponse(categories);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const getLibraryItemsIndex = async () => {
  try {
    const allitems = await DB.items.toArray();
    const items = allitems.map((item) => ({
      name: item.name,
      category: item.category,
      id: item.id,
    }));
    return successResponse(items);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const addItems = async ({ url, request }) => {
  try {
    const job_number = url.searchParams.get("job_number");

    if (job_number) {
      await DB.jobs.update(job_number, { status: "In Progress" });
    }
    const body = await request.json();

    const id = await DB.reportItems.add(body);
    if (!id) {
      return errorResponse();
    }
    return successResponse({ message: "Item added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const getreportItemsByJob = async ({ url }) => {
  try {
    const id = url.searchParams.get("id");
    if (id) {
      const transaction = await DB.transaction(
        "rw",
        DB.reportItems,
        DB.items,
        async () => {
          const reportItem = await DB.reportItems.get(id);
          if (!reportItem) {
            return null;
          }
          if (reportItem.item_id) {
            const libraryItem = await DB.items.get(reportItem.item_id);
            if (libraryItem) {
              reportItem.summary = libraryItem.summary;
              reportItem.embedded_images = libraryItem.embedded_images;
            }
          }

          return reportItem;
        }
      );

      if (!transaction) {
        return errorResponse();
      }
      return successResponse(transaction);
    }

    const job_number = url.searchParams.get("job_number");
    if (!job_number) {
      return successResponse();
    }

    const page = url.searchParams.get("page");
    const name = url.searchParams.get("name");

    const category = url.searchParams.get("category");

    const perPage = 15;
    const pageNumber = Number(page);
    const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;

    const transaction = await DB.transaction(
      "rw",
      DB.jobs,
      DB.reportItems,
      async () => {
        const job = await DB.jobs.get(job_number);
        if (!job) {
          return null;
        }
        const dbQuery = {
          report_id: job.report_id,
          previous_item: 0,
          ...(category ? { category } : {}),
        };

        const itemsCollection = DB.reportItems.where(dbQuery);
        if (name) {
          const allItems = await itemsCollection.toArray();
          const filteredItems = allItems.filter((item) =>
            item.name.toLowerCase().includes(name.toLowerCase())
          );
          return {
            data: filteredItems,
            pages: {
              current_page: 1,
              total_pages: 1,
              next: null,
              prev: null,
            },
          };
        }

        const total = await itemsCollection.count();
        const totalPages =
          total % perPage === 0 ? total / perPage : Math.ceil(total / perPage);

        const items = await itemsCollection
          .offset(skip)
          .limit(perPage)
          .sortBy('created_at');

        const current_page = pageNumber === 0 ? 1 : pageNumber;
        return {
          data: items,
          pages: {
            current_page,
            total_pages: totalPages,
            next: current_page < totalPages ? current_page + 1 : null,
            prev: current_page > 1 ? current_page - 1 : null,
          },
        };
      }
    );

    if (!transaction) {
      return errorResponse();
    }

    return successResponse(transaction);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const deletereportItem = async ({ url }) => {
  try {
    const id = url.searchParams.get("id");
    if (!id) {
      return errorResponse();
    }

    await DB.reportItems.delete(id);
    await DB.deletedItems.add({ id });
    return successResponse({
      message: "Inspection item deleted successfully",
    });
  } catch (err) {
    return successResponse(err?.message);
  }
};

export const getRecommendations = async () => {
  try {
    const recommendations = await DB.recommendations.toArray();
    return successResponse(recommendations);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const addRecommendationsByJob = async ({ url, request }) => {
  try {
    const job_number = url.searchParams.get("job_number");

    const body = await request.json();

    const updated = await DB.jobs.update(job_number, body);
    if (updated === 0) {
      return errorResponse("Job not found");
    }
    return successResponse({ message: "Recommendation added successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const removeRecommendations = async ({ url }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    if (!job_number) {
      return errorResponse();
    }

    const updated = await DB.jobs.update(job_number, { recommendation: null });
    if (updated === 0) {
      return errorResponse("Job not found");
    }
    return successResponse({
      message: "Recommendation removed successfully",
    });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const getNonSyncedItems = async ({ url }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    if (!job_number) {
      return errorResponse();
    }

    const transaction = await DB.transaction(
      "rw",
      DB.jobs,
      DB.reportItems,
      DB.deletedItems,
      async () => {
        const job = await DB.jobs.get(job_number);
        if (!job) {
          return null;
        }
        const allreportItemsNotSynced = await DB.reportItems
          .where("sync")
          .equals(job.report_id)
          .toArray();

        const deletedItems = await DB.deletedItems.toArray();

        return {
          report_items: allreportItemsNotSynced,
          deleted_report_items: deletedItems,
        };
      }
    );

    if (!transaction) {
      return errorResponse("Job not found");
    }

    return successResponse(transaction);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const updateSyncedItems = async ({ request }) => {
  try {
    const body = await request.json();

    if (body.reportItems && body.reportItems.length > 0) {
      await DB.reportItems
        .where("id")
        .anyOf(body.reportItems)
        .modify((item) => {
          item.sync = "Synced Online";
        });
    }

    await DB.deletedItems.clear();
    return successResponse({ message: "Items synced successfully" });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const getPreviousReport = async ({ url }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    if (!job_number) {
      return errorResponse();
    }

    const previousReport = await DB.previousReports.get(job_number);
    if (!previousReport) {
      return errorResponse("Report not found in offline database");
    }
    return successResponse(previousReport);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const setPreviousReport = async ({ url, request }) => {
  try {
    const job_number = url.searchParams.get("job_number");
    if (!job_number) {
      return errorResponse();
    }

    const body = await request.json();
    if (!body) {
      return errorResponse();
    }

    await DB.previousReports.put({ ...body, job_number });
    return successResponse({
      message: "Previous report saved to offline database",
    });
  } catch (err) {
    return errorResponse(err?.message);
  }
};

export const getPreviousItemsId = async ({ url }) => {
  try {
    const report_id = url.searchParams.get("report_id");
    if (!report_id) {
      return errorResponse();
    }

    const allPreviousItems = await DB.reportItems
      .where({
        report_id: report_id,
        previous_item: 1,
      })
      .toArray();
    const previousItems = allPreviousItems.map((item) => ({
      id: item.id,
      previous_report_item_id: item.previous_report_item_id,
    }));
    return successResponse(previousItems);
  } catch (err) {
    return errorResponse();
  }
};

export const getPreviousItems = async ({ url }) => {
  try {
    const report_id = url.searchParams.get("report_id");
    if (!report_id) {
      return errorResponse();
    }

    const allPreviousItems = await DB.reportItems
      .where({
        report_id: report_id,
        previous_item: 1,
      })
      .toArray();
    return successResponse(allPreviousItems);
  } catch (err) {
    return errorResponse();
  }
};

export const getLibraryItems = async ({ url }) => {
  try {
    const page = url.searchParams.get("page");

    const category = url.searchParams.get("category_id");
    const name = url.searchParams.get("name");

    const perPage = 15;
    const pageNumber = Number(page);
    const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;

    let itemsCollection;
    if (category) {
      itemsCollection = DB.items.where("category_id").equals(category);
    } else {
      itemsCollection = DB.items.toCollection();
    }

    if (name) {
      const allItems = await itemsCollection.toArray();
      const filteredItems = allItems.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );
      return successResponse({
        data: filteredItems,
        pages: {
          current_page: 1,
          total_pages: 1,
          next: null,
          prev: null,
        },
      });
    }

    const total = await itemsCollection.count();
    const totalPages =
      total % perPage === 0 ? total / perPage : Math.ceil(total / perPage);

    const items = await itemsCollection.offset(skip).limit(perPage).toArray();

    const current_page = pageNumber === 0 ? 1 : pageNumber;
    const transaction = {
      data: items,
      pages: {
        current_page,
        total_pages: totalPages,
        next: current_page < totalPages ? current_page + 1 : null,
        prev: current_page > 1 ? current_page - 1 : null,
      },
    };

    return successResponse(transaction);
  } catch (err) {
    return errorResponse(err?.message);
  }
};

import Dexie from "dexie";

export const DB = new Dexie("inspection-db");
DB.version(5).stores({
  users: "++type",
  notes: "++id",
  items: "++id, category_id",
  categories: "++id",
  recommendations: "++id",
  jobs: "++job_number, id, status, starts_at",
  reportItems:
    "++id, report_id, name, category, previous_item, sync, [report_id+previous_item+category], created_at",
  previousReports: "++job_number, customer_id",
  deletedItems: "++id",
  sync: "++type",
});

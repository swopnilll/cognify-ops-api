export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const TICKET_TYPES = ["task", "bug", "story"] as const;
export const TICKET_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "due_date",
  "priority",
  "name",
] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketSortField = (typeof TICKET_SORT_FIELDS)[number];

export interface TicketPayload {
  project_id: number;
  name: string;
  description?: string;
  created_by: string;
  status_id?: number;
  priority?: TicketPriority;
  type?: TicketType;
  due_date?: string | null; // ISO 8601
}

// Fields that PATCH /tickets/:ticketId may change. Status and assignee have
// their own endpoints.
export interface TicketUpdatePayload {
  name?: string;
  description?: string | null;
  priority?: TicketPriority;
  type?: TicketType;
  due_date?: string | null; // ISO 8601, or null to clear it
}

export interface TicketListFilters {
  status?: number;
  assignee?: string;
  priority?: TicketPriority;
  type?: TicketType;
  q?: string;
  sort?: TicketSortField;
  order?: "asc" | "desc";
}

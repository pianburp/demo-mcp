import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Order } from "./order-schema";

export type OrderStatus = "pending" | "sent";

// One row on the owner's dashboard.
export type StoredOrder = {
  id: string;
  receivedAt: string; // ISO time
  customerId: string;
  customerName: string;
  message: string;
  items: Order["items"];
  pickupDate: string | null;
  notes: string;
  checkThis: boolean;
  draftReply: string;
  status: OrderStatus;
  sentAt: string | null; // ISO time, set only by approve
};

export type NewOrder = Omit<StoredOrder, "id" | "status" | "sentAt">;

// The real system swaps this for PostgreSQL.
export interface OrderStore {
  add(order: NewOrder): Promise<StoredOrder>;
  list(): Promise<StoredOrder[]>;
  // S1: the only way an order becomes "sent". Returns null if the order is missing or not pending.
  approve(id: string, reply: string, sentAt: string): Promise<StoredOrder | null>;
}

// Saves all orders in one JSON file.
// Sync file calls on purpose: each method reads and writes in one go, so two requests in the
// same process cannot interleave. shortcut: one process only, swap for PostgreSQL in the real system.
export class JsonFileOrderStore implements OrderStore {
  constructor(private file: string) {}

  private read(): StoredOrder[] {
    return existsSync(this.file) ? JSON.parse(readFileSync(this.file, "utf8")) : [];
  }

  private write(orders: StoredOrder[]) {
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(orders, null, 2));
  }

  async add(order: NewOrder): Promise<StoredOrder> {
    const orders = this.read();
    const saved: StoredOrder = {
      id: `ORD-${String(orders.length + 1).padStart(4, "0")}`,
      ...order,
      status: "pending",
      sentAt: null,
    };
    this.write([...orders, saved]);
    return saved;
  }

  async list(): Promise<StoredOrder[]> {
    return this.read();
  }

  async approve(id: string, reply: string, sentAt: string): Promise<StoredOrder | null> {
    const orders = this.read();
    const order = orders.find((o) => o.id === id);
    if (!order || order.status !== "pending") return null;
    Object.assign(order, { draftReply: reply, status: "sent", sentAt });
    this.write(orders);
    return order;
  }
}

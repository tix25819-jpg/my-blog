import { pgTable, serial, varchar, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// System table - DO NOT DELETE
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Admin users table
export const admins = pgTable(
	"admins",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		username: varchar("username", { length: 50 }).notNull().unique(),
		password_hash: varchar("password_hash", { length: 255 }).notNull(),
		email: varchar("email", { length: 100 }).notNull(),
		role: varchar("role", { length: 20 }).notNull().default("admin"),
		is_active: boolean("is_active").default(true).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("admins_username_idx").on(table.username),
		index("admins_email_idx").on(table.email),
	]
);

// Categories table
export const categories = pgTable(
	"categories",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 50 }).notNull(),
		slug: varchar("slug", { length: 60 }).notNull().unique(),
		description: text("description"),
		sort_order: integer("sort_order").default(0).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("categories_slug_idx").on(table.slug),
		index("categories_sort_order_idx").on(table.sort_order),
	]
);

// Articles table
export const articles = pgTable(
	"articles",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		title: varchar("title", { length: 200 }).notNull(),
		slug: varchar("slug", { length: 220 }).notNull().unique(),
		content: text("content").notNull(),
		summary: text("summary"),
		cover_image: varchar("cover_image", { length: 500 }),
		category_id: varchar("category_id", { length: 36 }).notNull().references(() => categories.id, { onDelete: "cascade" }),
		author: varchar("author", { length: 50 }).notNull().default("Admin"),
		view_count: integer("view_count").default(0).notNull(),
		status: varchar("status", { length: 20 }).notNull().default("draft"),
		is_top: boolean("is_top").default(false).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("articles_category_id_idx").on(table.category_id),
		index("articles_status_idx").on(table.status),
		index("articles_created_at_idx").on(table.created_at),
		index("articles_slug_idx").on(table.slug),
		index("articles_is_top_idx").on(table.is_top),
	]
);

// Messages (contact/leave message) table
export const messages = pgTable(
	"messages",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 50 }).notNull(),
		email: varchar("email", { length: 100 }).notNull(),
		content: text("content").notNull(),
		status: varchar("status", { length: 20 }).notNull().default("pending"),
		reply: text("reply"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("messages_status_idx").on(table.status),
		index("messages_created_at_idx").on(table.created_at),
	]
);

// Site configuration table
export const siteConfig = pgTable(
	"site_config",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		config_key: varchar("config_key", { length: 100 }).notNull().unique(),
		config_value: text("config_value").notNull(),
		description: varchar("description", { length: 200 }),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("site_config_key_idx").on(table.config_key),
	]
);

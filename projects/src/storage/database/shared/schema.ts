import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core"

// 系统健康检查表（不要删除）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 博客文章表
export const blogPosts = pgTable(
	"blog_posts",
	{
		id: serial("id").primaryKey(),
		title: text("title").notNull(),
		summary: text("summary").notNull(),
		content: text("content").notNull(),
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("blog_posts_created_at_idx").on(table.created_at),
	]
);

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// 用户表
export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		username: text("username").notNull().unique(),
		password: text("password").notNull(),
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("users_username_idx").on(table.username),
	]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 游戏记录表
export const gameRecords = pgTable(
	"game_records",
	{
		id: serial("id").primaryKey(),
		user_id: serial("user_id").notNull(),
		scenario: text("scenario").notNull(),
		final_score: serial("final_score").notNull(),
		result: text("result").notNull(),
		played_at: timestamp("played_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("game_records_user_id_idx").on(table.user_id),
		index("game_records_played_at_idx").on(table.played_at),
	]
);

export type GameRecord = typeof gameRecords.$inferSelect;
export type InsertGameRecord = typeof gameRecords.$inferInsert;

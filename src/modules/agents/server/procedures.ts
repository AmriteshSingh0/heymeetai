import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { create } from "domain";
import { agentsInsertSchema } from "../schemas";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { PgTableWithColumns, PgColumn } from "drizzle-orm/pg-core";

export const agentsRouter = createTRPCRouter({

  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
  const [existingAgent] = await db
    .select({
      meetingCount: sql<number>`5`,
      ...getTablesColumns(agents),
    })
    .from(agents)
    .where(eq(agents.id, input.id));

  return existingAgent;
}),

  getMany: protectedProcedure.query(async () => {
    const data = await db
      .select()
      .from(agents);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      //throw new TRPCError({ code:"BAD_REQUEST"})

    return data;
  }),

  create: protectedProcedure
  .input(agentsInsertSchema)
  .mutation(async ({ input, ctx }) => {
    const [createdAgent] = await db
      .insert(agents)
      .values({
        ...input,
        userId: ctx.auth.user.id,
      })
      .returning();

     return createdAgent; 
  }), 
});

function getTablesColumns(agents: PgTableWithColumns<{ name: "agents"; schema: undefined; columns: { id: PgColumn<{ name: "id"; tableName: "agents"; dataType: "string"; columnType: "PgText"; data: string; driverParam: string; notNull: true; hasDefault: true; isPrimaryKey: true; isAutoincrement: false; hasRuntimeDefault: true; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>; name: PgColumn<{ name: "name"; tableName: "agents"; dataType: "string"; columnType: "PgText"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>; userId: PgColumn<{ name: "user_id"; tableName: "agents"; dataType: "string"; columnType: "PgText"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>; instructions: PgColumn<{ name: "instructions"; tableName: "agents"; dataType: "string"; columnType: "PgText"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>; createdAt: PgColumn<{ name: "created_at"; tableName: "agents"; dataType: "date"; columnType: "PgTimestamp"; data: Date; driverParam: string; notNull: true; hasDefault: true; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>; updatedAt: PgColumn<{ name: "updated_at"; tableName: "agents"; dataType: "date"; columnType: "PgTimestamp"; data: Date; driverParam: string; notNull: true; hasDefault: true; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>; }; dialect: "pg"; }>): any {
  throw new Error("Function not implemented.");
}

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/bars",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const bars = await ctx.runQuery(api.bars.list);
    return new Response(JSON.stringify(bars), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/bars/:id",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return new Response("Not found", { status: 404 });
    }
    const bar = await ctx.runQuery(api.bars.getById, { id: id as any });
    if (!bar) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(JSON.stringify(bar), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as cycles from "../cycles.js";
import type * as franchises from "../franchises.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as keyResults from "../keyResults.js";
import type * as members from "../members.js";
import type * as migrations from "../migrations.js";
import type * as milestones from "../milestones.js";
import type * as objectives from "../objectives.js";
import type * as phasing from "../phasing.js";
import type * as progressEntries from "../progressEntries.js";
import type * as reports from "../reports.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  comments: typeof comments;
  cycles: typeof cycles;
  franchises: typeof franchises;
  helpers: typeof helpers;
  http: typeof http;
  keyResults: typeof keyResults;
  members: typeof members;
  migrations: typeof migrations;
  milestones: typeof milestones;
  objectives: typeof objectives;
  phasing: typeof phasing;
  progressEntries: typeof progressEntries;
  reports: typeof reports;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

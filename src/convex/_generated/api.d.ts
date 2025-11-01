/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as assessments from "../assessments.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as portfolio from "../portfolio.js";
import type * as profiles from "../profiles.js";
import type * as profilesActions from "../profilesActions.js";
import type * as projects from "../projects.js";
import type * as skills from "../skills.js";
import type * as trajectories from "../trajectories.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  assessments: typeof assessments;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  http: typeof http;
  portfolio: typeof portfolio;
  profiles: typeof profiles;
  profilesActions: typeof profilesActions;
  projects: typeof projects;
  skills: typeof skills;
  trajectories: typeof trajectories;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

import { getUserProfile } from "./cached";

// This runs at module load time, outside the RSC render cache context.
export const outsideProfilePromise = getUserProfile("1");

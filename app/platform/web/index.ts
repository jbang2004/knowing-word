import { createProfileClient } from "../../application/profile-client.ts";
import { createRecordingsClient } from "../../application/recordings-client.ts";
import {
  browserConnectivity,
  browserStorage,
  browserStorageEvents,
  browserTransport,
} from "./browser-platform.ts";

export const webProfileClient = createProfileClient({
  storage: browserStorage,
  transport: browserTransport,
  connectivity: browserConnectivity,
});

export const webRecordingsClient = createRecordingsClient(browserTransport);

export {
  browserConnectivity,
  browserStorage,
  browserStorageEvents,
  browserTransport,
};

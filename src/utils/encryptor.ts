/** @format */

import * as crypto from "node:crypto";

export const encrypt = (data: string) => {
  if (!process.env.SECRET)
    throw new Error("Encryption secret was not provided.");
  const Hmac = crypto.createHmac("sha256", process.env.SECRET);
  Hmac.update(data);
  return Hmac.digest("hex");
};

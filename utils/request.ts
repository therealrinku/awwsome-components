/*
  Socials.js @2024
*/

import { constants } from "./constants";

interface HandleChannelApiCallType {
  /*
    default method is get
  */
  method?: string;
  endpoint: string;
  channel: string;
  body?: string;
  queryParamString?: string;
  bearerToken?: string;
  apiVersion: string;
}

const channelEndpointMap = {
  facebook: constants.fbGraphApiBaseUrl,
};

export async function handleChannelApiCall({
  method = "get",
  endpoint,
  channel,
  bearerToken,
  body,
  queryParamString = "",
  apiVersion = "",
}: HandleChannelApiCallType) {
  const baseUrl = channelEndpointMap[channel] + apiVersion ? `/${apiVersion}` : "";

  if (!baseUrl) {
    throw new Error("Unsupported Channel");
  }

  const url = `${baseUrl}/${endpoint}?${queryParamString}`;

  const requestOptions = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    requestOptions["body"] = JSON.stringify(body);
  }

  if (bearerToken) {
    requestOptions.headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const response = await fetch(url, requestOptions);
  return response;
}

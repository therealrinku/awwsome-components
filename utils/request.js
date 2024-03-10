/*
  Socials.js @2024
*/

const { constants } = require("./constants");

const channelEndpointMap = {
  facebook: constants.fbGraphApiBaseUrl,
};

async function handleChannelApiCall({
  method = "get",
  endpoint,
  channel,
  bearerToken,
  body,
  queryParamString = "",
  apiVersion = "",
}) {
  // @ts-expect-error
  const baseUrl = `${channelEndpointMap[channel]}/${apiVersion || constants.defaultFbGraphApiVersion}`;

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
    // @ts-expect-error
    requestOptions["body"] = JSON.stringify(body);
  }

  if (bearerToken) {
    // @ts-expect-error
    requestOptions.headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const response = await fetch(url, requestOptions);
  return response;
}

module.exports = { handleChannelApiCall };

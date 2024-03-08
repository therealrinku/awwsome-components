/*
  Socials.js @2024
  
  FB Graph API SDK
  - long lived access token docs: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/
  - post docs: https://developers.facebook.com/docs/pages-api/posts/
  - insight docs: https://developers.facebook.com/docs/platforminsights/page
*/

/*
  Todo: Make everything super typesafe
*/

import { handleChannelApiCall } from "../utils/request";

type GraphApiVersionType = "v19.0" | "v18.0" | "v17.0";

export class FB {
  constructor(fbAppId: string, fbAppSecret: string, graphApiVersion?: GraphApiVersionType) {
    //@ts-expect-error
    this.graphApiVersion = graphApiVersion || "v19.0";
    //@ts-expect-error
    this.fbAppId = fbAppId;
    //@ts-expect-error
    this.fbAppSecret = fbAppSecret;
  }

  async createPost(pageId: string, body: string, pageAccessToken: string) {
    if (!pageId || !body || !pageAccessToken) {
      throw new Error("Not enough info to create post");
    }

    const response = await handleChannelApiCall({
      endpoint: `${pageId}/feed`,
      bearerToken: pageAccessToken,
      channel: "facebook",
      method: "post",
      body: body,
      //@ts-expect-error
      apiVersion: this.graphApiVersion,
    });

    const resp = await response.json();

    if (!resp.id) {
      throw new Error("Something went wrong while publishing the post.");
    }

    return resp.id;
  }

  async getPagePosts(pageId: string, pageAccessToken: string) {
    if (!pageId || !pageAccessToken) {
      throw new Error("Not enough info to get page posts");
    }

    const response = await handleChannelApiCall({
      endpoint: `${pageId}/feed`,
      queryParamString: `fields=likes.summary(true),comments.summary(true),shares,full_picture,permalink_url,message,created_time`,
      bearerToken: pageAccessToken,
      channel: "facebook",
      //@ts-expect-error
      apiVersion: this.graphApiVersion,
    });

    return await response.json();
  }

  async getMe(shortLivedAccessToken: string) {
    if (!shortLivedAccessToken) {
      throw new Error("Invalid access token");
    }

    const response = await handleChannelApiCall({
      endpoint: `me`,
      queryParamString: `fields=id,name`,
      bearerToken: shortLivedAccessToken,
      channel: "facebook",
      //@ts-expect-error
      apiVersion: this.graphApiVersion,
    });

    return await response.json();
  }

  async getUserLongLivedAccessToken(shortLivedAccessToken: string) {
    if (!shortLivedAccessToken) {
      throw new Error("Invalid access token");
    }

    //@ts-expect-error
    const { fbAppId, fbAppSecret } = this;

    const response = await handleChannelApiCall({
      endpoint: `oauth/access_token`,
      queryParamString: `grant_type=fb_exchange_token&  
      client_id=${fbAppId}&
      client_secret=${fbAppSecret}&
      fb_exchange_token=${shortLivedAccessToken}`,
      channel: "facebook",
      //@ts-expect-error
      apiVersion: this.graphApiVersion,
    });

    const longLivedAccessToken = (await response.json())?.access_token;

    if (!longLivedAccessToken) {
      throw new Error("Something went wrong, please try again later");
    }

    return longLivedAccessToken;
  }

  async getFirstPage(userLongLivedAccessToken: string, appScopedUserId: string) {
    if (!userLongLivedAccessToken || !appScopedUserId) {
      throw new Error("Not enough data provided");
    }

    const response = await handleChannelApiCall({
      endpoint: `${appScopedUserId}/accounts`,
      queryParamString: `access_token=${userLongLivedAccessToken}`,
      channel: "facebook",
      //@ts-expect-error
      apiVersion: this.graphApiVersion,
    });

    const responseJson = await response.json();

    /* if data length is 0
       that means there are not any pages or user haven't provided access to any pages yet
    */
    if (responseJson.data?.length === 0) {
      throw new Error("You don't have any pages or you haven't provided enough permissions.");
    }

    const pages = responseJson.data;
    return pages;
  }

  async getPageInsights(pageId: string, pageLongLivedAccessToken: string) {
    if (!pageId || !pageLongLivedAccessToken) {
      throw new Error("Not enough data provided");
    }

    const response = await handleChannelApiCall({
      endpoint: `${pageId}/insights`,
      queryParamString: `metric=page_post_engagements&period=day&date_preset=last_30d&access_token=${pageLongLivedAccessToken}`,
      channel: "facebook",
      //@ts-expect-error
      apiVersion: this.graphApiVersion,
    });

    return await response.json();
  }
}

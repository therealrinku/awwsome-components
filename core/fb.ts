/*
  Socials.js @2024

  FB Graph API
  - long lived access token docs: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/
  - post docs: https://developers.facebook.com/docs/pages-api/posts/
  - insight docs: https://developers.facebook.com/docs/platforminsights/page
*/

/*
  TODO: Make everything typesafe and 
  remove @ts-expect-error and @ts-ignore
*/

import { handleChannelApiCall } from "../utils/request";

export class FB {
  constructor() {}

  /**
   * Sets the fb graph api version
   * @param graphApiVersion version of graph api for eg: v18.0, v19.0
   * @default default value is v19.0
   */
  setFbGraphApiVersion(graphApiVersion: string) {
    //@ts-expect-error
    this.graphApiVersion = graphApiVersion;
  }

  /**
   * Sets the fb app id
   * @param fbAppId app id from meta developers dashboard
   */
  setFbAppId(fbAppId: string) {
    //@ts-expect-error
    this.fbAppId = fbAppId;
  }

  /**
   * Sets the fb app secret
   * @param fbAppSecret app secret from meta developers dashboard
   */
  setFbAppSecret(fbAppSecret: string) {
    //@ts-expect-error
    this.fbAppSecret = fbAppSecret;
  }

  /**
   * Create a Post
   * @param pageId id of the page
   * @param pageAccessToken  long lived access token of the page
   * @returns id of the created post
   */
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

    const resp: any = await response.json();

    if (!resp.id) {
      throw new Error("Something went wrong while publishing the post.");
    }

    return resp.id;
  }

  /**
   * Fetch latest 24 posts of the page
   * @param pageId id of the page
   * @param pageAccessToken long lived access token of the page
   * @returns 24 latest posts of the specified page
   */
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

  /**
   * Fetch user information
   * @param shortLivedAccessToken access token retrieved from fb dialog modal
   * @returns user's name and id, custom fields coming soon
   */
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

  /**
   * Fetch long lived access token of the user
   * @param shortLivedAccessToken access token retrieved from fb dialog modal
   * @returns user's long lived access token
   */
  async getUserLongLivedAccessToken(shortLivedAccessToken: string) {
    //@ts-expect-error
    const { fbAppId, fbAppSecret } = this;

    if (!fbAppId || !fbAppSecret) {
      throw new Error("fbAppId and fbAppSecret not found. Make sure to set it using setFbAppId and setFbAppSecret.");
    }

    if (!shortLivedAccessToken) {
      throw new Error("Short lived access token not provided.");
    }

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

    // @ts-expect-error
    const longLivedAccessToken = (await response.json())?.access_token;

    if (!longLivedAccessToken) {
      throw new Error("Something went wrong, please try again later");
    }

    return longLivedAccessToken;
  }

  /**
   * Fetch first page information among all the access provided pages
   * @param userLongLivedAccessToken long lived access token of the user
   * @param appScopedUserId app id from the developers meta dashboard
   * @returns first page information(id, name, long lived access tokens etc.) that it found or error if not
   */
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

    //@ts-expect-error
    if (responseJson.data?.length === 0) {
      throw new Error("You don't have any pages or you haven't provided enough permissions.");
    }

    //@ts-expect-error
    const pages = responseJson.data;
    return pages;
  }

  /**
   * Fetch analytics of the specified page, currently supported - page posts engagment
   * @param pageId page id
   * @param pageLongLivedAccessToken long lived access token of the page
   * @returns insights of page posts engagement of last 30 days
   */
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

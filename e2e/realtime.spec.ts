import { expect, test } from "@playwright/test";

import { allowExpectedStatus, clearExpectedStatuses, monitorBrowser, qaSeed, signIn } from "./helpers/gate";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chrome-desktop", "Realtime gate runs once in installed Chrome.");
});

test("real Chrome WebSockets deliver, reconnect, deduplicate, and deny nonparticipants", async ({ browser }) => {
  test.setTimeout(180_000);
  const seed = qaSeed();
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  const monitorA = monitorBrowser(pageA);
  const monitorB = monitorBrowser(pageB);
  const socketUrls: string[] = [];
  const socketFailures: string[] = [];
  for (const page of [pageA, pageB]) {
    page.on("websocket", (socket) => {
      socketUrls.push(socket.url());
      socket.on("socketerror", (error) => socketFailures.push(String(error)));
    });
  }

  const cdp = await contextA.newCDPSession(pageA);
  await cdp.send("Network.enable");
  let subprotocolPass = false;
  let handshakeStatus: number | undefined;
  cdp.on("Network.webSocketWillSendHandshakeRequest", (event) => {
    const raw = Object.entries(event.request.headers)
      .find(([key]) => key.toLowerCase() === "sec-websocket-protocol")?.[1];
    if (typeof raw === "string") {
      const protocols = raw.split(",").map((value) => value.trim());
      subprotocolPass =
        protocols.includes("realityng.websocket.v1") &&
        protocols.some((value) => value.startsWith("access_token.") && value.length > 30);
    }
  });
  cdp.on("Network.webSocketHandshakeResponseReceived", (event) => {
    handshakeStatus = event.response.status;
  });

  await signIn(pageA, "buyer");
  await signIn(pageB, "owner");
  await Promise.all([
    pageA.goto(`/dashboard/messages/${seed.thread}`, { waitUntil: "domcontentloaded" }),
    pageB.goto(`/dashboard/messages/${seed.thread}`, { waitUntil: "domcontentloaded" }),
  ]);
  try {
    await Promise.all([
      expect(pageA.getByText("Realtime: connected")).toBeVisible(),
      expect(pageB.getByText("Realtime: connected")).toBeVisible(),
    ]);
  } catch (error) {
    throw new Error(
      `WebSocket did not connect (messageAttempts=${socketUrls.filter((url) => url.includes("/ws/messages/")).length}, notificationAttempts=${socketUrls.filter((url) => url.includes("/ws/notifications/")).length}, handshake=${handshakeStatus ?? "none"}, failures=${socketFailures.slice(0, 3).join(" | ") || "none"})`,
      { cause: error },
    );
  }

  const aToB = `A to B ${Date.now()}`;
  await pageA.getByPlaceholder("Write a message...").fill(aToB);
  await pageA.getByRole("button", { name: "Send" }).click();
  await expect(pageB.getByRole("main").getByText(aToB)).toBeVisible();
  const notificationSummary = pageB.locator("details > summary").nth(1);
  await notificationSummary.click();
  await expect(pageB.getByText("New message").first()).toBeVisible();
  await notificationSummary.click();

  const bToA = `B to A ${Date.now()}`;
  await pageB.getByPlaceholder("Write a message...").fill(bToA);
  await pageB.getByRole("button", { name: "Send" }).click();
  await expect(pageA.getByRole("main").getByText(bToA)).toBeVisible();

  await contextB.setOffline(true);
  const missed = `Offline recovery ${Date.now()}`;
  await pageA.getByPlaceholder("Write a message...").fill(missed);
  await pageA.getByRole("button", { name: "Send" }).click();
  await pageB.waitForTimeout(900);
  await contextB.setOffline(false);
  await expect(pageB.getByText("Realtime: connected")).toBeVisible({ timeout: 10_000 });
  await expect(pageB.getByRole("main").getByText(missed)).toHaveCount(1);

  const afterReconnect = `After reconnect ${Date.now()}`;
  await pageA.getByPlaceholder("Write a message...").fill(afterReconnect);
  await pageA.getByRole("button", { name: "Send" }).click();
  await expect(pageB.getByRole("main").getByText(afterReconnect)).toHaveCount(1);

  expect(socketUrls.some((url) => url.includes(`/ws/messages/threads/${seed.thread}/`))).toBeTruthy();
  expect(socketUrls.every((url) => !/[?&](token|jwt|access_token)=/i.test(url))).toBeTruthy();
  expect(subprotocolPass).toBeTruthy();

  const contextC = await browser.newContext();
  const pageC = await contextC.newPage();
  allowExpectedStatus(404);
  const monitorC = monitorBrowser(pageC);
  await signIn(pageC, "nonparticipant");
  await pageC.goto(`/dashboard/messages/${seed.thread}`, { waitUntil: "domcontentloaded" });
  await pageC.waitForTimeout(1500);
  await expect(pageC.getByText("Realtime: connected")).toHaveCount(0);
  clearExpectedStatuses();
  expect(monitorC.failures.some((failure) => failure.includes("WebSocket handshake") && failure.includes("403"))).toBeTruthy();
  expect(
    monitorC.failures.every((failure) =>
      (failure.includes("WebSocket handshake") && failure.includes("403")) ||
      failure === "console.error: Failed to load resource: the server responded with a status of 404 (Not Found)" ||
      failure === "pageerror: Request failed with status code 404" ||
      failure.startsWith("http 404:"),
    ),
    `Unexpected nonparticipant browser failures: ${monitorC.failures.join(" | ")}`,
  ).toBeTruthy();

  monitorA.assertClean();
  monitorB.assertClean();
  await Promise.all([contextA.close(), contextB.close(), contextC.close()]);
});

export function logger(text: string) {
  const slack_url =
    PropertiesService.getScriptProperties().getProperty("SLACK_URL");
  if (!slack_url) {
    return;
  }
  UrlFetchApp.fetch(slack_url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      text: text,
    }),
  });
}

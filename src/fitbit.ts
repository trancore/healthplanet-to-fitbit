function fetchFitbitOauth2Token() {
  const sheet = SpreadsheetApp.openByUrl(HEALTH_MANAGEMENT_URL);
  const healthPlanetAuthSheet = sheet.getSheetByName(
    HEALTH_PLANET_AUTH_SHEET_NAME
  );

  if (healthPlanetAuthSheet === null) {
    console.error(`You don't have " ${HEALTH_PLANET_AUTH_SHEET_NAME} " sheet`);
    return;
  }

  const code = healthPlanetAuthSheet.getRange(5, 3).getValue() as string;

  try {
    const response = UrlFetchApp.fetch(`${FITBIT_DOMAIN}/oauth2/token`, {
      method: "post",
      payload: {
        code: code,
        grant_type: "authorization_code",
      } as Oauth2TokenRequestInterface,
      headers: {
        Authorization: `Basic ${FITBIT_BASIC}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      muteHttpExceptions: true,
    }).getContentText();

    return JSON.parse(response) as unknown as Oauth2TokenResponsetInterface;
  } catch (error) {
    console.error(error);
    return;
  }
}

function fetchGetWeightLogList(accessToken: string, userId: string) {
  const date = "2024-02-11";

  try {
    const response = UrlFetchApp.fetch(
      `${FITBIT_DOMAIN}/1/user/${userId}/body/log/weight/date/${date}.json`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        muteHttpExceptions: true,
      }
    ).getContentText();

    return JSON.parse(response) as unknown as Oauth2TokenResponsetInterface;
  } catch (error) {
    console.error(error);
    return;
  }
}

function fetchCreateWeightLogList(
  accessToken: string,
  userId: string,
  data: { weight: number; date: string; time: string }
) {
  try {
    const response = UrlFetchApp.fetch(
      `${FITBIT_DOMAIN}/1/user/${userId}/body/log/weight.json?weight=${data.weight}&date=${data.date}&time=${data.time}`,
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        muteHttpExceptions: true,
      }
    ).getContentText();
    console.log("🚀 ~ response:", response);

    return JSON.parse(response) as unknown as Oauth2TokenResponsetInterface;
  } catch (error) {
    console.error(error);
    return;
  }
}

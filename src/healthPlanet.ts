type HealthPlanetStatusEndpoint = "/status/innerscan";

type HealthData = {
  /**
   * 測定日付
   */
  date: string;
  /**
   * 体重
   */
  bodyWeight?: string;
  /**
   * 体脂肪率
   */
  bodyFatPercentage?: string;
  /**
   * モデル
   */
  model?: string;
};

/**
 * Health Planetの認証トークン更新日を更新する。
 * @param event 変更情報
 */
function updateUpdated(
  targetSheet: GoogleAppsScript.Spreadsheet.Sheet,
  target: { row: number; column: number }
) {
  const currentDate = new Date();
  targetSheet.getRange(target.row, target.column).setValue(currentDate);
}

/**
 * Health Planetの認可コードの有効期限が切れていないかをチェックする。
 * @returns true or false
 */
function validateHealthPlanetAuthToken() {
  const sheet = SpreadsheetApp.openByUrl(HEALTH_MANAGEMENT_URL);
  const healthPlanetAuthSheet = sheet.getSheetByName(
    HEALTH_PLANET_AUTH_SHEET_NAME
  );

  if (healthPlanetAuthSheet === null) {
    console.error(`You don't have " ${HEALTH_PLANET_AUTH_SHEET_NAME} " sheet`);
    return;
  }

  const currentDate = new Date();

  const updated = healthPlanetAuthSheet.getRange(2, 2).getValue() as Date;
  const copiedUpdateDate = new Date(updated.getTime());
  const afterTenMinuteDate = new Date(
    copiedUpdateDate.setMinutes(copiedUpdateDate.getMinutes() + 10)
  );

  if (updated < currentDate && currentDate < afterTenMinuteDate) {
    return true;
  }

  return false;
}

// リクエストトークンの取得
async function fetchOauthToken() {
  const sheet = SpreadsheetApp.openByUrl(HEALTH_MANAGEMENT_URL);
  const healthPlanetAuthSheet = sheet.getSheetByName(
    HEALTH_PLANET_AUTH_SHEET_NAME
  );

  if (healthPlanetAuthSheet === null) {
    console.error(`You don't have " ${HEALTH_PLANET_AUTH_SHEET_NAME} " sheet`);
    return;
  }

  const healthPlanetAuthorizationCode = healthPlanetAuthSheet
    .getRange(2, 2)
    .getValue() as string;

  try {
    return new Promise<OauthAuthResponseInterface>((resolve, reject) => {
      const response = UrlFetchApp.fetch(
        `${HEALTH_PLANET_DOMAIN}/oauth/token`,
        {
          method: "post",
          payload: {
            client_id: HEALTH_PLANET_CLIENT_ID,
            client_secret: HEALTH_PLANET_CLIENT_SECRET,
            redirect_uri: "https://www.healthplanet.jp/success.html ",
            code: healthPlanetAuthorizationCode,
            grant_type: "authorization_code",
          },
          muteHttpExceptions: true,
        }
      ).getContentText();

      resolve(JSON.parse(response));
    });
  } catch (error) {
    Logger.log(error);
  }
}

// リクエストトークンの取得
function fetchStatusInnerscan(accessToken: string) {
  try {
    const response = UrlFetchApp.fetch(
      `${HEALTH_PLANET_DOMAIN}/status/innerscan.json`,
      {
        method: "post",
        payload: {
          access_token: accessToken,
          date: "1",
          tag: "6021,6022",
        } as StatusInnerscanRequestInterface,
        muteHttpExceptions: true,
      }
    ).getContentText();

    return JSON.parse(response) as unknown as StatusInnerscanResponsetInterface;
  } catch (error) {
    Logger.log(error);
  }
}

// Health Planetから取得したレスポンスを変換する
function formatHealthData(response: StatusInnerscanResponsetInterface) {
  const formatedHealthData: HealthData[] = [];
  response.data.forEach((responseData) => {
    const healthDataIndex = formatedHealthData.findIndex(
      (healthData) => healthData.date === responseData.date
    );

    if (healthDataIndex < 0 && responseData.tag === "6021") {
      formatedHealthData.push({
        date: responseData.date,
        bodyWeight: responseData.keydata,
        model: responseData.model,
      });

      return;
    }

    if (healthDataIndex < 0 && responseData.tag === "6022") {
      formatedHealthData.push({
        date: responseData.date,
        bodyFatPercentage: responseData.keydata,
        model: responseData.model,
      });

      return;
    }

    if (healthDataIndex > -1 && responseData.tag === "6021") {
      formatedHealthData[healthDataIndex].bodyWeight = responseData.keydata;

      return;
    }

    if (healthDataIndex > -1 && responseData.tag === "6022") {
      formatedHealthData[healthDataIndex].bodyFatPercentage =
        responseData.keydata;

      return;
    }

    return;
  });

  return formatedHealthData;
}

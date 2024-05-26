/**
 * 任意の日付より前の日付の行を非表示にする。
 */
function hidePastAndShowFeatureRows() {
  const sheet = SpreadsheetApp.openByUrl(HEALTH_MANAGEMENT_URL).getSheetByName(
    HEALTH_MANAGEMENT_SHEET_NAME
  );

  if (sheet === null) {
    console.error(`You don't have " ${HEALTH_MANAGEMENT_URL} " sheet`);
    return;
  }

  const currentDate = new Date();
  const copiedCurrentDateOne = new Date(currentDate.getTime());
  const copiedCurrentDateTwo = new Date(currentDate.getTime());
  const beforeFiveDaysdate = copiedCurrentDateOne.setDate(
    currentDate.getDate() - 5
  );
  const afterSecondDaysdate = copiedCurrentDateTwo.setDate(
    currentDate.getDate() + 2
  );
  const dateColumn = sheet.getRange("A:A");
  const dateValues = dateColumn.getValues();

  for (var i = 1; i < dateValues.length; i++) {
    // 過去の日付の行を非表示にする
    if (
      dateValues[i][0] instanceof Date &&
      dateValues[i][0] < beforeFiveDaysdate
    ) {
      sheet.hideRows(i + 1);
    }

    // 直近の日付の行を表示する
    if (
      dateValues[i][0] instanceof Date &&
      beforeFiveDaysdate < dateValues[i][0] &&
      dateValues[i][0] < afterSecondDaysdate
    ) {
      sheet.showRows(i + 1);
    }

    // 未来の日付の行を非表示にする
    if (
      dateValues[i][0] instanceof Date &&
      afterSecondDaysdate < dateValues[i][0]
    ) {
      sheet.hideRows(i + 1);
    }
  }
}

/**
 * スプレッドシート変更時のメソッド
 * @see https://developers.google.com/apps-script/guides/triggers/events#edit
 */
function edited(event: any) {
  if (event === undefined) {
    console.error("This File isn't edited.");
    return;
  }

  const source = event.source as ReturnType<
    typeof SpreadsheetApp.getActiveSpreadsheet
  >;
  const healthPlanetAuthSheet = source.getSheetByName(
    HEALTH_PLANET_AUTH_SHEET_NAME
  );

  if (healthPlanetAuthSheet === null) {
    console.error(`You don't have " ${HEALTH_PLANET_AUTH_SHEET_NAME} " sheet`);
    return;
  }

  const editedCell = event.range;

  if (
    healthPlanetAuthSheet.getName() === HEALTH_PLANET_AUTH_SHEET_NAME &&
    editedCell.getA1Notation() === "C2"
  ) {
    updateUpdated(healthPlanetAuthSheet, { row: 2, column: 2 });
    return;
  }

  if (
    healthPlanetAuthSheet.getName() === HEALTH_PLANET_AUTH_SHEET_NAME &&
    editedCell.getA1Notation() === "C3"
  ) {
    updateUpdated(healthPlanetAuthSheet, { row: 3, column: 2 });
    return;
  }

  if (
    !(
      healthPlanetAuthSheet.getName() === HEALTH_PLANET_AUTH_SHEET_NAME &&
      editedCell.getA1Notation() === "D2" &&
      editedCell.getValue()
    )
  ) {
    return;
  }
  updateUpdated(healthPlanetAuthSheet, { row: 3, column: 2 });

  execHealthData();
}

async function run() {
  const healthData = await execHealthData();
  if (!healthData) {
    console.error("Your Health data is Undefined.");
    return;
  }

  // execFitbitData(healthData);
}

async function execHealthData() {
  const isValidatedAuthToken = validateHealthPlanetAuthToken();

  if (!isValidatedAuthToken) {
    console.error("Your Health Planet authorization token is invalid.");
    sendTokenMail();
    return;
  }

  const tokenResponse = await fetchOauthToken();
  const accessToken = tokenResponse?.access_token;

  if (!accessToken) {
    console.error("Your Health Planet access token is invalid.");
    sendTokenMail();
    return;
  }

  const innerscanResponse = fetchStatusInnerscan(accessToken);

  if (!innerscanResponse) {
    console.error("Your innerscan data failed.");
    return;
  }
  const formatedHealthData = formatHealthData(innerscanResponse);

  setHealthDataToSheet(formatedHealthData);

  return formatedHealthData;
}

// メールアドレスにメールを送る
function sendTokenMail() {
  if (!MAIL_ADDRESS) {
    console.error("you don't have MAIL_ADDRESS");
    return;
  }

  if (FITBIT_CLIENT_ID === null || FITBIT_CLIENT_SECRET === null) {
    console.error("You don't have Fitbit secret.");
    return;
  }

  GmailApp.createDraft(
    MAIL_ADDRESS,
    "token払い出し",
    `
      Health Planet, token払い出しを行なってください。
      以下のURLへアクセスしてログインし、認可コードを取得してください。
  
      ・ ${HEALTH_PLANET_DOMAIN}/oauth/auth?client_id=${HEALTH_PLANET_CLIENT_ID}&redirect_uri=https://www.healthplanet.jp/success.html&scope=innerscan&response_type=code

      fitbitの連携では、認証を行った後のURLをそのまま取得してください。

      ・ ${FITBIT_DOMAIN}/oauth2/authorize?client_id=${FITBIT_CLIENT_ID}&response_type=code&scope=weight
  
      認可コード、URLをコピペしたら、以下のスプレッドシートの該当セルに記載し、「同期チェック」をつけてください。
      https://docs.google.com/spreadsheets/d/1CZ_22-jH8Mya-yHP85ZZLHMw3_tR9TYNqfK3ce48yJo/edit#gid=282495704
      `
  ).send();
}

// 変換したデータをシートに書き込む
function setHealthDataToSheet(healthDataList: HealthData[]) {
  const sheet = SpreadsheetApp.openByUrl(HEALTH_MANAGEMENT_URL);
  const healthPlanetAuthSheet = sheet.getSheetByName(
    HEALTH_PLANET_HEALTH_DATA_SHEET_NAME
  );

  if (healthPlanetAuthSheet === null) {
    console.error(
      `You don't have " ${HEALTH_PLANET_HEALTH_DATA_SHEET_NAME} " sheet`
    );
    return;
  }

  const range = healthPlanetAuthSheet.getDataRange();
  const values = range.getValues();
  const writtenHealthData = healthDataList.filter((healthData, index) => {
    const test = !values.find(
      (value) =>
        value[1] == healthData.date &&
        value[2] == healthData.bodyWeight &&
        value[3] == healthData.bodyFatPercentage
    );
    return test;
  });
  writtenHealthData.forEach((healthData) =>
    values.push([
      values.length - 1,
      healthData.date,
      healthData.bodyWeight,
      healthData.bodyFatPercentage,
      healthData.model,
    ])
  );

  const column = range.getLastColumn();
  const row = values.length;

  healthPlanetAuthSheet.getRange(1, 1, row, column).setValues(values);
}

function execFitbitData(healthData: HealthData[]) {
  const fitbitOauth2TokenResponse = fetchFitbitOauth2Token();

  if (!fitbitOauth2TokenResponse) {
    console.error("Your Fitbit authorization token is invalid.");
    sendTokenMail();
    return;
  }

  const accessToken = fitbitOauth2TokenResponse.access_token;
  const userId = fitbitOauth2TokenResponse.user_id;

  healthData.forEach((data) => {
    if (!data.bodyWeight) {
      return;
    }

    const weightData = {
      weight: Number(data.bodyWeight),
      date: `${data.date.substring(0, 3)}-${data.date.substring(
        4,
        5
      )}-${data.date.substring(6, 7)}`,
      time: `${data.date.substring(8, 9)}:${data.date.substring(10, 11)}:00`,
    };
    fetchCreateWeightLogList(accessToken, userId, weightData);
  });
}

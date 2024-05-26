/** Health Planet認証認可用シークレット */
const HEALTH_PLANET_CLIENT_ID =
  PropertiesService.getScriptProperties().getProperty(
    "HEALTH_PLANET_CLIENT_ID"
  );
/**  */
const HEALTH_PLANET_CLIENT_SECRET =
  PropertiesService.getScriptProperties().getProperty(
    "HEALTH_PLANET_CLIENT_SECRET"
  );

/** fitbit認証認可用シークレット */
const FITBIT_CLIENT_ID =
  PropertiesService.getScriptProperties().getProperty("FITBIT_CLIENT_ID");
/**  */
const FITBIT_CLIENT_SECRET =
  PropertiesService.getScriptProperties().getProperty("FITBIT_CLIENT_SECRET");
/** コードチャレンジ */
const FITBIT_BASIC = Utilities.base64Encode(
  `${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`
);

/** Health Planet認証用サイトを送信するメードアドレス */
const MAIL_ADDRESS =
  PropertiesService.getScriptProperties().getProperty("MAIL_ADDRESS");

/** 管理しているSpreadsheet URL */
const HEALTH_MANAGEMENT_URL =
  "https://docs.google.com/spreadsheets/d/1CZ_22-jH8Mya-yHP85ZZLHMw3_tR9TYNqfK3ce48yJo/edit";

/** Spreadsheet sheet名 */
const HEALTH_MANAGEMENT_SHEET_NAME = "一覧";
const HEALTH_PLANET_AUTH_SHEET_NAME = "Health-Planet";
const HEALTH_PLANET_HEALTH_DATA_SHEET_NAME = "healthdata";

/** API */
const HEALTH_PLANET_DOMAIN = "https://www.healthplanet.jp";
const FITBIT_DOMAIN = "https://api.fitbit.com";

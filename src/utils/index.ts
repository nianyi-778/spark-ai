import CryptoJS from 'crypto-js';
import type { OptionType } from '../index';

export function getModelDomain(version: OptionType['version']) {
  let modelDomain = '';
  // 动态获取domain信息
  switch (version) {
    case '1.1':
      modelDomain = 'general';
      break;
    case '2.1':
      modelDomain = 'generalv2';
      break;
    case '3.1':
      modelDomain = 'generalv3';
      break;
    case '3.5':
      modelDomain = 'generalv3.5';
      break;
    default:
      break;
  }
  return modelDomain;
}

export function getUrl({
  version,
  apiKey,
  apiSecret,
}: {
  version: OptionType['version'];
  apiSecret: OptionType['apiSecret'];
  apiKey: OptionType['apiKey'];
}) {
  const httpUrl = new URL(`https://spark-api.xf-yun.com/v${version}/chat`);
  // const API_SECRET = 'ZDIyYjc1NTA3NDVkNzhkNjRlZmNmOWE0';
  // const API_KEY = 'abad6abee2753ad71f0eddfa7b8e2324';

  // const apiKey = API_KEY;
  // const apiSecret = API_SECRET;

  const url = `wss://${httpUrl.host}${httpUrl.pathname}`;

  const { host } = location;
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  return `${url}?authorization=${authorization}&date=${date}&host=${host}`;
}

type UUID = string;

export function generateUUID(idStyle = 'xxxxx'): UUID {
  let d = new Date().getTime();

  const uuid = idStyle.replace(/[x]/g, () => {
    const r = (d + Math.random() * 16) % 16;
    d = Math.floor(d / 16);
    return r.toString(16);
  });
  return uuid;
}

import { generateUUID, getModelDomain, getUrl } from './utils';

interface SendBody {
  uuid?: string; // 可以用来标记发送消息人身份，默认系统随机数
  content?: string;
  payload?: {
    message: {
      text: {
        role: string;
        content: string;
      }[];
    };
  };
  parameter?: {
    chat: {
      domin: string;
      temperature: number;
      max_tokens: number;
    };
  };
}
interface ResultData {
  header: {
    code: number;
    message: string;
    sid: string;
    status: number;
  };
  payload: {
    choices: {
      seq: number;
      status: number;
      text: {
        content: string;
        index: number;
        role: 'assistant';
      }[];
      question_type: 'knowledge';
    };
  };
}
export interface OptionType {
  appId: string;
  apiSecret: string;
  apiKey: string;
  sendType?: 'step' | 'all';
  version?: '1.1' | '2.1' | '3.1' | '3.5';
}

interface State extends OptionType {
  modelDomain: string;
  url: string;
}

enum Status {
  'init',
  'ttsing',
  'error',
  'close',
}

type Callback = (data: string, resultData: ResultData) => void;

export class Spark {
  option: State;

  status?: Status;

  totalRes?: string;

  ttsWS?: WebSocket | null;

  observers: Callback[];

  constructor(option: OptionType) {
    const { version = '1.1', sendType = 'step', ...rest } = option;
    this.observers = [];
    this.option = {
      ...rest,
      sendType,
      version,
      modelDomain: getModelDomain(version),
      url: getUrl(version),
    };
  }

  getOption(): State {
    return this.option;
  }

  // 修改状态
  setStatus(status: Status) {
    this.status = status;
  }

  // 查看状态
  getStatus(): Status | undefined {
    return this.status;
  }

  async start() {
    this.totalRes = ''; // 请空回答历史
    await this.connectWebSocket();
  }

  // 连接websocket
  connectWebSocket() {
    return new Promise<void>(resolve => {
      this.setStatus(Status.ttsing);
      const { url } = this.option;
      if (!url) {
        resolve();
        return;
      }
      if ('WebSocket' in window) {
        this.ttsWS = new WebSocket(url);
      } else {
        resolve();
        throw new Error('浏览器不支持WebSocket');
        return;
      }
      this.ttsWS.onopen = () => {
        resolve();
        // this.webSocketSend();
        console.info('WebSocket connection');
      };
      this.ttsWS.onmessage = e => {
        console.log(e.data);
        this.messageDataChange(e.data);
      };
      this.ttsWS.onerror = () => {
        this.ttsWS = null;
        this.setStatus(Status.error);
        console.info('WebSocket报错，请f12查看详情');
        console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`);
      };
      this.ttsWS.onclose = e => {
        console.error(e);
        this.setStatus(Status.close);
        this.ttsWS = null;
      };
    });
  }

  // 监听变化
  watchDataChange(callback: Callback) {
    this.observers.push(callback);
  }

  // 所有结束后一次性输出
  dataAllOverChange(data: string, resultData: ResultData) {
    this.observers.forEach(observer => observer(data, resultData));
  }

  // 按步更新
  dataStepChange(data: string, resultData: ResultData) {
    this.observers.forEach(observer => observer(data, resultData));
  }

  messageDataChange(resultData: string) {
    const jsonData = JSON.parse(resultData) as ResultData;
    const totalContent = jsonData.payload.choices.text.reduce(
      (allContent, value) => allContent + value.content,
      '',
    );
    if (this.option.sendType === 'step') {
      this.dataStepChange(totalContent, jsonData);
    }
    this.totalRes += totalContent;
    // 提问失败
    if (jsonData.header.code !== 0) {
      console.warn(
        `提问失败: ${jsonData.header.code}:${jsonData.header.message}`,
      );
      console.error(`${jsonData.header.code}:${jsonData.header.message}`);
      return;
    }
    if (jsonData.header.code === 0 && jsonData.header.status === 2) {
      // 请求结束
      if (this.option.sendType === 'all') {
        this.dataAllOverChange(this.totalRes as string, jsonData);
      }
      this.ttsWS?.close();
      this.setStatus(Status.init);
    }
  }

  // websocket发送数据
  async webSocketSend({
    uuid = generateUUID(),
    content,
    payload,
    parameter,
  }: SendBody) {
    await this.start();
    if (!this.ttsWS) {
      console.error('socket is not create');
      return;
    }
    const params = {
      header: {
        app_id: this.option.appId,
        uid: uuid,
      },
      parameter: parameter || {
        chat: {
          domain: this.option.modelDomain,
          temperature: 0.5,
          max_tokens: 2048,
          top_k: 4,
        },
      },
      payload: payload || {
        message: {
          text: [
            {
              role: 'user',
              content,
            },
          ],
        },
      },
    };
    this.ttsWS?.send(JSON.stringify(params));
  }
}

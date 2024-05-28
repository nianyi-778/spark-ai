# spark-ai

> 基于科大讯飞「星火大模型」WEB 版本封装

## 安装

安装步骤和依赖说明

```javascript
 npm install spark-ai
 pnpm add spark-ai
 yarn add spark-ai
```

# 使用

厂家平台配置： https://console.xfyun.cn/services/bm35

![星火开发者文档示意图](https://github.com/nianyi-778/kan-chai/assets/23355645/818aa517-c27c-4f34-8621-a26e51db91f7)

```javascript
// 代码示例
import { Spark } from 'spark-ai';

interface OptionType {
  appId: string; // 配置
  apiSecret: string; // 配置
  apiKey: string; // 配置
  version: '1.1' | '2.1' | '3.1' | '3.5'; //default: '1.1';
}
const spark = new Spark(option );
spark.start();

// 监听数据响应
spark.watchDataChange((text: string, ResultData:ResultData) => {
  // 业务处理
});

// 发送消息

/*
payload 默认配置
{
    message: {
          text: [
            {
              role: 'user',
              content,
            },
          ],
        },
}
*/

/*
parameter 默认配置

{
    chat: {
          domain: this.option.modelDomain,
          temperature: 0.5,
          max_tokens: 1024,
        },
}
*/
spark.webSocketSend(body as SendBody);

interface SendBody {
  uuid?: string; // 可以用来标记发送消息人身份，默认系统随机数
  content: string;
  payload?: {
    message: {
      text: {
        role: string,
        content: string,
      }[],
    },
  };
  parameter?: {
    chat: {
      domin: string,
      temperature: number,
      max_tokens: number,
    },
  };
}

interface ResultData {
  header: {
    code: number,
    message: string,
    sid: string,
    status: number,
  };
  payload: {
    choices: {
      seq: number,
      status: number,
      text: {
        content: string,
        index: number,
        role: 'assistant',
      }[],
      question_type: 'knowledge',
    },
  };
}
```

# 贡献

```
1. Fork该仓库
2. 创建一个新的分支 (`git checkout -b feature/awesome-feature`)
3. 提交你的修改 (`git commit -am 'Add some awesome feature'`)
4. 推送到分支 (`git push origin feature/awesome-feature`)
5. 提交一个拉取请求

```

# 联系方式

如果有任何问题或者反馈，可以通过以下方式联系作者：

邮箱：nianyi778@gmail.com

微信：nianyi778 ( 备注 spark-ai )

# 其他

## 项目背景

使用科大讯飞星火大模型 spark3.5 max 版本时，发现准备工作还是挺多的。因此萌发了封装聚合的想法.

## 参考资料

[星火认知大模型 Web API 文档](https://www.xfyun.cn/doc/spark/Web.html#_1-%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E)

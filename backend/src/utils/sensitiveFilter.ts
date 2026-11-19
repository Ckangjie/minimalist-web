import wordsData from "./sensitiveWords.json";

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  level: "block" | "suspect" | null;
  word?: string;
}

class SensitiveFilter {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode();
    this.buildTrie();
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      isEnd: false,
      level: null
    };
  }

  /**
   * 初始化将词库编译为 Trie 树
   */
  private buildTrie() {
    const blockList: string[] = wordsData.blockWords || [];
    const suspectList: string[] = wordsData.suspectWords || [];

    for (const word of blockList) {
      this.insertWord(word, "block");
    }
    for (const word of suspectList) {
      this.insertWord(word, "suspect");
    }
  }

  private insertWord(rawWord: string, level: "block" | "suspect") {
    const word = this.normalize(rawWord);
    if (!word) return;

    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createNode());
      }
      current = current.children.get(char)!;
    }
    current.isEnd = true;
    current.level = level;
    current.word = rawWord;
  }

  /**
   * 文本抗混淆预处理：
   * 1. 全角转半角
   * 2. 转小写
   * 3. 剥离空格、无意义标点与特殊干扰符号（防止「兼*职」「加-微」等绕过）
   */
  public normalize(text: string): string {
    if (!text) return "";
    return text
      // 全角转半角
      .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/\u3000/g, " ")
      // 转小写
      .toLowerCase()
      // 过滤特殊符号与空格（保留中文字符、字母、数字）
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, "");
  }

  /**
   * 扫描文本，返回命中处置策略
   */
  public scan(text: string): {
    pass: boolean;
    action: "pass" | "block" | "pending";
    matchedWords: string[];
  } {
    if (!text) {
      return { pass: true, action: "pass", matchedWords: [] };
    }

    const cleanText = this.normalize(text);
    const matchedBlocks: string[] = [];
    const matchedSuspects: string[] = [];

    const len = cleanText.length;
    for (let i = 0; i < len; i++) {
      let current = this.root;
      for (let j = i; j < len; j++) {
        const char = cleanText[j];
        if (!current.children.has(char)) {
          break;
        }
        current = current.children.get(char)!;
        if (current.isEnd && current.word) {
          if (current.level === "block") {
            matchedBlocks.push(current.word);
          } else if (current.level === "suspect") {
            matchedSuspects.push(current.word);
          }
        }
      }
    }

    if (matchedBlocks.length > 0) {
      return {
        pass: false,
        action: "block",
        matchedWords: Array.from(new Set(matchedBlocks))
      };
    }

    if (matchedSuspects.length > 0) {
      return {
        pass: true,
        action: "pending",
        matchedWords: Array.from(new Set(matchedSuspects))
      };
    }

    return {
      pass: true,
      action: "pass",
      matchedWords: []
    };
  }

  /**
   * 综合检测内容与昵称
   */
  public checkContentAndNickname(content: string, nickname?: string) {
    const contentRes = this.scan(content);
    if (contentRes.action === "block") return contentRes;

    if (nickname) {
      const nickRes = this.scan(nickname);
      if (nickRes.action === "block") return nickRes;
      if (nickRes.action === "pending") {
        return {
          pass: true,
          action: "pending" as const,
          matchedWords: Array.from(new Set([...contentRes.matchedWords, ...nickRes.matchedWords]))
        };
      }
    }

    return contentRes;
  }
}

export const sensitiveFilter = new SensitiveFilter();

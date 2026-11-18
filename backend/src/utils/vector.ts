/**
 * 文本向量化与余弦相似度检索工具
 * 基于字词 N-gram 混合向量空间模型 (Vector Space Model, VSM)
 * 能够针对中英文混合留言与昵称实现高精度向量语义检索与相关度排序
 */

// 分词与 N-gram 特征提取
export const tokenize = (text: string): string[] => {
  if (!text) return [];
  const clean = text.toLowerCase().trim();
  const tokens: string[] = [];

  // 1. 按常用标点与空白提取词元（支持英文单词、数字）
  const words = clean.split(/[\s,，.。!！?？;；:：、/\\|\[\]{}()<>《》""''“”‘’`~@#$%^&*+=\-_]+/);
  for (const w of words) {
    if (w.length > 0) {
      tokens.push(w);
    }
  }

  // 2. 中文字符单字 (Unigram)、双字 (Bigram) 与三字 (Trigram) 窗口特征
  const chars = Array.from(clean.replace(/\s+/g, ""));
  for (let i = 0; i < chars.length; i++) {
    tokens.push(chars[i]);
    if (i + 1 < chars.length) {
      tokens.push(chars[i] + chars[i + 1]);
    }
    if (i + 2 < chars.length) {
      tokens.push(chars[i] + chars[i + 1] + chars[i + 2]);
    }
  }

  return tokens;
};

// 构建词频特征向量
export const buildVector = (tokens: string[]): Map<string, number> => {
  const vec = new Map<string, number>();
  for (const t of tokens) {
    vec.set(t, (vec.get(t) ?? 0) + 1);
  }
  return vec;
};

// 计算两个向量的余弦相似度 (Cosine Similarity, 范围 0 ~ 1)
export const computeCosineSimilarity = (
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number => {
  if (vecA.size === 0 || vecB.size === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const val of vecA.values()) {
    normA += val * val;
  }
  for (const val of vecB.values()) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;

  const [small, large] = vecA.size < vecB.size ? [vecA, vecB] : [vecB, vecA];
  for (const [key, val] of small.entries()) {
    const otherVal = large.get(key);
    if (otherVal !== undefined) {
      dotProduct += val * otherVal;
    }
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * 计算查询词对目标文本的混合向量匹配得分
 * 综合考虑：精确子串匹配加权 + 向量余弦相似度
 */
export const calculateVectorScore = (query: string, targetText: string): number => {
  if (!query || !targetText) return 0;
  const qClean = query.toLowerCase().trim();
  const tClean = targetText.toLowerCase().trim();

  // 完全包含基础奖励
  let exactBonus = 0;
  if (tClean.includes(qClean)) {
    exactBonus = 1.0;
  }

  const qVec = buildVector(tokenize(qClean));
  const tVec = buildVector(tokenize(tClean));
  const similarity = computeCosineSimilarity(qVec, tVec);

  return exactBonus + similarity;
};

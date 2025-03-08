"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// 八卦汉字映射表
type Trigrams = Record<string, string>;
const trigramMap: Trigrams = {
  "111": "乾",
  "110": "兑",
  "101": "离",
  "100": "震",
  "011": "巽",
  "010": "坎",
  "001": "艮",
  "000": "坤",
};

// 反转映射表用于解密
type ReverseTrigrams = Record<string, string>;
const reverseTrigramMap: ReverseTrigrams = Object.entries(trigramMap).reduce(
  (acc: ReverseTrigrams, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {},
);

// 加密函数
function encrypt(text: string): string {
  if (!text) return "";

  // 转换为16位二进制字符串
  let binaryStr = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    binaryStr += code.toString(2).padStart(16, "0");
  }

  // 补充位数使总长度为3的倍数
  const padding = (3 - (binaryStr.length % 3)) % 3;
  binaryStr += "0".repeat(padding);

  // 生成卦象数组
  const trigrams: string[] = [];
  for (let i = 0; i < binaryStr.length; i += 3) {
    const trio = binaryStr.substr(i, 3);
    trigrams.push(trigramMap[trio] || "");
  }

  // 添加补位信息卦象
  trigrams.push(trigramMap[padding.toString(2).padStart(3, "0")]);

  return trigrams.join("");
}

// 解密函数
function decrypt(trigramStr: string): string {
  if (!trigramStr) return "";

  try {
    // 分离主卦象和补位卦象
    const paddingTrigram = trigramStr.slice(-1);
    const mainTrigrams = trigramStr.slice(0, -1);

    // 获取补位数量
    const paddingBinary = reverseTrigramMap[paddingTrigram];
    const padding = Number.parseInt(paddingBinary, 2);

    // 转换卦象为二进制
    let binaryStr = "";
    for (const trigram of mainTrigrams) {
      const binary = reverseTrigramMap[trigram];
      if (!binary) throw new Error("无效卦象");
      binaryStr += binary;
    }

    // 移除补位0
    if (padding > 0) {
      binaryStr = binaryStr.slice(0, -padding);
    }

    // 验证二进制长度
    if (binaryStr.length % 16 !== 0) {
      throw new Error("无效加密内容");
    }

    // 转换为原始文本
    let result = "";
    for (let i = 0; i < binaryStr.length; i += 16) {
      const byte = binaryStr.substr(i, 16);
      result += String.fromCharCode(Number.parseInt(byte, 2));
    }

    return result;
  } catch (e) {
    return `解密失败：无效卦象序列(${e})`;
  }
}

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [encrypted, setEncrypted] = useState<string>("");
  const [decryptText, setDecryptText] = useState<string>("");
  const [decrypted, setDecrypted] = useState<string>("");

  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-center">
          八卦解密
        </h1>
        <p className="text-muted-foreground text-center">
          使用古老的易经八卦符号进行现代加密和解密
        </p>

        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encrypt">加密</TabsTrigger>
            <TabsTrigger value="decrypt">解密</TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt">
            <Card>
              <CardHeader>
                <CardTitle>加密文本</CardTitle>
                <CardDescription>
                  输入要加密的文字，将转换为八卦符号
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入要加密的文字"
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={() => setEncrypted(encrypt(inputText))}
                  className="w-full"
                >
                  加密
                </Button>
                <div className="pt-4">
                  <h3 className="font-medium mb-2">加密结果：</h3>
                  <div className="p-4 rounded-md bg-primary/5 min-h-20 break-words text-xl font-bold text-primary">
                    {encrypted || "等待加密..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decrypt">
            <Card>
              <CardHeader>
                <CardTitle>解密文本</CardTitle>
                <CardDescription>
                  输入八卦符号序列，将解密为原始文字
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={decryptText}
                    onChange={(e) => setDecryptText(e.target.value)}
                    placeholder="输入要解密的卦象（如：乾坤坎离...）"
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={() => setDecrypted(decrypt(decryptText))}
                  className="w-full"
                  variant="secondary"
                >
                  解密
                </Button>
                <div className="pt-4">
                  <h3 className="font-medium mb-2">解密结果：</h3>
                  <div className="p-4 rounded-md bg-secondary/10 min-h-20 break-words text-lg font-medium text-secondary-foreground">
                    {decrypted || "等待解密..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>八卦对应表</CardTitle>
            <CardDescription>二进制与八卦符号的对应关系</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>二进制</TableHead>
                  <TableHead>八卦符号</TableHead>
                  <TableHead>二进制</TableHead>
                  <TableHead>八卦符号</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">111</TableCell>
                  <TableCell>乾</TableCell>
                  <TableCell className="font-mono">011</TableCell>
                  <TableCell>巽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">110</TableCell>
                  <TableCell>兑</TableCell>
                  <TableCell className="font-mono">010</TableCell>
                  <TableCell>坎</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">101</TableCell>
                  <TableCell>离</TableCell>
                  <TableCell className="font-mono">001</TableCell>
                  <TableCell>艮</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">100</TableCell>
                  <TableCell>震</TableCell>
                  <TableCell className="font-mono">000</TableCell>
                  <TableCell>坤</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

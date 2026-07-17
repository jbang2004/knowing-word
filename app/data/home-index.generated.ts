export type HomeTrackId = "words" | "split" | "honglan" | "structure";
export type HomeCandidate = { id: string; lessonId: string; hanzi: string };

export const homeCourse = {
  "title": "语文 · 五年级上册",
  "grade": 5,
  "lessons": [
    {
      "id": "g5v1-l01",
      "title": "白鹭",
      "position": 1
    },
    {
      "id": "g5v1-l02",
      "title": "落花生",
      "position": 2
    },
    {
      "id": "g5v1-l03",
      "title": "桂花雨",
      "position": 3
    },
    {
      "id": "g5v1-l04",
      "title": "珍珠鸟",
      "position": 4
    },
    {
      "id": "g5v1-l05",
      "title": "搭石",
      "position": 5
    },
    {
      "id": "g5v1-l06",
      "title": "将相和",
      "position": 6
    },
    {
      "id": "g5v1-l07",
      "title": "什么比猎豹的速度更快",
      "position": 7
    },
    {
      "id": "g5v1-l08",
      "title": "冀中的地道战",
      "position": 8
    },
    {
      "id": "g5v1-l09",
      "title": "猎人海力布",
      "position": 9
    },
    {
      "id": "g5v1-l10",
      "title": "牛郎织女（一）",
      "position": 10
    },
    {
      "id": "g5v1-l11",
      "title": "牛郎织女（二）",
      "position": 11
    },
    {
      "id": "g5v1-l12",
      "title": "古诗三首",
      "position": 12
    },
    {
      "id": "g5v1-l13",
      "title": "少年中国说（节选）",
      "position": 13
    },
    {
      "id": "g5v1-l14",
      "title": "圆明园的毁灭",
      "position": 14
    },
    {
      "id": "g5v1-l15",
      "title": "小岛",
      "position": 15
    },
    {
      "id": "g5v1-l16",
      "title": "太阳",
      "position": 16
    },
    {
      "id": "g5v1-l17",
      "title": "松鼠",
      "position": 17
    },
    {
      "id": "g5v1-l18",
      "title": "慈母情深",
      "position": 18
    },
    {
      "id": "g5v1-l19",
      "title": "父爱之舟",
      "position": 19
    },
    {
      "id": "g5v1-l20",
      "title": "“精彩极了”和“糟糕透了”",
      "position": 20
    },
    {
      "id": "g5v1-l21",
      "title": "古诗词三首",
      "position": 21
    },
    {
      "id": "g5v1-l22",
      "title": "鸟的天堂",
      "position": 22
    },
    {
      "id": "g5v1-l23",
      "title": "月迹",
      "position": 23
    },
    {
      "id": "g5v1-l24",
      "title": "古人谈读书",
      "position": 24
    },
    {
      "id": "g5v1-l25",
      "title": "忆读书",
      "position": 25
    },
    {
      "id": "g5v1-l26",
      "title": "我的“长生果”",
      "position": 26
    }
  ]
} as const;

export const homeCandidates: Record<HomeTrackId, HomeCandidate[]> = {
  "words": [
    {
      "id": "g5v1-l01-c01-u9e6d",
      "lessonId": "g5v1-l01",
      "hanzi": "鹭"
    },
    {
      "id": "g5v1-l01-c02-u5acc",
      "lessonId": "g5v1-l01",
      "hanzi": "嫌"
    },
    {
      "id": "g5v1-l01-c03-u5d4c",
      "lessonId": "g5v1-l01",
      "hanzi": "嵌"
    },
    {
      "id": "g5v1-l01-c04-u5323",
      "lessonId": "g5v1-l01",
      "hanzi": "匣"
    },
    {
      "id": "g5v1-l01-c05-u55dc",
      "lessonId": "g5v1-l01",
      "hanzi": "嗜"
    },
    {
      "id": "g5v1-l01-c06-u5b9c",
      "lessonId": "g5v1-l01",
      "hanzi": "宜"
    },
    {
      "id": "g5v1-l01-c07-u9e64",
      "lessonId": "g5v1-l01",
      "hanzi": "鹤"
    },
    {
      "id": "g5v1-l01-c08-u6731",
      "lessonId": "g5v1-l01",
      "hanzi": "朱"
    },
    {
      "id": "g5v1-l01-c09-u6846",
      "lessonId": "g5v1-l01",
      "hanzi": "框"
    },
    {
      "id": "g5v1-l01-c10-u54e8",
      "lessonId": "g5v1-l01",
      "hanzi": "哨"
    },
    {
      "id": "g5v1-l01-c11-u6069",
      "lessonId": "g5v1-l01",
      "hanzi": "恩"
    },
    {
      "id": "g5v1-l01-c12-u97f5",
      "lessonId": "g5v1-l01",
      "hanzi": "韵"
    },
    {
      "id": "g5v1-l02-c01-u4ea9",
      "lessonId": "g5v1-l02",
      "hanzi": "亩"
    },
    {
      "id": "g5v1-l02-c02-u5429",
      "lessonId": "g5v1-l02",
      "hanzi": "吩"
    },
    {
      "id": "g5v1-l02-c03-u69a8",
      "lessonId": "g5v1-l02",
      "hanzi": "榨"
    },
    {
      "id": "g5v1-l02-c04-u69b4",
      "lessonId": "g5v1-l02",
      "hanzi": "榴"
    },
    {
      "id": "g5v1-l02-c05-u77ee",
      "lessonId": "g5v1-l02",
      "hanzi": "矮"
    },
    {
      "id": "g5v1-l02-c06-u64ad",
      "lessonId": "g5v1-l02",
      "hanzi": "播"
    },
    {
      "id": "g5v1-l02-c07-u6d47",
      "lessonId": "g5v1-l02",
      "hanzi": "浇"
    },
    {
      "id": "g5v1-l02-c08-u5490",
      "lessonId": "g5v1-l02",
      "hanzi": "咐"
    },
    {
      "id": "g5v1-l02-c09-u4ead",
      "lessonId": "g5v1-l02",
      "hanzi": "亭"
    },
    {
      "id": "g5v1-l02-c10-u6155",
      "lessonId": "g5v1-l02",
      "hanzi": "慕"
    },
    {
      "id": "g5v1-l02-c11-u8c08",
      "lessonId": "g5v1-l02",
      "hanzi": "谈"
    },
    {
      "id": "g5v1-l03-c01-u7ba9",
      "lessonId": "g5v1-l03",
      "hanzi": "箩"
    },
    {
      "id": "g5v1-l03-c02-u676d",
      "lessonId": "g5v1-l03",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l03-c03-u61c2",
      "lessonId": "g5v1-l03",
      "hanzi": "懂"
    },
    {
      "id": "g5v1-l03-c04-u5170",
      "lessonId": "g5v1-l03",
      "hanzi": "兰"
    },
    {
      "id": "g5v1-l03-c05-u5a46",
      "lessonId": "g5v1-l03",
      "hanzi": "婆"
    },
    {
      "id": "g5v1-l03-c06-u7cd5",
      "lessonId": "g5v1-l03",
      "hanzi": "糕"
    },
    {
      "id": "g5v1-l03-c07-u997c",
      "lessonId": "g5v1-l03",
      "hanzi": "饼"
    },
    {
      "id": "g5v1-l03-c08-u6d78",
      "lessonId": "g5v1-l03",
      "hanzi": "浸"
    },
    {
      "id": "g5v1-l03-c09-u7f20",
      "lessonId": "g5v1-l03",
      "hanzi": "缠"
    },
    {
      "id": "g5v1-l03-c10-u8336",
      "lessonId": "g5v1-l03",
      "hanzi": "茶"
    },
    {
      "id": "g5v1-l03-c11-u6361",
      "lessonId": "g5v1-l03",
      "hanzi": "捡"
    },
    {
      "id": "g5v1-l04-c01-u8513",
      "lessonId": "g5v1-l04",
      "hanzi": "蔓"
    },
    {
      "id": "g5v1-l04-c02-u5e7d",
      "lessonId": "g5v1-l04",
      "hanzi": "幽"
    },
    {
      "id": "g5v1-l04-c03-u6089",
      "lessonId": "g5v1-l04",
      "hanzi": "悉"
    },
    {
      "id": "g5v1-l04-c04-u96cf",
      "lessonId": "g5v1-l04",
      "hanzi": "雏"
    },
    {
      "id": "g5v1-l04-c05-u54df",
      "lessonId": "g5v1-l04",
      "hanzi": "哟"
    },
    {
      "id": "g5v1-l04-c06-u67dc",
      "lessonId": "g5v1-l04",
      "hanzi": "柜"
    },
    {
      "id": "g5v1-l04-c07-u4eab",
      "lessonId": "g5v1-l04",
      "hanzi": "享"
    },
    {
      "id": "g5v1-l04-c08-u966a",
      "lessonId": "g5v1-l04",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l04-c09-u8db4",
      "lessonId": "g5v1-l04",
      "hanzi": "趴"
    },
    {
      "id": "g5v1-l04-c10-u7751",
      "lessonId": "g5v1-l04",
      "hanzi": "睑"
    },
    {
      "id": "g5v1-l04-c11-u7738",
      "lessonId": "g5v1-l04",
      "hanzi": "眸"
    },
    {
      "id": "g5v1-l04-c12-u5482",
      "lessonId": "g5v1-l04",
      "hanzi": "咂"
    },
    {
      "id": "g5v1-l05-c01-u6c5b",
      "lessonId": "g5v1-l05",
      "hanzi": "汛"
    },
    {
      "id": "g5v1-l05-c02-u633d",
      "lessonId": "g5v1-l05",
      "hanzi": "挽"
    },
    {
      "id": "g5v1-l05-c03-u95f4",
      "lessonId": "g5v1-l05",
      "hanzi": "间"
    },
    {
      "id": "g5v1-l05-c04-u60f0",
      "lessonId": "g5v1-l05",
      "hanzi": "惰"
    },
    {
      "id": "g5v1-l05-c05-u8861",
      "lessonId": "g5v1-l05",
      "hanzi": "衡"
    },
    {
      "id": "g5v1-l05-c06-u534f",
      "lessonId": "g5v1-l05",
      "hanzi": "协"
    },
    {
      "id": "g5v1-l05-c07-u7ef0",
      "lessonId": "g5v1-l05",
      "hanzi": "绰"
    },
    {
      "id": "g5v1-l05-c08-u6d2a",
      "lessonId": "g5v1-l05",
      "hanzi": "洪"
    },
    {
      "id": "g5v1-l05-c09-u8bbf",
      "lessonId": "g5v1-l05",
      "hanzi": "访"
    },
    {
      "id": "g5v1-l05-c10-u978b",
      "lessonId": "g5v1-l05",
      "hanzi": "鞋"
    },
    {
      "id": "g5v1-l05-c11-u9694",
      "lessonId": "g5v1-l05",
      "hanzi": "隔"
    },
    {
      "id": "g5v1-l05-c12-u61d2",
      "lessonId": "g5v1-l05",
      "hanzi": "懒"
    },
    {
      "id": "g5v1-l05-c13-u7a33",
      "lessonId": "g5v1-l05",
      "hanzi": "稳"
    },
    {
      "id": "g5v1-l05-c14-u514d",
      "lessonId": "g5v1-l05",
      "hanzi": "免"
    },
    {
      "id": "g5v1-l06-c01-u74a7",
      "lessonId": "g5v1-l06",
      "hanzi": "璧"
    },
    {
      "id": "g5v1-l06-c02-u81e3",
      "lessonId": "g5v1-l06",
      "hanzi": "臣"
    },
    {
      "id": "g5v1-l06-c03-u5f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "强"
    },
    {
      "id": "g5v1-l06-c04-u8bfa",
      "lessonId": "g5v1-l06",
      "hanzi": "诺"
    },
    {
      "id": "g5v1-l06-c05-u5212",
      "lessonId": "g5v1-l06",
      "hanzi": "划"
    },
    {
      "id": "g5v1-l06-c06-u5178",
      "lessonId": "g5v1-l06",
      "hanzi": "典"
    },
    {
      "id": "g5v1-l06-c07-u7f6a",
      "lessonId": "g5v1-l06",
      "hanzi": "罪"
    },
    {
      "id": "g5v1-l06-c08-u5ec9",
      "lessonId": "g5v1-l06",
      "hanzi": "廉"
    },
    {
      "id": "g5v1-l06-c09-u62b5",
      "lessonId": "g5v1-l06",
      "hanzi": "抵"
    },
    {
      "id": "g5v1-l06-c10-u5fa1",
      "lessonId": "g5v1-l06",
      "hanzi": "御"
    },
    {
      "id": "g5v1-l06-c11-u8f9e",
      "lessonId": "g5v1-l06",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l06-c12-u8fb1",
      "lessonId": "g5v1-l06",
      "hanzi": "辱"
    },
    {
      "id": "g5v1-l06-c13-u64c5",
      "lessonId": "g5v1-l06",
      "hanzi": "擅"
    },
    {
      "id": "g5v1-l06-c14-u7f36",
      "lessonId": "g5v1-l06",
      "hanzi": "缶"
    },
    {
      "id": "g5v1-l06-c15-u537f",
      "lessonId": "g5v1-l06",
      "hanzi": "卿"
    },
    {
      "id": "g5v1-l06-c16-u524a",
      "lessonId": "g5v1-l06",
      "hanzi": "削"
    },
    {
      "id": "g5v1-l06-c17-u888d",
      "lessonId": "g5v1-l06",
      "hanzi": "袍"
    },
    {
      "id": "g5v1-l06-c18-u53ec",
      "lessonId": "g5v1-l06",
      "hanzi": "召"
    },
    {
      "id": "g5v1-l06-c19-u8bae",
      "lessonId": "g5v1-l06",
      "hanzi": "议"
    },
    {
      "id": "g5v1-l06-c20-u7f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "缺"
    },
    {
      "id": "g5v1-l06-c21-u5bab",
      "lessonId": "g5v1-l06",
      "hanzi": "宫"
    },
    {
      "id": "g5v1-l06-c22-u732e",
      "lessonId": "g5v1-l06",
      "hanzi": "献"
    },
    {
      "id": "g5v1-l06-c23-u627f",
      "lessonId": "g5v1-l06",
      "hanzi": "承"
    },
    {
      "id": "g5v1-l06-c24-u6284",
      "lessonId": "g5v1-l06",
      "hanzi": "抄"
    },
    {
      "id": "g5v1-l06-c25-u602f",
      "lessonId": "g5v1-l06",
      "hanzi": "怯"
    },
    {
      "id": "g5v1-l06-c26-u62d2",
      "lessonId": "g5v1-l06",
      "hanzi": "拒"
    },
    {
      "id": "g5v1-l06-c27-u8346",
      "lessonId": "g5v1-l06",
      "hanzi": "荆"
    },
    {
      "id": "g5v1-l07-c01-u9e35",
      "lessonId": "g5v1-l07",
      "hanzi": "鸵"
    },
    {
      "id": "g5v1-l07-c02-u8d62",
      "lessonId": "g5v1-l07",
      "hanzi": "赢"
    },
    {
      "id": "g5v1-l07-c03-u51a0",
      "lessonId": "g5v1-l07",
      "hanzi": "冠"
    },
    {
      "id": "g5v1-l07-c04-u4fef",
      "lessonId": "g5v1-l07",
      "hanzi": "俯"
    },
    {
      "id": "g5v1-l07-c05-u55b7",
      "lessonId": "g5v1-l07",
      "hanzi": "喷"
    },
    {
      "id": "g5v1-l07-c06-u679a",
      "lessonId": "g5v1-l07",
      "hanzi": "枚"
    },
    {
      "id": "g5v1-l07-c07-u7bad",
      "lessonId": "g5v1-l07",
      "hanzi": "箭"
    },
    {
      "id": "g5v1-l07-c08-u6d69",
      "lessonId": "g5v1-l07",
      "hanzi": "浩"
    },
    {
      "id": "g5v1-l07-c09-u7b52",
      "lessonId": "g5v1-l07",
      "hanzi": "筒"
    },
    {
      "id": "g5v1-l07-c10-u675f",
      "lessonId": "g5v1-l07",
      "hanzi": "束"
    },
    {
      "id": "g5v1-l07-c11-u8d64",
      "lessonId": "g5v1-l07",
      "hanzi": "赤"
    },
    {
      "id": "g5v1-l07-c12-u5708",
      "lessonId": "g5v1-l07",
      "hanzi": "圈"
    },
    {
      "id": "g5v1-l07-c13-u7f6e",
      "lessonId": "g5v1-l07",
      "hanzi": "置"
    },
    {
      "id": "g5v1-l08-c01-u4fb5",
      "lessonId": "g5v1-l08",
      "hanzi": "侵"
    },
    {
      "id": "g5v1-l08-c02-u7565",
      "lessonId": "g5v1-l08",
      "hanzi": "略"
    },
    {
      "id": "g5v1-l08-c03-u5792",
      "lessonId": "g5v1-l08",
      "hanzi": "垒"
    },
    {
      "id": "g5v1-l08-c04-u4efb",
      "lessonId": "g5v1-l08",
      "hanzi": "任"
    },
    {
      "id": "g5v1-l08-c05-u4e18",
      "lessonId": "g5v1-l08",
      "hanzi": "丘"
    },
    {
      "id": "g5v1-l08-c06-u6401",
      "lessonId": "g5v1-l08",
      "hanzi": "搁"
    },
    {
      "id": "g5v1-l08-c07-u9677",
      "lessonId": "g5v1-l08",
      "hanzi": "陷"
    },
    {
      "id": "g5v1-l08-c08-u62d0",
      "lessonId": "g5v1-l08",
      "hanzi": "拐"
    },
    {
      "id": "g5v1-l08-c09-u5c94",
      "lessonId": "g5v1-l08",
      "hanzi": "岔"
    },
    {
      "id": "g5v1-l08-c10-u7b51",
      "lessonId": "g5v1-l08",
      "hanzi": "筑"
    },
    {
      "id": "g5v1-l08-c11-u5821",
      "lessonId": "g5v1-l08",
      "hanzi": "堡"
    },
    {
      "id": "g5v1-l08-c12-u515a",
      "lessonId": "g5v1-l08",
      "hanzi": "党"
    },
    {
      "id": "g5v1-l08-c13-u59a8",
      "lessonId": "g5v1-l08",
      "hanzi": "妨"
    },
    {
      "id": "g5v1-l08-c14-u853d",
      "lessonId": "g5v1-l08",
      "hanzi": "蔽"
    },
    {
      "id": "g5v1-l09-c01-u916c",
      "lessonId": "g5v1-l09",
      "hanzi": "酬"
    },
    {
      "id": "g5v1-l09-c02-u8a93",
      "lessonId": "g5v1-l09",
      "hanzi": "誓"
    },
    {
      "id": "g5v1-l09-c03-u8c0e",
      "lessonId": "g5v1-l09",
      "hanzi": "谎"
    },
    {
      "id": "g5v1-l09-c04-u727a",
      "lessonId": "g5v1-l09",
      "hanzi": "牺"
    },
    {
      "id": "g5v1-l09-c05-u73cd",
      "lessonId": "g5v1-l09",
      "hanzi": "珍"
    },
    {
      "id": "g5v1-l09-c06-u53ee",
      "lessonId": "g5v1-l09",
      "hanzi": "叮"
    },
    {
      "id": "g5v1-l09-c07-u5631",
      "lessonId": "g5v1-l09",
      "hanzi": "嘱"
    },
    {
      "id": "g5v1-l09-c08-u584c",
      "lessonId": "g5v1-l09",
      "hanzi": "塌"
    },
    {
      "id": "g5v1-l09-c09-u7126",
      "lessonId": "g5v1-l09",
      "hanzi": "焦"
    },
    {
      "id": "g5v1-l09-c10-u5ef6",
      "lessonId": "g5v1-l09",
      "hanzi": "延"
    },
    {
      "id": "g5v1-l09-c11-u707e",
      "lessonId": "g5v1-l09",
      "hanzi": "灾"
    },
    {
      "id": "g5v1-l09-c12-u6094",
      "lessonId": "g5v1-l09",
      "hanzi": "悔"
    },
    {
      "id": "g5v1-l09-c13-u6276",
      "lessonId": "g5v1-l09",
      "hanzi": "扶"
    },
    {
      "id": "g5v1-l10-c01-u5ac2",
      "lessonId": "g5v1-l10",
      "hanzi": "嫂"
    },
    {
      "id": "g5v1-l10-c02-u6073",
      "lessonId": "g5v1-l10",
      "hanzi": "恳"
    },
    {
      "id": "g5v1-l10-c03-u7b5b",
      "lessonId": "g5v1-l10",
      "hanzi": "筛"
    },
    {
      "id": "g5v1-l10-c04-u6b79",
      "lessonId": "g5v1-l10",
      "hanzi": "歹"
    },
    {
      "id": "g5v1-l10-c05-u7f55",
      "lessonId": "g5v1-l10",
      "hanzi": "罕"
    },
    {
      "id": "g5v1-l10-c06-u68ad",
      "lessonId": "g5v1-l10",
      "hanzi": "梭"
    },
    {
      "id": "g5v1-l10-c07-u76d1",
      "lessonId": "g5v1-l10",
      "hanzi": "监"
    },
    {
      "id": "g5v1-l10-c08-u72f1",
      "lessonId": "g5v1-l10",
      "hanzi": "狱"
    },
    {
      "id": "g5v1-l10-c09-u917f",
      "lessonId": "g5v1-l10",
      "hanzi": "酿"
    },
    {
      "id": "g5v1-l10-c10-u778c",
      "lessonId": "g5v1-l10",
      "hanzi": "瞌"
    },
    {
      "id": "g5v1-l10-c11-u843d",
      "lessonId": "g5v1-l10",
      "hanzi": "落"
    },
    {
      "id": "g5v1-l10-c12-u5a5a",
      "lessonId": "g5v1-l10",
      "hanzi": "婚"
    },
    {
      "id": "g5v1-l10-c13-u90ce",
      "lessonId": "g5v1-l10",
      "hanzi": "郎"
    },
    {
      "id": "g5v1-l10-c14-u7239",
      "lessonId": "g5v1-l10",
      "hanzi": "爹"
    },
    {
      "id": "g5v1-l10-c15-u8f86",
      "lessonId": "g5v1-l10",
      "hanzi": "辆"
    },
    {
      "id": "g5v1-l10-c16-u7eb1",
      "lessonId": "g5v1-l10",
      "hanzi": "纱"
    },
    {
      "id": "g5v1-l10-c17-u59bb",
      "lessonId": "g5v1-l10",
      "hanzi": "妻"
    },
    {
      "id": "g5v1-l10-c18-u8d9f",
      "lessonId": "g5v1-l10",
      "hanzi": "趟"
    },
    {
      "id": "g5v1-l10-c19-u6258",
      "lessonId": "g5v1-l10",
      "hanzi": "托"
    },
    {
      "id": "g5v1-l10-c20-u6e9c",
      "lessonId": "g5v1-l10",
      "hanzi": "溜"
    },
    {
      "id": "g5v1-l10-c21-u8f88",
      "lessonId": "g5v1-l10",
      "hanzi": "辈"
    },
    {
      "id": "g5v1-l10-c22-u6328",
      "lessonId": "g5v1-l10",
      "hanzi": "挨"
    },
    {
      "id": "g5v1-l11-c01-u4fed",
      "lessonId": "g5v1-l11",
      "hanzi": "俭"
    },
    {
      "id": "g5v1-l11-c02-u7687",
      "lessonId": "g5v1-l11",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l11-c03-u504e",
      "lessonId": "g5v1-l11",
      "hanzi": "偎"
    },
    {
      "id": "g5v1-l11-c04-u8870",
      "lessonId": "g5v1-l11",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l11-c05-u73ca",
      "lessonId": "g5v1-l11",
      "hanzi": "珊"
    },
    {
      "id": "g5v1-l11-c06-u745a",
      "lessonId": "g5v1-l11",
      "hanzi": "瑚"
    },
    {
      "id": "g5v1-l11-c07-u7901",
      "lessonId": "g5v1-l11",
      "hanzi": "礁"
    },
    {
      "id": "g5v1-l11-c08-u7b50",
      "lessonId": "g5v1-l11",
      "hanzi": "筐"
    },
    {
      "id": "g5v1-l11-c09-u62d7",
      "lessonId": "g5v1-l11",
      "hanzi": "拗"
    },
    {
      "id": "g5v1-l12-c01-u4e43",
      "lessonId": "g5v1-l12",
      "hanzi": "乃"
    },
    {
      "id": "g5v1-l12-c02-u718f",
      "lessonId": "g5v1-l12",
      "hanzi": "熏"
    },
    {
      "id": "g5v1-l12-c03-u4ea5",
      "lessonId": "g5v1-l12",
      "hanzi": "亥"
    },
    {
      "id": "g5v1-l12-c04-u6043",
      "lessonId": "g5v1-l12",
      "hanzi": "恃"
    },
    {
      "id": "g5v1-l12-c05-u64de",
      "lessonId": "g5v1-l12",
      "hanzi": "擞"
    },
    {
      "id": "g5v1-l12-c06-u796d",
      "lessonId": "g5v1-l12",
      "hanzi": "祭"
    },
    {
      "id": "g5v1-l12-c07-u676d",
      "lessonId": "g5v1-l12",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l12-c08-u54c0",
      "lessonId": "g5v1-l12",
      "hanzi": "哀"
    },
    {
      "id": "g5v1-l12-c09-u62d8",
      "lessonId": "g5v1-l12",
      "hanzi": "拘"
    },
    {
      "id": "g5v1-l13-c01-u6cfb",
      "lessonId": "g5v1-l13",
      "hanzi": "泻"
    },
    {
      "id": "g5v1-l13-c02-u9cde",
      "lessonId": "g5v1-l13",
      "hanzi": "鳞"
    },
    {
      "id": "g5v1-l13-c03-u60f6",
      "lessonId": "g5v1-l13",
      "hanzi": "惶"
    },
    {
      "id": "g5v1-l13-c04-u80ce",
      "lessonId": "g5v1-l13",
      "hanzi": "胎"
    },
    {
      "id": "g5v1-l13-c05-u5c65",
      "lessonId": "g5v1-l13",
      "hanzi": "履"
    },
    {
      "id": "g5v1-l13-c06-u54c9",
      "lessonId": "g5v1-l13",
      "hanzi": "哉"
    },
    {
      "id": "g5v1-l13-c07-u6f5c",
      "lessonId": "g5v1-l13",
      "hanzi": "潜"
    },
    {
      "id": "g5v1-l13-c08-u8bd5",
      "lessonId": "g5v1-l13",
      "hanzi": "试"
    },
    {
      "id": "g5v1-l13-c09-u7687",
      "lessonId": "g5v1-l13",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l13-c10-u7eb5",
      "lessonId": "g5v1-l13",
      "hanzi": "纵"
    },
    {
      "id": "g5v1-l13-c11-u7586",
      "lessonId": "g5v1-l13",
      "hanzi": "疆"
    },
    {
      "id": "g5v1-l14-c01-u4f30",
      "lessonId": "g5v1-l14",
      "hanzi": "估"
    },
    {
      "id": "g5v1-l14-c02-u714c",
      "lessonId": "g5v1-l14",
      "hanzi": "煌"
    },
    {
      "id": "g5v1-l14-c03-u73d1",
      "lessonId": "g5v1-l14",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l14-c04-u5254",
      "lessonId": "g5v1-l14",
      "hanzi": "剔"
    },
    {
      "id": "g5v1-l14-c05-u6f9c",
      "lessonId": "g5v1-l14",
      "hanzi": "澜"
    },
    {
      "id": "g5v1-l14-c06-u7476",
      "lessonId": "g5v1-l14",
      "hanzi": "瑶"
    },
    {
      "id": "g5v1-l14-c07-u9675",
      "lessonId": "g5v1-l14",
      "hanzi": "陵"
    },
    {
      "id": "g5v1-l14-c08-u5b8f",
      "lessonId": "g5v1-l14",
      "hanzi": "宏"
    },
    {
      "id": "g5v1-l14-c09-u5949",
      "lessonId": "g5v1-l14",
      "hanzi": "奉"
    },
    {
      "id": "g5v1-l14-c10-u70ec",
      "lessonId": "g5v1-l14",
      "hanzi": "烬"
    },
    {
      "id": "g5v1-l14-c11-u6bc1",
      "lessonId": "g5v1-l14",
      "hanzi": "毁"
    },
    {
      "id": "g5v1-l14-c12-u635f",
      "lessonId": "g5v1-l14",
      "hanzi": "损"
    },
    {
      "id": "g5v1-l14-c13-u62f1",
      "lessonId": "g5v1-l14",
      "hanzi": "拱"
    },
    {
      "id": "g5v1-l14-c14-u8f89",
      "lessonId": "g5v1-l14",
      "hanzi": "辉"
    },
    {
      "id": "g5v1-l14-c15-u6bbf",
      "lessonId": "g5v1-l14",
      "hanzi": "殿"
    },
    {
      "id": "g5v1-l14-c16-u89c8",
      "lessonId": "g5v1-l14",
      "hanzi": "览"
    },
    {
      "id": "g5v1-l14-c17-u5883",
      "lessonId": "g5v1-l14",
      "hanzi": "境"
    },
    {
      "id": "g5v1-l14-c18-u5510",
      "lessonId": "g5v1-l14",
      "hanzi": "唐"
    },
    {
      "id": "g5v1-l14-c19-u95ef",
      "lessonId": "g5v1-l14",
      "hanzi": "闯"
    },
    {
      "id": "g5v1-l14-c20-u9500",
      "lessonId": "g5v1-l14",
      "hanzi": "销"
    },
    {
      "id": "g5v1-l15-c01-u7792",
      "lessonId": "g5v1-l15",
      "hanzi": "瞒"
    },
    {
      "id": "g5v1-l15-c02-u57df",
      "lessonId": "g5v1-l15",
      "hanzi": "域"
    },
    {
      "id": "g5v1-l15-c03-u8247",
      "lessonId": "g5v1-l15",
      "hanzi": "艇"
    },
    {
      "id": "g5v1-l15-c04-u77db",
      "lessonId": "g5v1-l15",
      "hanzi": "矛"
    },
    {
      "id": "g5v1-l15-c05-u76fe",
      "lessonId": "g5v1-l15",
      "hanzi": "盾"
    },
    {
      "id": "g5v1-l15-c06-u7b77",
      "lessonId": "g5v1-l15",
      "hanzi": "筷"
    },
    {
      "id": "g5v1-l15-c07-u708a",
      "lessonId": "g5v1-l15",
      "hanzi": "炊"
    },
    {
      "id": "g5v1-l15-c08-u54fc",
      "lessonId": "g5v1-l15",
      "hanzi": "哼"
    },
    {
      "id": "g5v1-l15-c09-u5589",
      "lessonId": "g5v1-l15",
      "hanzi": "喉"
    },
    {
      "id": "g5v1-l15-c10-u5499",
      "lessonId": "g5v1-l15",
      "hanzi": "咙"
    },
    {
      "id": "g5v1-l15-c11-u54fd",
      "lessonId": "g5v1-l15",
      "hanzi": "哽"
    },
    {
      "id": "g5v1-l15-c12-u52fa",
      "lessonId": "g5v1-l15",
      "hanzi": "勺"
    },
    {
      "id": "g5v1-l15-c13-u6405",
      "lessonId": "g5v1-l15",
      "hanzi": "搅"
    },
    {
      "id": "g5v1-l15-c14-u8200",
      "lessonId": "g5v1-l15",
      "hanzi": "舀"
    },
    {
      "id": "g5v1-l16-c01-u6444",
      "lessonId": "g5v1-l16",
      "hanzi": "摄"
    },
    {
      "id": "g5v1-l16-c02-u6b96",
      "lessonId": "g5v1-l16",
      "hanzi": "殖"
    },
    {
      "id": "g5v1-l16-c03-u70ad",
      "lessonId": "g5v1-l16",
      "hanzi": "炭"
    },
    {
      "id": "g5v1-l16-c04-u7597",
      "lessonId": "g5v1-l16",
      "hanzi": "疗"
    },
    {
      "id": "g5v1-l16-c05-u6c0f",
      "lessonId": "g5v1-l16",
      "hanzi": "氏"
    },
    {
      "id": "g5v1-l16-c06-u7cae",
      "lessonId": "g5v1-l16",
      "hanzi": "粮"
    },
    {
      "id": "g5v1-l16-c07-u533a",
      "lessonId": "g5v1-l16",
      "hanzi": "区"
    },
    {
      "id": "g5v1-l16-c08-u6740",
      "lessonId": "g5v1-l16",
      "hanzi": "杀"
    },
    {
      "id": "g5v1-l16-c09-u83cc",
      "lessonId": "g5v1-l16",
      "hanzi": "菌"
    },
    {
      "id": "g5v1-l17-c01-u9a6f",
      "lessonId": "g5v1-l17",
      "hanzi": "驯"
    },
    {
      "id": "g5v1-l17-c02-u77eb",
      "lessonId": "g5v1-l17",
      "hanzi": "矫"
    },
    {
      "id": "g5v1-l17-c03-u6b47",
      "lessonId": "g5v1-l17",
      "hanzi": "歇"
    },
    {
      "id": "g5v1-l17-c04-u6748",
      "lessonId": "g5v1-l17",
      "hanzi": "杈"
    },
    {
      "id": "g5v1-l17-c05-u85d3",
      "lessonId": "g5v1-l17",
      "hanzi": "藓"
    },
    {
      "id": "g5v1-l17-c06-u72ed",
      "lessonId": "g5v1-l17",
      "hanzi": "狭"
    },
    {
      "id": "g5v1-l17-c07-u52c9",
      "lessonId": "g5v1-l17",
      "hanzi": "勉"
    },
    {
      "id": "g5v1-l17-c08-u9525",
      "lessonId": "g5v1-l17",
      "hanzi": "锥"
    },
    {
      "id": "g5v1-l17-c09-u9f20",
      "lessonId": "g5v1-l17",
      "hanzi": "鼠"
    },
    {
      "id": "g5v1-l17-c10-u79c0",
      "lessonId": "g5v1-l17",
      "hanzi": "秀"
    },
    {
      "id": "g5v1-l17-c11-u73b2",
      "lessonId": "g5v1-l17",
      "hanzi": "玲"
    },
    {
      "id": "g5v1-l17-c12-u73d1",
      "lessonId": "g5v1-l17",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l17-c13-u5e3d",
      "lessonId": "g5v1-l17",
      "hanzi": "帽"
    },
    {
      "id": "g5v1-l17-c14-u5c3e",
      "lessonId": "g5v1-l17",
      "hanzi": "尾"
    },
    {
      "id": "g5v1-l17-c15-u7a9d",
      "lessonId": "g5v1-l17",
      "hanzi": "窝"
    },
    {
      "id": "g5v1-l17-c16-u6ed1",
      "lessonId": "g5v1-l17",
      "hanzi": "滑"
    },
    {
      "id": "g5v1-l17-c17-u62fe",
      "lessonId": "g5v1-l17",
      "hanzi": "拾"
    },
    {
      "id": "g5v1-l17-c18-u68b3",
      "lessonId": "g5v1-l17",
      "hanzi": "梳"
    },
    {
      "id": "g5v1-l18-c01-u9b44",
      "lessonId": "g5v1-l18",
      "hanzi": "魄"
    },
    {
      "id": "g5v1-l18-c02-u6291",
      "lessonId": "g5v1-l18",
      "hanzi": "抑"
    },
    {
      "id": "g5v1-l18-c03-u9893",
      "lessonId": "g5v1-l18",
      "hanzi": "颓"
    },
    {
      "id": "g5v1-l18-c04-u7eab",
      "lessonId": "g5v1-l18",
      "hanzi": "纫"
    },
    {
      "id": "g5v1-l18-c05-u566a",
      "lessonId": "g5v1-l18",
      "hanzi": "噪"
    },
    {
      "id": "g5v1-l18-c06-u8910",
      "lessonId": "g5v1-l18",
      "hanzi": "褐"
    },
    {
      "id": "g5v1-l18-c07-u60eb",
      "lessonId": "g5v1-l18",
      "hanzi": "惫"
    },
    {
      "id": "g5v1-l18-c08-u803d",
      "lessonId": "g5v1-l18",
      "hanzi": "耽"
    },
    {
      "id": "g5v1-l18-c09-u515c",
      "lessonId": "g5v1-l18",
      "hanzi": "兜"
    },
    {
      "id": "g5v1-l18-c10-u6743",
      "lessonId": "g5v1-l18",
      "hanzi": "权"
    },
    {
      "id": "g5v1-l18-c11-u8f9e",
      "lessonId": "g5v1-l18",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l18-c12-u788c",
      "lessonId": "g5v1-l18",
      "hanzi": "碌"
    },
    {
      "id": "g5v1-l18-c13-u540a",
      "lessonId": "g5v1-l18",
      "hanzi": "吊"
    },
    {
      "id": "g5v1-l18-c14-u9177",
      "lessonId": "g5v1-l18",
      "hanzi": "酷"
    },
    {
      "id": "g5v1-l18-c15-u6691",
      "lessonId": "g5v1-l18",
      "hanzi": "暑"
    },
    {
      "id": "g5v1-l18-c16-u810a",
      "lessonId": "g5v1-l18",
      "hanzi": "脊"
    },
    {
      "id": "g5v1-l18-c17-u7f69",
      "lessonId": "g5v1-l18",
      "hanzi": "罩"
    },
    {
      "id": "g5v1-l18-c18-u7adf",
      "lessonId": "g5v1-l18",
      "hanzi": "竟"
    },
    {
      "id": "g5v1-l18-c19-u54c7",
      "lessonId": "g5v1-l18",
      "hanzi": "哇"
    },
    {
      "id": "g5v1-l18-c20-u5fcd",
      "lessonId": "g5v1-l18",
      "hanzi": "忍"
    },
    {
      "id": "g5v1-l18-c21-u68b0",
      "lessonId": "g5v1-l18",
      "hanzi": "械"
    },
    {
      "id": "g5v1-l18-c22-u9178",
      "lessonId": "g5v1-l18",
      "hanzi": "酸"
    },
    {
      "id": "g5v1-l19-c01-u8327",
      "lessonId": "g5v1-l19",
      "hanzi": "茧"
    },
    {
      "id": "g5v1-l19-c02-u6808",
      "lessonId": "g5v1-l19",
      "hanzi": "栈"
    },
    {
      "id": "g5v1-l19-c03-u51a4",
      "lessonId": "g5v1-l19",
      "hanzi": "冤"
    },
    {
      "id": "g5v1-l19-c04-u6789",
      "lessonId": "g5v1-l19",
      "hanzi": "枉"
    },
    {
      "id": "g5v1-l19-c05-u604d",
      "lessonId": "g5v1-l19",
      "hanzi": "恍"
    },
    {
      "id": "g5v1-l19-c06-u60da",
      "lessonId": "g5v1-l19",
      "hanzi": "惚"
    },
    {
      "id": "g5v1-l19-c07-u8df7",
      "lessonId": "g5v1-l19",
      "hanzi": "跷"
    },
    {
      "id": "g5v1-l19-c08-u50fb",
      "lessonId": "g5v1-l19",
      "hanzi": "僻"
    },
    {
      "id": "g5v1-l19-c09-u59d4",
      "lessonId": "g5v1-l19",
      "hanzi": "委"
    },
    {
      "id": "g5v1-l19-c10-u8fea",
      "lessonId": "g5v1-l19",
      "hanzi": "迪"
    },
    {
      "id": "g5v1-l19-c11-u5ac1",
      "lessonId": "g5v1-l19",
      "hanzi": "嫁"
    },
    {
      "id": "g5v1-l19-c12-u7f34",
      "lessonId": "g5v1-l19",
      "hanzi": "缴"
    },
    {
      "id": "g5v1-l19-c13-u699c",
      "lessonId": "g5v1-l19",
      "hanzi": "榜"
    },
    {
      "id": "g5v1-l19-c14-u517c",
      "lessonId": "g5v1-l19",
      "hanzi": "兼"
    },
    {
      "id": "g5v1-l19-c15-u5632",
      "lessonId": "g5v1-l19",
      "hanzi": "嘲"
    },
    {
      "id": "g5v1-l19-c16-u6795",
      "lessonId": "g5v1-l19",
      "hanzi": "枕"
    },
    {
      "id": "g5v1-l19-c17-u8695",
      "lessonId": "g5v1-l19",
      "hanzi": "蚕"
    },
    {
      "id": "g5v1-l19-c18-u8003",
      "lessonId": "g5v1-l19",
      "hanzi": "考"
    },
    {
      "id": "g5v1-l19-c19-u75bc",
      "lessonId": "g5v1-l19",
      "hanzi": "疼"
    },
    {
      "id": "g5v1-l19-c20-u5e2d",
      "lessonId": "g5v1-l19",
      "hanzi": "席"
    },
    {
      "id": "g5v1-l19-c21-u7cd6",
      "lessonId": "g5v1-l19",
      "hanzi": "糖"
    },
    {
      "id": "g5v1-l19-c22-u5c51",
      "lessonId": "g5v1-l19",
      "hanzi": "屑"
    },
    {
      "id": "g5v1-l19-c23-u9489",
      "lessonId": "g5v1-l19",
      "hanzi": "钉"
    },
    {
      "id": "g5v1-l19-c24-u966a",
      "lessonId": "g5v1-l19",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l19-c25-u6bd5",
      "lessonId": "g5v1-l19",
      "hanzi": "毕"
    },
    {
      "id": "g5v1-l19-c26-u716e",
      "lessonId": "g5v1-l19",
      "hanzi": "煮"
    },
    {
      "id": "g5v1-l20-c01-u817c",
      "lessonId": "g5v1-l20",
      "hanzi": "腼"
    },
    {
      "id": "g5v1-l20-c02-u8146",
      "lessonId": "g5v1-l20",
      "hanzi": "腆"
    },
    {
      "id": "g5v1-l20-c03-u8a8a",
      "lessonId": "g5v1-l20",
      "hanzi": "誊"
    },
    {
      "id": "g5v1-l20-c04-u52b1",
      "lessonId": "g5v1-l20",
      "hanzi": "励"
    },
    {
      "id": "g5v1-l20-c05-u7248",
      "lessonId": "g5v1-l20",
      "hanzi": "版"
    },
    {
      "id": "g5v1-l20-c06-u7965",
      "lessonId": "g5v1-l20",
      "hanzi": "祥"
    },
    {
      "id": "g5v1-l20-c07-u6b67",
      "lessonId": "g5v1-l20",
      "hanzi": "歧"
    },
    {
      "id": "g5v1-l20-c08-u8c28",
      "lessonId": "g5v1-l20",
      "hanzi": "谨"
    },
    {
      "id": "g5v1-l21-c01-u6986",
      "lessonId": "g5v1-l21",
      "hanzi": "榆"
    },
    {
      "id": "g5v1-l21-c02-u7554",
      "lessonId": "g5v1-l21",
      "hanzi": "畔"
    },
    {
      "id": "g5v1-l21-c03-u66f4",
      "lessonId": "g5v1-l21",
      "hanzi": "更"
    },
    {
      "id": "g5v1-l21-c04-u8052",
      "lessonId": "g5v1-l21",
      "hanzi": "聒"
    },
    {
      "id": "g5v1-l21-c05-u5b59",
      "lessonId": "g5v1-l21",
      "hanzi": "孙"
    },
    {
      "id": "g5v1-l21-c06-u6cca",
      "lessonId": "g5v1-l21",
      "hanzi": "泊"
    },
    {
      "id": "g5v1-l21-c07-u6101",
      "lessonId": "g5v1-l21",
      "hanzi": "愁"
    },
    {
      "id": "g5v1-l21-c08-u5bfa",
      "lessonId": "g5v1-l21",
      "hanzi": "寺"
    },
    {
      "id": "g5v1-l22-c01-u6868",
      "lessonId": "g5v1-l22",
      "hanzi": "桨"
    },
    {
      "id": "g5v1-l22-c02-u6869",
      "lessonId": "g5v1-l22",
      "hanzi": "桩"
    },
    {
      "id": "g5v1-l22-c03-u6687",
      "lessonId": "g5v1-l22",
      "hanzi": "暇"
    },
    {
      "id": "g5v1-l22-c04-u6995",
      "lessonId": "g5v1-l22",
      "hanzi": "榕"
    },
    {
      "id": "g5v1-l22-c05-u7ea0",
      "lessonId": "g5v1-l22",
      "hanzi": "纠"
    },
    {
      "id": "g5v1-l22-c06-u8000",
      "lessonId": "g5v1-l22",
      "hanzi": "耀"
    },
    {
      "id": "g5v1-l22-c07-u6da8",
      "lessonId": "g5v1-l22",
      "hanzi": "涨"
    },
    {
      "id": "g5v1-l22-c08-u5854",
      "lessonId": "g5v1-l22",
      "hanzi": "塔"
    },
    {
      "id": "g5v1-l22-c09-u68a2",
      "lessonId": "g5v1-l22",
      "hanzi": "梢"
    },
    {
      "id": "g5v1-l22-c10-u7709",
      "lessonId": "g5v1-l22",
      "hanzi": "眉"
    },
    {
      "id": "g5v1-l22-c11-u629b",
      "lessonId": "g5v1-l22",
      "hanzi": "抛"
    },
    {
      "id": "g5v1-l23-c01-u6084",
      "lessonId": "g5v1-l23",
      "hanzi": "悄"
    },
    {
      "id": "g5v1-l23-c02-u7d2f",
      "lessonId": "g5v1-l23",
      "hanzi": "累"
    },
    {
      "id": "g5v1-l23-c03-u5ae6",
      "lessonId": "g5v1-l23",
      "hanzi": "嫦"
    },
    {
      "id": "g5v1-l23-c04-u5a25",
      "lessonId": "g5v1-l23",
      "hanzi": "娥"
    },
    {
      "id": "g5v1-l23-c05-u5ac9",
      "lessonId": "g5v1-l23",
      "hanzi": "嫉"
    },
    {
      "id": "g5v1-l23-c06-u5992",
      "lessonId": "g5v1-l23",
      "hanzi": "妒"
    },
    {
      "id": "g5v1-l23-c07-u74f7",
      "lessonId": "g5v1-l23",
      "hanzi": "瓷"
    },
    {
      "id": "g5v1-l24-c01-u803b",
      "lessonId": "g5v1-l24",
      "hanzi": "耻"
    },
    {
      "id": "g5v1-l24-c02-u8bc6",
      "lessonId": "g5v1-l24",
      "hanzi": "识"
    },
    {
      "id": "g5v1-l24-c03-u5bdd",
      "lessonId": "g5v1-l24",
      "hanzi": "寝"
    },
    {
      "id": "g5v1-l24-c04-u77e3",
      "lessonId": "g5v1-l24",
      "hanzi": "矣"
    },
    {
      "id": "g5v1-l24-c05-u5c82",
      "lessonId": "g5v1-l24",
      "hanzi": "岂"
    },
    {
      "id": "g5v1-l24-c06-u8bf2",
      "lessonId": "g5v1-l24",
      "hanzi": "诲"
    },
    {
      "id": "g5v1-l24-c07-u8c13",
      "lessonId": "g5v1-l24",
      "hanzi": "谓"
    },
    {
      "id": "g5v1-l24-c08-u8bf5",
      "lessonId": "g5v1-l24",
      "hanzi": "诵"
    },
    {
      "id": "g5v1-l25-c01-u8205",
      "lessonId": "g5v1-l25",
      "hanzi": "舅"
    },
    {
      "id": "g5v1-l25-c02-u5bb4",
      "lessonId": "g5v1-l25",
      "hanzi": "宴"
    },
    {
      "id": "g5v1-l25-c03-u65a9",
      "lessonId": "g5v1-l25",
      "hanzi": "斩"
    },
    {
      "id": "g5v1-l25-c04-u51ef",
      "lessonId": "g5v1-l25",
      "hanzi": "凯"
    },
    {
      "id": "g5v1-l25-c05-u845b",
      "lessonId": "g5v1-l25",
      "hanzi": "葛"
    },
    {
      "id": "g5v1-l25-c06-u8ff0",
      "lessonId": "g5v1-l25",
      "hanzi": "述"
    },
    {
      "id": "g5v1-l25-c07-u4f20",
      "lessonId": "g5v1-l25",
      "hanzi": "传"
    },
    {
      "id": "g5v1-l25-c08-u9c81",
      "lessonId": "g5v1-l25",
      "hanzi": "鲁"
    },
    {
      "id": "g5v1-l25-c09-u715e",
      "lessonId": "g5v1-l25",
      "hanzi": "煞"
    },
    {
      "id": "g5v1-l25-c10-u5bc7",
      "lessonId": "g5v1-l25",
      "hanzi": "寇"
    },
    {
      "id": "g5v1-l25-c11-u8d3e",
      "lessonId": "g5v1-l25",
      "hanzi": "贾"
    },
    {
      "id": "g5v1-l25-c12-u5377",
      "lessonId": "g5v1-l25",
      "hanzi": "卷"
    },
    {
      "id": "g5v1-l25-c13-u520a",
      "lessonId": "g5v1-l25",
      "hanzi": "刊"
    },
    {
      "id": "g5v1-l25-c14-u7410",
      "lessonId": "g5v1-l25",
      "hanzi": "琐"
    },
    {
      "id": "g5v1-l25-c15-u547b",
      "lessonId": "g5v1-l25",
      "hanzi": "呻"
    },
    {
      "id": "g5v1-l25-c16-u67d0",
      "lessonId": "g5v1-l25",
      "hanzi": "某"
    },
    {
      "id": "g5v1-l25-c17-u6d25",
      "lessonId": "g5v1-l25",
      "hanzi": "津"
    },
    {
      "id": "g5v1-l25-c18-u9650",
      "lessonId": "g5v1-l25",
      "hanzi": "限"
    },
    {
      "id": "g5v1-l25-c19-u8870",
      "lessonId": "g5v1-l25",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l25-c20-u7edf",
      "lessonId": "g5v1-l25",
      "hanzi": "统"
    },
    {
      "id": "g5v1-l25-c21-u6734",
      "lessonId": "g5v1-l25",
      "hanzi": "朴"
    },
    {
      "id": "g5v1-l26-c01-u55bb",
      "lessonId": "g5v1-l26",
      "hanzi": "喻"
    },
    {
      "id": "g5v1-l26-c02-u5dee",
      "lessonId": "g5v1-l26",
      "hanzi": "差"
    },
    {
      "id": "g5v1-l26-c03-u763e",
      "lessonId": "g5v1-l26",
      "hanzi": "瘾"
    },
    {
      "id": "g5v1-l26-c04-u5954",
      "lessonId": "g5v1-l26",
      "hanzi": "奔"
    },
    {
      "id": "g5v1-l26-c05-u7c4d",
      "lessonId": "g5v1-l26",
      "hanzi": "籍"
    },
    {
      "id": "g5v1-l26-c06-u9965",
      "lessonId": "g5v1-l26",
      "hanzi": "饥"
    },
    {
      "id": "g5v1-l26-c07-u507f",
      "lessonId": "g5v1-l26",
      "hanzi": "偿"
    },
    {
      "id": "g5v1-l26-c08-u7538",
      "lessonId": "g5v1-l26",
      "hanzi": "甸"
    },
    {
      "id": "g5v1-l26-c09-u609f",
      "lessonId": "g5v1-l26",
      "hanzi": "悟"
    },
    {
      "id": "g5v1-l26-c10-u9988",
      "lessonId": "g5v1-l26",
      "hanzi": "馈"
    },
    {
      "id": "g5v1-l26-c11-u78c1",
      "lessonId": "g5v1-l26",
      "hanzi": "磁"
    },
    {
      "id": "g5v1-l26-c12-u9175",
      "lessonId": "g5v1-l26",
      "hanzi": "酵"
    },
    {
      "id": "g5v1-l26-c13-u768e",
      "lessonId": "g5v1-l26",
      "hanzi": "皎"
    },
    {
      "id": "g5v1-l26-c14-u9274",
      "lessonId": "g5v1-l26",
      "hanzi": "鉴"
    },
    {
      "id": "g5v1-l26-c15-u6ca5",
      "lessonId": "g5v1-l26",
      "hanzi": "沥"
    }
  ],
  "split": [
    {
      "id": "g5v1-l01-c01-u9e6d",
      "lessonId": "g5v1-l01",
      "hanzi": "鹭"
    },
    {
      "id": "g5v1-l01-c02-u5acc",
      "lessonId": "g5v1-l01",
      "hanzi": "嫌"
    },
    {
      "id": "g5v1-l01-c03-u5d4c",
      "lessonId": "g5v1-l01",
      "hanzi": "嵌"
    },
    {
      "id": "g5v1-l01-c04-u5323",
      "lessonId": "g5v1-l01",
      "hanzi": "匣"
    },
    {
      "id": "g5v1-l01-c05-u55dc",
      "lessonId": "g5v1-l01",
      "hanzi": "嗜"
    },
    {
      "id": "g5v1-l01-c06-u5b9c",
      "lessonId": "g5v1-l01",
      "hanzi": "宜"
    },
    {
      "id": "g5v1-l01-c07-u9e64",
      "lessonId": "g5v1-l01",
      "hanzi": "鹤"
    },
    {
      "id": "g5v1-l01-c08-u6731",
      "lessonId": "g5v1-l01",
      "hanzi": "朱"
    },
    {
      "id": "g5v1-l01-c09-u6846",
      "lessonId": "g5v1-l01",
      "hanzi": "框"
    },
    {
      "id": "g5v1-l01-c10-u54e8",
      "lessonId": "g5v1-l01",
      "hanzi": "哨"
    },
    {
      "id": "g5v1-l01-c11-u6069",
      "lessonId": "g5v1-l01",
      "hanzi": "恩"
    },
    {
      "id": "g5v1-l01-c12-u97f5",
      "lessonId": "g5v1-l01",
      "hanzi": "韵"
    },
    {
      "id": "g5v1-l02-c01-u4ea9",
      "lessonId": "g5v1-l02",
      "hanzi": "亩"
    },
    {
      "id": "g5v1-l02-c02-u5429",
      "lessonId": "g5v1-l02",
      "hanzi": "吩"
    },
    {
      "id": "g5v1-l02-c03-u69a8",
      "lessonId": "g5v1-l02",
      "hanzi": "榨"
    },
    {
      "id": "g5v1-l02-c04-u69b4",
      "lessonId": "g5v1-l02",
      "hanzi": "榴"
    },
    {
      "id": "g5v1-l02-c05-u77ee",
      "lessonId": "g5v1-l02",
      "hanzi": "矮"
    },
    {
      "id": "g5v1-l02-c06-u64ad",
      "lessonId": "g5v1-l02",
      "hanzi": "播"
    },
    {
      "id": "g5v1-l02-c07-u6d47",
      "lessonId": "g5v1-l02",
      "hanzi": "浇"
    },
    {
      "id": "g5v1-l02-c08-u5490",
      "lessonId": "g5v1-l02",
      "hanzi": "咐"
    },
    {
      "id": "g5v1-l02-c09-u4ead",
      "lessonId": "g5v1-l02",
      "hanzi": "亭"
    },
    {
      "id": "g5v1-l02-c10-u6155",
      "lessonId": "g5v1-l02",
      "hanzi": "慕"
    },
    {
      "id": "g5v1-l02-c11-u8c08",
      "lessonId": "g5v1-l02",
      "hanzi": "谈"
    },
    {
      "id": "g5v1-l03-c01-u7ba9",
      "lessonId": "g5v1-l03",
      "hanzi": "箩"
    },
    {
      "id": "g5v1-l03-c02-u676d",
      "lessonId": "g5v1-l03",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l03-c03-u61c2",
      "lessonId": "g5v1-l03",
      "hanzi": "懂"
    },
    {
      "id": "g5v1-l03-c04-u5170",
      "lessonId": "g5v1-l03",
      "hanzi": "兰"
    },
    {
      "id": "g5v1-l03-c05-u5a46",
      "lessonId": "g5v1-l03",
      "hanzi": "婆"
    },
    {
      "id": "g5v1-l03-c06-u7cd5",
      "lessonId": "g5v1-l03",
      "hanzi": "糕"
    },
    {
      "id": "g5v1-l03-c07-u997c",
      "lessonId": "g5v1-l03",
      "hanzi": "饼"
    },
    {
      "id": "g5v1-l03-c08-u6d78",
      "lessonId": "g5v1-l03",
      "hanzi": "浸"
    },
    {
      "id": "g5v1-l03-c09-u7f20",
      "lessonId": "g5v1-l03",
      "hanzi": "缠"
    },
    {
      "id": "g5v1-l03-c10-u8336",
      "lessonId": "g5v1-l03",
      "hanzi": "茶"
    },
    {
      "id": "g5v1-l03-c11-u6361",
      "lessonId": "g5v1-l03",
      "hanzi": "捡"
    },
    {
      "id": "g5v1-l04-c01-u8513",
      "lessonId": "g5v1-l04",
      "hanzi": "蔓"
    },
    {
      "id": "g5v1-l04-c02-u5e7d",
      "lessonId": "g5v1-l04",
      "hanzi": "幽"
    },
    {
      "id": "g5v1-l04-c03-u6089",
      "lessonId": "g5v1-l04",
      "hanzi": "悉"
    },
    {
      "id": "g5v1-l04-c04-u96cf",
      "lessonId": "g5v1-l04",
      "hanzi": "雏"
    },
    {
      "id": "g5v1-l04-c05-u54df",
      "lessonId": "g5v1-l04",
      "hanzi": "哟"
    },
    {
      "id": "g5v1-l04-c06-u67dc",
      "lessonId": "g5v1-l04",
      "hanzi": "柜"
    },
    {
      "id": "g5v1-l04-c07-u4eab",
      "lessonId": "g5v1-l04",
      "hanzi": "享"
    },
    {
      "id": "g5v1-l04-c08-u966a",
      "lessonId": "g5v1-l04",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l04-c09-u8db4",
      "lessonId": "g5v1-l04",
      "hanzi": "趴"
    },
    {
      "id": "g5v1-l04-c10-u7751",
      "lessonId": "g5v1-l04",
      "hanzi": "睑"
    },
    {
      "id": "g5v1-l04-c11-u7738",
      "lessonId": "g5v1-l04",
      "hanzi": "眸"
    },
    {
      "id": "g5v1-l04-c12-u5482",
      "lessonId": "g5v1-l04",
      "hanzi": "咂"
    },
    {
      "id": "g5v1-l05-c01-u6c5b",
      "lessonId": "g5v1-l05",
      "hanzi": "汛"
    },
    {
      "id": "g5v1-l05-c02-u633d",
      "lessonId": "g5v1-l05",
      "hanzi": "挽"
    },
    {
      "id": "g5v1-l05-c03-u95f4",
      "lessonId": "g5v1-l05",
      "hanzi": "间"
    },
    {
      "id": "g5v1-l05-c04-u60f0",
      "lessonId": "g5v1-l05",
      "hanzi": "惰"
    },
    {
      "id": "g5v1-l05-c05-u8861",
      "lessonId": "g5v1-l05",
      "hanzi": "衡"
    },
    {
      "id": "g5v1-l05-c06-u534f",
      "lessonId": "g5v1-l05",
      "hanzi": "协"
    },
    {
      "id": "g5v1-l05-c07-u7ef0",
      "lessonId": "g5v1-l05",
      "hanzi": "绰"
    },
    {
      "id": "g5v1-l05-c08-u6d2a",
      "lessonId": "g5v1-l05",
      "hanzi": "洪"
    },
    {
      "id": "g5v1-l05-c09-u8bbf",
      "lessonId": "g5v1-l05",
      "hanzi": "访"
    },
    {
      "id": "g5v1-l05-c10-u978b",
      "lessonId": "g5v1-l05",
      "hanzi": "鞋"
    },
    {
      "id": "g5v1-l05-c11-u9694",
      "lessonId": "g5v1-l05",
      "hanzi": "隔"
    },
    {
      "id": "g5v1-l05-c12-u61d2",
      "lessonId": "g5v1-l05",
      "hanzi": "懒"
    },
    {
      "id": "g5v1-l05-c13-u7a33",
      "lessonId": "g5v1-l05",
      "hanzi": "稳"
    },
    {
      "id": "g5v1-l05-c14-u514d",
      "lessonId": "g5v1-l05",
      "hanzi": "免"
    },
    {
      "id": "g5v1-l06-c01-u74a7",
      "lessonId": "g5v1-l06",
      "hanzi": "璧"
    },
    {
      "id": "g5v1-l06-c02-u81e3",
      "lessonId": "g5v1-l06",
      "hanzi": "臣"
    },
    {
      "id": "g5v1-l06-c03-u5f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "强"
    },
    {
      "id": "g5v1-l06-c04-u8bfa",
      "lessonId": "g5v1-l06",
      "hanzi": "诺"
    },
    {
      "id": "g5v1-l06-c05-u5212",
      "lessonId": "g5v1-l06",
      "hanzi": "划"
    },
    {
      "id": "g5v1-l06-c06-u5178",
      "lessonId": "g5v1-l06",
      "hanzi": "典"
    },
    {
      "id": "g5v1-l06-c07-u7f6a",
      "lessonId": "g5v1-l06",
      "hanzi": "罪"
    },
    {
      "id": "g5v1-l06-c08-u5ec9",
      "lessonId": "g5v1-l06",
      "hanzi": "廉"
    },
    {
      "id": "g5v1-l06-c09-u62b5",
      "lessonId": "g5v1-l06",
      "hanzi": "抵"
    },
    {
      "id": "g5v1-l06-c10-u5fa1",
      "lessonId": "g5v1-l06",
      "hanzi": "御"
    },
    {
      "id": "g5v1-l06-c11-u8f9e",
      "lessonId": "g5v1-l06",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l06-c12-u8fb1",
      "lessonId": "g5v1-l06",
      "hanzi": "辱"
    },
    {
      "id": "g5v1-l06-c13-u64c5",
      "lessonId": "g5v1-l06",
      "hanzi": "擅"
    },
    {
      "id": "g5v1-l06-c14-u7f36",
      "lessonId": "g5v1-l06",
      "hanzi": "缶"
    },
    {
      "id": "g5v1-l06-c15-u537f",
      "lessonId": "g5v1-l06",
      "hanzi": "卿"
    },
    {
      "id": "g5v1-l06-c16-u524a",
      "lessonId": "g5v1-l06",
      "hanzi": "削"
    },
    {
      "id": "g5v1-l06-c17-u888d",
      "lessonId": "g5v1-l06",
      "hanzi": "袍"
    },
    {
      "id": "g5v1-l06-c18-u53ec",
      "lessonId": "g5v1-l06",
      "hanzi": "召"
    },
    {
      "id": "g5v1-l06-c19-u8bae",
      "lessonId": "g5v1-l06",
      "hanzi": "议"
    },
    {
      "id": "g5v1-l06-c20-u7f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "缺"
    },
    {
      "id": "g5v1-l06-c21-u5bab",
      "lessonId": "g5v1-l06",
      "hanzi": "宫"
    },
    {
      "id": "g5v1-l06-c22-u732e",
      "lessonId": "g5v1-l06",
      "hanzi": "献"
    },
    {
      "id": "g5v1-l06-c23-u627f",
      "lessonId": "g5v1-l06",
      "hanzi": "承"
    },
    {
      "id": "g5v1-l06-c24-u6284",
      "lessonId": "g5v1-l06",
      "hanzi": "抄"
    },
    {
      "id": "g5v1-l06-c25-u602f",
      "lessonId": "g5v1-l06",
      "hanzi": "怯"
    },
    {
      "id": "g5v1-l06-c26-u62d2",
      "lessonId": "g5v1-l06",
      "hanzi": "拒"
    },
    {
      "id": "g5v1-l06-c27-u8346",
      "lessonId": "g5v1-l06",
      "hanzi": "荆"
    },
    {
      "id": "g5v1-l07-c01-u9e35",
      "lessonId": "g5v1-l07",
      "hanzi": "鸵"
    },
    {
      "id": "g5v1-l07-c02-u8d62",
      "lessonId": "g5v1-l07",
      "hanzi": "赢"
    },
    {
      "id": "g5v1-l07-c03-u51a0",
      "lessonId": "g5v1-l07",
      "hanzi": "冠"
    },
    {
      "id": "g5v1-l07-c04-u4fef",
      "lessonId": "g5v1-l07",
      "hanzi": "俯"
    },
    {
      "id": "g5v1-l07-c05-u55b7",
      "lessonId": "g5v1-l07",
      "hanzi": "喷"
    },
    {
      "id": "g5v1-l07-c06-u679a",
      "lessonId": "g5v1-l07",
      "hanzi": "枚"
    },
    {
      "id": "g5v1-l07-c07-u7bad",
      "lessonId": "g5v1-l07",
      "hanzi": "箭"
    },
    {
      "id": "g5v1-l07-c08-u6d69",
      "lessonId": "g5v1-l07",
      "hanzi": "浩"
    },
    {
      "id": "g5v1-l07-c09-u7b52",
      "lessonId": "g5v1-l07",
      "hanzi": "筒"
    },
    {
      "id": "g5v1-l07-c10-u675f",
      "lessonId": "g5v1-l07",
      "hanzi": "束"
    },
    {
      "id": "g5v1-l07-c11-u8d64",
      "lessonId": "g5v1-l07",
      "hanzi": "赤"
    },
    {
      "id": "g5v1-l07-c12-u5708",
      "lessonId": "g5v1-l07",
      "hanzi": "圈"
    },
    {
      "id": "g5v1-l07-c13-u7f6e",
      "lessonId": "g5v1-l07",
      "hanzi": "置"
    },
    {
      "id": "g5v1-l08-c01-u4fb5",
      "lessonId": "g5v1-l08",
      "hanzi": "侵"
    },
    {
      "id": "g5v1-l08-c02-u7565",
      "lessonId": "g5v1-l08",
      "hanzi": "略"
    },
    {
      "id": "g5v1-l08-c03-u5792",
      "lessonId": "g5v1-l08",
      "hanzi": "垒"
    },
    {
      "id": "g5v1-l08-c04-u4efb",
      "lessonId": "g5v1-l08",
      "hanzi": "任"
    },
    {
      "id": "g5v1-l08-c05-u4e18",
      "lessonId": "g5v1-l08",
      "hanzi": "丘"
    },
    {
      "id": "g5v1-l08-c06-u6401",
      "lessonId": "g5v1-l08",
      "hanzi": "搁"
    },
    {
      "id": "g5v1-l08-c07-u9677",
      "lessonId": "g5v1-l08",
      "hanzi": "陷"
    },
    {
      "id": "g5v1-l08-c08-u62d0",
      "lessonId": "g5v1-l08",
      "hanzi": "拐"
    },
    {
      "id": "g5v1-l08-c09-u5c94",
      "lessonId": "g5v1-l08",
      "hanzi": "岔"
    },
    {
      "id": "g5v1-l08-c10-u7b51",
      "lessonId": "g5v1-l08",
      "hanzi": "筑"
    },
    {
      "id": "g5v1-l08-c11-u5821",
      "lessonId": "g5v1-l08",
      "hanzi": "堡"
    },
    {
      "id": "g5v1-l08-c12-u515a",
      "lessonId": "g5v1-l08",
      "hanzi": "党"
    },
    {
      "id": "g5v1-l08-c13-u59a8",
      "lessonId": "g5v1-l08",
      "hanzi": "妨"
    },
    {
      "id": "g5v1-l08-c14-u853d",
      "lessonId": "g5v1-l08",
      "hanzi": "蔽"
    },
    {
      "id": "g5v1-l09-c01-u916c",
      "lessonId": "g5v1-l09",
      "hanzi": "酬"
    },
    {
      "id": "g5v1-l09-c02-u8a93",
      "lessonId": "g5v1-l09",
      "hanzi": "誓"
    },
    {
      "id": "g5v1-l09-c03-u8c0e",
      "lessonId": "g5v1-l09",
      "hanzi": "谎"
    },
    {
      "id": "g5v1-l09-c04-u727a",
      "lessonId": "g5v1-l09",
      "hanzi": "牺"
    },
    {
      "id": "g5v1-l09-c05-u73cd",
      "lessonId": "g5v1-l09",
      "hanzi": "珍"
    },
    {
      "id": "g5v1-l09-c06-u53ee",
      "lessonId": "g5v1-l09",
      "hanzi": "叮"
    },
    {
      "id": "g5v1-l09-c07-u5631",
      "lessonId": "g5v1-l09",
      "hanzi": "嘱"
    },
    {
      "id": "g5v1-l09-c08-u584c",
      "lessonId": "g5v1-l09",
      "hanzi": "塌"
    },
    {
      "id": "g5v1-l09-c09-u7126",
      "lessonId": "g5v1-l09",
      "hanzi": "焦"
    },
    {
      "id": "g5v1-l09-c10-u5ef6",
      "lessonId": "g5v1-l09",
      "hanzi": "延"
    },
    {
      "id": "g5v1-l09-c11-u707e",
      "lessonId": "g5v1-l09",
      "hanzi": "灾"
    },
    {
      "id": "g5v1-l09-c12-u6094",
      "lessonId": "g5v1-l09",
      "hanzi": "悔"
    },
    {
      "id": "g5v1-l09-c13-u6276",
      "lessonId": "g5v1-l09",
      "hanzi": "扶"
    },
    {
      "id": "g5v1-l10-c01-u5ac2",
      "lessonId": "g5v1-l10",
      "hanzi": "嫂"
    },
    {
      "id": "g5v1-l10-c02-u6073",
      "lessonId": "g5v1-l10",
      "hanzi": "恳"
    },
    {
      "id": "g5v1-l10-c03-u7b5b",
      "lessonId": "g5v1-l10",
      "hanzi": "筛"
    },
    {
      "id": "g5v1-l10-c04-u6b79",
      "lessonId": "g5v1-l10",
      "hanzi": "歹"
    },
    {
      "id": "g5v1-l10-c05-u7f55",
      "lessonId": "g5v1-l10",
      "hanzi": "罕"
    },
    {
      "id": "g5v1-l10-c06-u68ad",
      "lessonId": "g5v1-l10",
      "hanzi": "梭"
    },
    {
      "id": "g5v1-l10-c07-u76d1",
      "lessonId": "g5v1-l10",
      "hanzi": "监"
    },
    {
      "id": "g5v1-l10-c08-u72f1",
      "lessonId": "g5v1-l10",
      "hanzi": "狱"
    },
    {
      "id": "g5v1-l10-c09-u917f",
      "lessonId": "g5v1-l10",
      "hanzi": "酿"
    },
    {
      "id": "g5v1-l10-c10-u778c",
      "lessonId": "g5v1-l10",
      "hanzi": "瞌"
    },
    {
      "id": "g5v1-l10-c11-u843d",
      "lessonId": "g5v1-l10",
      "hanzi": "落"
    },
    {
      "id": "g5v1-l10-c12-u5a5a",
      "lessonId": "g5v1-l10",
      "hanzi": "婚"
    },
    {
      "id": "g5v1-l10-c13-u90ce",
      "lessonId": "g5v1-l10",
      "hanzi": "郎"
    },
    {
      "id": "g5v1-l10-c14-u7239",
      "lessonId": "g5v1-l10",
      "hanzi": "爹"
    },
    {
      "id": "g5v1-l10-c15-u8f86",
      "lessonId": "g5v1-l10",
      "hanzi": "辆"
    },
    {
      "id": "g5v1-l10-c16-u7eb1",
      "lessonId": "g5v1-l10",
      "hanzi": "纱"
    },
    {
      "id": "g5v1-l10-c17-u59bb",
      "lessonId": "g5v1-l10",
      "hanzi": "妻"
    },
    {
      "id": "g5v1-l10-c18-u8d9f",
      "lessonId": "g5v1-l10",
      "hanzi": "趟"
    },
    {
      "id": "g5v1-l10-c19-u6258",
      "lessonId": "g5v1-l10",
      "hanzi": "托"
    },
    {
      "id": "g5v1-l10-c20-u6e9c",
      "lessonId": "g5v1-l10",
      "hanzi": "溜"
    },
    {
      "id": "g5v1-l10-c21-u8f88",
      "lessonId": "g5v1-l10",
      "hanzi": "辈"
    },
    {
      "id": "g5v1-l10-c22-u6328",
      "lessonId": "g5v1-l10",
      "hanzi": "挨"
    },
    {
      "id": "g5v1-l11-c01-u4fed",
      "lessonId": "g5v1-l11",
      "hanzi": "俭"
    },
    {
      "id": "g5v1-l11-c02-u7687",
      "lessonId": "g5v1-l11",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l11-c03-u504e",
      "lessonId": "g5v1-l11",
      "hanzi": "偎"
    },
    {
      "id": "g5v1-l11-c04-u8870",
      "lessonId": "g5v1-l11",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l11-c05-u73ca",
      "lessonId": "g5v1-l11",
      "hanzi": "珊"
    },
    {
      "id": "g5v1-l11-c06-u745a",
      "lessonId": "g5v1-l11",
      "hanzi": "瑚"
    },
    {
      "id": "g5v1-l11-c07-u7901",
      "lessonId": "g5v1-l11",
      "hanzi": "礁"
    },
    {
      "id": "g5v1-l11-c08-u7b50",
      "lessonId": "g5v1-l11",
      "hanzi": "筐"
    },
    {
      "id": "g5v1-l11-c09-u62d7",
      "lessonId": "g5v1-l11",
      "hanzi": "拗"
    },
    {
      "id": "g5v1-l12-c01-u4e43",
      "lessonId": "g5v1-l12",
      "hanzi": "乃"
    },
    {
      "id": "g5v1-l12-c02-u718f",
      "lessonId": "g5v1-l12",
      "hanzi": "熏"
    },
    {
      "id": "g5v1-l12-c03-u4ea5",
      "lessonId": "g5v1-l12",
      "hanzi": "亥"
    },
    {
      "id": "g5v1-l12-c04-u6043",
      "lessonId": "g5v1-l12",
      "hanzi": "恃"
    },
    {
      "id": "g5v1-l12-c05-u64de",
      "lessonId": "g5v1-l12",
      "hanzi": "擞"
    },
    {
      "id": "g5v1-l12-c06-u796d",
      "lessonId": "g5v1-l12",
      "hanzi": "祭"
    },
    {
      "id": "g5v1-l12-c07-u676d",
      "lessonId": "g5v1-l12",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l12-c08-u54c0",
      "lessonId": "g5v1-l12",
      "hanzi": "哀"
    },
    {
      "id": "g5v1-l12-c09-u62d8",
      "lessonId": "g5v1-l12",
      "hanzi": "拘"
    },
    {
      "id": "g5v1-l13-c01-u6cfb",
      "lessonId": "g5v1-l13",
      "hanzi": "泻"
    },
    {
      "id": "g5v1-l13-c02-u9cde",
      "lessonId": "g5v1-l13",
      "hanzi": "鳞"
    },
    {
      "id": "g5v1-l13-c03-u60f6",
      "lessonId": "g5v1-l13",
      "hanzi": "惶"
    },
    {
      "id": "g5v1-l13-c04-u80ce",
      "lessonId": "g5v1-l13",
      "hanzi": "胎"
    },
    {
      "id": "g5v1-l13-c05-u5c65",
      "lessonId": "g5v1-l13",
      "hanzi": "履"
    },
    {
      "id": "g5v1-l13-c06-u54c9",
      "lessonId": "g5v1-l13",
      "hanzi": "哉"
    },
    {
      "id": "g5v1-l13-c07-u6f5c",
      "lessonId": "g5v1-l13",
      "hanzi": "潜"
    },
    {
      "id": "g5v1-l13-c08-u8bd5",
      "lessonId": "g5v1-l13",
      "hanzi": "试"
    },
    {
      "id": "g5v1-l13-c09-u7687",
      "lessonId": "g5v1-l13",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l13-c10-u7eb5",
      "lessonId": "g5v1-l13",
      "hanzi": "纵"
    },
    {
      "id": "g5v1-l13-c11-u7586",
      "lessonId": "g5v1-l13",
      "hanzi": "疆"
    },
    {
      "id": "g5v1-l14-c01-u4f30",
      "lessonId": "g5v1-l14",
      "hanzi": "估"
    },
    {
      "id": "g5v1-l14-c02-u714c",
      "lessonId": "g5v1-l14",
      "hanzi": "煌"
    },
    {
      "id": "g5v1-l14-c03-u73d1",
      "lessonId": "g5v1-l14",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l14-c04-u5254",
      "lessonId": "g5v1-l14",
      "hanzi": "剔"
    },
    {
      "id": "g5v1-l14-c05-u6f9c",
      "lessonId": "g5v1-l14",
      "hanzi": "澜"
    },
    {
      "id": "g5v1-l14-c06-u7476",
      "lessonId": "g5v1-l14",
      "hanzi": "瑶"
    },
    {
      "id": "g5v1-l14-c07-u9675",
      "lessonId": "g5v1-l14",
      "hanzi": "陵"
    },
    {
      "id": "g5v1-l14-c08-u5b8f",
      "lessonId": "g5v1-l14",
      "hanzi": "宏"
    },
    {
      "id": "g5v1-l14-c09-u5949",
      "lessonId": "g5v1-l14",
      "hanzi": "奉"
    },
    {
      "id": "g5v1-l14-c10-u70ec",
      "lessonId": "g5v1-l14",
      "hanzi": "烬"
    },
    {
      "id": "g5v1-l14-c11-u6bc1",
      "lessonId": "g5v1-l14",
      "hanzi": "毁"
    },
    {
      "id": "g5v1-l14-c12-u635f",
      "lessonId": "g5v1-l14",
      "hanzi": "损"
    },
    {
      "id": "g5v1-l14-c13-u62f1",
      "lessonId": "g5v1-l14",
      "hanzi": "拱"
    },
    {
      "id": "g5v1-l14-c14-u8f89",
      "lessonId": "g5v1-l14",
      "hanzi": "辉"
    },
    {
      "id": "g5v1-l14-c15-u6bbf",
      "lessonId": "g5v1-l14",
      "hanzi": "殿"
    },
    {
      "id": "g5v1-l14-c16-u89c8",
      "lessonId": "g5v1-l14",
      "hanzi": "览"
    },
    {
      "id": "g5v1-l14-c17-u5883",
      "lessonId": "g5v1-l14",
      "hanzi": "境"
    },
    {
      "id": "g5v1-l14-c18-u5510",
      "lessonId": "g5v1-l14",
      "hanzi": "唐"
    },
    {
      "id": "g5v1-l14-c19-u95ef",
      "lessonId": "g5v1-l14",
      "hanzi": "闯"
    },
    {
      "id": "g5v1-l14-c20-u9500",
      "lessonId": "g5v1-l14",
      "hanzi": "销"
    },
    {
      "id": "g5v1-l15-c01-u7792",
      "lessonId": "g5v1-l15",
      "hanzi": "瞒"
    },
    {
      "id": "g5v1-l15-c02-u57df",
      "lessonId": "g5v1-l15",
      "hanzi": "域"
    },
    {
      "id": "g5v1-l15-c03-u8247",
      "lessonId": "g5v1-l15",
      "hanzi": "艇"
    },
    {
      "id": "g5v1-l15-c04-u77db",
      "lessonId": "g5v1-l15",
      "hanzi": "矛"
    },
    {
      "id": "g5v1-l15-c05-u76fe",
      "lessonId": "g5v1-l15",
      "hanzi": "盾"
    },
    {
      "id": "g5v1-l15-c06-u7b77",
      "lessonId": "g5v1-l15",
      "hanzi": "筷"
    },
    {
      "id": "g5v1-l15-c07-u708a",
      "lessonId": "g5v1-l15",
      "hanzi": "炊"
    },
    {
      "id": "g5v1-l15-c08-u54fc",
      "lessonId": "g5v1-l15",
      "hanzi": "哼"
    },
    {
      "id": "g5v1-l15-c09-u5589",
      "lessonId": "g5v1-l15",
      "hanzi": "喉"
    },
    {
      "id": "g5v1-l15-c10-u5499",
      "lessonId": "g5v1-l15",
      "hanzi": "咙"
    },
    {
      "id": "g5v1-l15-c11-u54fd",
      "lessonId": "g5v1-l15",
      "hanzi": "哽"
    },
    {
      "id": "g5v1-l15-c12-u52fa",
      "lessonId": "g5v1-l15",
      "hanzi": "勺"
    },
    {
      "id": "g5v1-l15-c13-u6405",
      "lessonId": "g5v1-l15",
      "hanzi": "搅"
    },
    {
      "id": "g5v1-l15-c14-u8200",
      "lessonId": "g5v1-l15",
      "hanzi": "舀"
    },
    {
      "id": "g5v1-l16-c01-u6444",
      "lessonId": "g5v1-l16",
      "hanzi": "摄"
    },
    {
      "id": "g5v1-l16-c02-u6b96",
      "lessonId": "g5v1-l16",
      "hanzi": "殖"
    },
    {
      "id": "g5v1-l16-c03-u70ad",
      "lessonId": "g5v1-l16",
      "hanzi": "炭"
    },
    {
      "id": "g5v1-l16-c04-u7597",
      "lessonId": "g5v1-l16",
      "hanzi": "疗"
    },
    {
      "id": "g5v1-l16-c05-u6c0f",
      "lessonId": "g5v1-l16",
      "hanzi": "氏"
    },
    {
      "id": "g5v1-l16-c06-u7cae",
      "lessonId": "g5v1-l16",
      "hanzi": "粮"
    },
    {
      "id": "g5v1-l16-c07-u533a",
      "lessonId": "g5v1-l16",
      "hanzi": "区"
    },
    {
      "id": "g5v1-l16-c08-u6740",
      "lessonId": "g5v1-l16",
      "hanzi": "杀"
    },
    {
      "id": "g5v1-l16-c09-u83cc",
      "lessonId": "g5v1-l16",
      "hanzi": "菌"
    },
    {
      "id": "g5v1-l17-c01-u9a6f",
      "lessonId": "g5v1-l17",
      "hanzi": "驯"
    },
    {
      "id": "g5v1-l17-c02-u77eb",
      "lessonId": "g5v1-l17",
      "hanzi": "矫"
    },
    {
      "id": "g5v1-l17-c03-u6b47",
      "lessonId": "g5v1-l17",
      "hanzi": "歇"
    },
    {
      "id": "g5v1-l17-c04-u6748",
      "lessonId": "g5v1-l17",
      "hanzi": "杈"
    },
    {
      "id": "g5v1-l17-c05-u85d3",
      "lessonId": "g5v1-l17",
      "hanzi": "藓"
    },
    {
      "id": "g5v1-l17-c06-u72ed",
      "lessonId": "g5v1-l17",
      "hanzi": "狭"
    },
    {
      "id": "g5v1-l17-c07-u52c9",
      "lessonId": "g5v1-l17",
      "hanzi": "勉"
    },
    {
      "id": "g5v1-l17-c08-u9525",
      "lessonId": "g5v1-l17",
      "hanzi": "锥"
    },
    {
      "id": "g5v1-l17-c09-u9f20",
      "lessonId": "g5v1-l17",
      "hanzi": "鼠"
    },
    {
      "id": "g5v1-l17-c10-u79c0",
      "lessonId": "g5v1-l17",
      "hanzi": "秀"
    },
    {
      "id": "g5v1-l17-c11-u73b2",
      "lessonId": "g5v1-l17",
      "hanzi": "玲"
    },
    {
      "id": "g5v1-l17-c12-u73d1",
      "lessonId": "g5v1-l17",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l17-c13-u5e3d",
      "lessonId": "g5v1-l17",
      "hanzi": "帽"
    },
    {
      "id": "g5v1-l17-c14-u5c3e",
      "lessonId": "g5v1-l17",
      "hanzi": "尾"
    },
    {
      "id": "g5v1-l17-c15-u7a9d",
      "lessonId": "g5v1-l17",
      "hanzi": "窝"
    },
    {
      "id": "g5v1-l17-c16-u6ed1",
      "lessonId": "g5v1-l17",
      "hanzi": "滑"
    },
    {
      "id": "g5v1-l17-c17-u62fe",
      "lessonId": "g5v1-l17",
      "hanzi": "拾"
    },
    {
      "id": "g5v1-l17-c18-u68b3",
      "lessonId": "g5v1-l17",
      "hanzi": "梳"
    },
    {
      "id": "g5v1-l18-c01-u9b44",
      "lessonId": "g5v1-l18",
      "hanzi": "魄"
    },
    {
      "id": "g5v1-l18-c02-u6291",
      "lessonId": "g5v1-l18",
      "hanzi": "抑"
    },
    {
      "id": "g5v1-l18-c03-u9893",
      "lessonId": "g5v1-l18",
      "hanzi": "颓"
    },
    {
      "id": "g5v1-l18-c04-u7eab",
      "lessonId": "g5v1-l18",
      "hanzi": "纫"
    },
    {
      "id": "g5v1-l18-c05-u566a",
      "lessonId": "g5v1-l18",
      "hanzi": "噪"
    },
    {
      "id": "g5v1-l18-c06-u8910",
      "lessonId": "g5v1-l18",
      "hanzi": "褐"
    },
    {
      "id": "g5v1-l18-c07-u60eb",
      "lessonId": "g5v1-l18",
      "hanzi": "惫"
    },
    {
      "id": "g5v1-l18-c08-u803d",
      "lessonId": "g5v1-l18",
      "hanzi": "耽"
    },
    {
      "id": "g5v1-l18-c09-u515c",
      "lessonId": "g5v1-l18",
      "hanzi": "兜"
    },
    {
      "id": "g5v1-l18-c10-u6743",
      "lessonId": "g5v1-l18",
      "hanzi": "权"
    },
    {
      "id": "g5v1-l18-c11-u8f9e",
      "lessonId": "g5v1-l18",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l18-c12-u788c",
      "lessonId": "g5v1-l18",
      "hanzi": "碌"
    },
    {
      "id": "g5v1-l18-c13-u540a",
      "lessonId": "g5v1-l18",
      "hanzi": "吊"
    },
    {
      "id": "g5v1-l18-c14-u9177",
      "lessonId": "g5v1-l18",
      "hanzi": "酷"
    },
    {
      "id": "g5v1-l18-c15-u6691",
      "lessonId": "g5v1-l18",
      "hanzi": "暑"
    },
    {
      "id": "g5v1-l18-c16-u810a",
      "lessonId": "g5v1-l18",
      "hanzi": "脊"
    },
    {
      "id": "g5v1-l18-c17-u7f69",
      "lessonId": "g5v1-l18",
      "hanzi": "罩"
    },
    {
      "id": "g5v1-l18-c18-u7adf",
      "lessonId": "g5v1-l18",
      "hanzi": "竟"
    },
    {
      "id": "g5v1-l18-c19-u54c7",
      "lessonId": "g5v1-l18",
      "hanzi": "哇"
    },
    {
      "id": "g5v1-l18-c20-u5fcd",
      "lessonId": "g5v1-l18",
      "hanzi": "忍"
    },
    {
      "id": "g5v1-l18-c21-u68b0",
      "lessonId": "g5v1-l18",
      "hanzi": "械"
    },
    {
      "id": "g5v1-l18-c22-u9178",
      "lessonId": "g5v1-l18",
      "hanzi": "酸"
    },
    {
      "id": "g5v1-l19-c01-u8327",
      "lessonId": "g5v1-l19",
      "hanzi": "茧"
    },
    {
      "id": "g5v1-l19-c02-u6808",
      "lessonId": "g5v1-l19",
      "hanzi": "栈"
    },
    {
      "id": "g5v1-l19-c03-u51a4",
      "lessonId": "g5v1-l19",
      "hanzi": "冤"
    },
    {
      "id": "g5v1-l19-c04-u6789",
      "lessonId": "g5v1-l19",
      "hanzi": "枉"
    },
    {
      "id": "g5v1-l19-c05-u604d",
      "lessonId": "g5v1-l19",
      "hanzi": "恍"
    },
    {
      "id": "g5v1-l19-c06-u60da",
      "lessonId": "g5v1-l19",
      "hanzi": "惚"
    },
    {
      "id": "g5v1-l19-c07-u8df7",
      "lessonId": "g5v1-l19",
      "hanzi": "跷"
    },
    {
      "id": "g5v1-l19-c08-u50fb",
      "lessonId": "g5v1-l19",
      "hanzi": "僻"
    },
    {
      "id": "g5v1-l19-c09-u59d4",
      "lessonId": "g5v1-l19",
      "hanzi": "委"
    },
    {
      "id": "g5v1-l19-c10-u8fea",
      "lessonId": "g5v1-l19",
      "hanzi": "迪"
    },
    {
      "id": "g5v1-l19-c11-u5ac1",
      "lessonId": "g5v1-l19",
      "hanzi": "嫁"
    },
    {
      "id": "g5v1-l19-c12-u7f34",
      "lessonId": "g5v1-l19",
      "hanzi": "缴"
    },
    {
      "id": "g5v1-l19-c13-u699c",
      "lessonId": "g5v1-l19",
      "hanzi": "榜"
    },
    {
      "id": "g5v1-l19-c14-u517c",
      "lessonId": "g5v1-l19",
      "hanzi": "兼"
    },
    {
      "id": "g5v1-l19-c15-u5632",
      "lessonId": "g5v1-l19",
      "hanzi": "嘲"
    },
    {
      "id": "g5v1-l19-c16-u6795",
      "lessonId": "g5v1-l19",
      "hanzi": "枕"
    },
    {
      "id": "g5v1-l19-c17-u8695",
      "lessonId": "g5v1-l19",
      "hanzi": "蚕"
    },
    {
      "id": "g5v1-l19-c18-u8003",
      "lessonId": "g5v1-l19",
      "hanzi": "考"
    },
    {
      "id": "g5v1-l19-c19-u75bc",
      "lessonId": "g5v1-l19",
      "hanzi": "疼"
    },
    {
      "id": "g5v1-l19-c20-u5e2d",
      "lessonId": "g5v1-l19",
      "hanzi": "席"
    },
    {
      "id": "g5v1-l19-c21-u7cd6",
      "lessonId": "g5v1-l19",
      "hanzi": "糖"
    },
    {
      "id": "g5v1-l19-c22-u5c51",
      "lessonId": "g5v1-l19",
      "hanzi": "屑"
    },
    {
      "id": "g5v1-l19-c23-u9489",
      "lessonId": "g5v1-l19",
      "hanzi": "钉"
    },
    {
      "id": "g5v1-l19-c24-u966a",
      "lessonId": "g5v1-l19",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l19-c25-u6bd5",
      "lessonId": "g5v1-l19",
      "hanzi": "毕"
    },
    {
      "id": "g5v1-l19-c26-u716e",
      "lessonId": "g5v1-l19",
      "hanzi": "煮"
    },
    {
      "id": "g5v1-l20-c01-u817c",
      "lessonId": "g5v1-l20",
      "hanzi": "腼"
    },
    {
      "id": "g5v1-l20-c02-u8146",
      "lessonId": "g5v1-l20",
      "hanzi": "腆"
    },
    {
      "id": "g5v1-l20-c03-u8a8a",
      "lessonId": "g5v1-l20",
      "hanzi": "誊"
    },
    {
      "id": "g5v1-l20-c04-u52b1",
      "lessonId": "g5v1-l20",
      "hanzi": "励"
    },
    {
      "id": "g5v1-l20-c05-u7248",
      "lessonId": "g5v1-l20",
      "hanzi": "版"
    },
    {
      "id": "g5v1-l20-c06-u7965",
      "lessonId": "g5v1-l20",
      "hanzi": "祥"
    },
    {
      "id": "g5v1-l20-c07-u6b67",
      "lessonId": "g5v1-l20",
      "hanzi": "歧"
    },
    {
      "id": "g5v1-l20-c08-u8c28",
      "lessonId": "g5v1-l20",
      "hanzi": "谨"
    },
    {
      "id": "g5v1-l21-c01-u6986",
      "lessonId": "g5v1-l21",
      "hanzi": "榆"
    },
    {
      "id": "g5v1-l21-c02-u7554",
      "lessonId": "g5v1-l21",
      "hanzi": "畔"
    },
    {
      "id": "g5v1-l21-c03-u66f4",
      "lessonId": "g5v1-l21",
      "hanzi": "更"
    },
    {
      "id": "g5v1-l21-c04-u8052",
      "lessonId": "g5v1-l21",
      "hanzi": "聒"
    },
    {
      "id": "g5v1-l21-c05-u5b59",
      "lessonId": "g5v1-l21",
      "hanzi": "孙"
    },
    {
      "id": "g5v1-l21-c06-u6cca",
      "lessonId": "g5v1-l21",
      "hanzi": "泊"
    },
    {
      "id": "g5v1-l21-c07-u6101",
      "lessonId": "g5v1-l21",
      "hanzi": "愁"
    },
    {
      "id": "g5v1-l21-c08-u5bfa",
      "lessonId": "g5v1-l21",
      "hanzi": "寺"
    },
    {
      "id": "g5v1-l22-c01-u6868",
      "lessonId": "g5v1-l22",
      "hanzi": "桨"
    },
    {
      "id": "g5v1-l22-c02-u6869",
      "lessonId": "g5v1-l22",
      "hanzi": "桩"
    },
    {
      "id": "g5v1-l22-c03-u6687",
      "lessonId": "g5v1-l22",
      "hanzi": "暇"
    },
    {
      "id": "g5v1-l22-c04-u6995",
      "lessonId": "g5v1-l22",
      "hanzi": "榕"
    },
    {
      "id": "g5v1-l22-c05-u7ea0",
      "lessonId": "g5v1-l22",
      "hanzi": "纠"
    },
    {
      "id": "g5v1-l22-c06-u8000",
      "lessonId": "g5v1-l22",
      "hanzi": "耀"
    },
    {
      "id": "g5v1-l22-c07-u6da8",
      "lessonId": "g5v1-l22",
      "hanzi": "涨"
    },
    {
      "id": "g5v1-l22-c08-u5854",
      "lessonId": "g5v1-l22",
      "hanzi": "塔"
    },
    {
      "id": "g5v1-l22-c09-u68a2",
      "lessonId": "g5v1-l22",
      "hanzi": "梢"
    },
    {
      "id": "g5v1-l22-c10-u7709",
      "lessonId": "g5v1-l22",
      "hanzi": "眉"
    },
    {
      "id": "g5v1-l22-c11-u629b",
      "lessonId": "g5v1-l22",
      "hanzi": "抛"
    },
    {
      "id": "g5v1-l23-c01-u6084",
      "lessonId": "g5v1-l23",
      "hanzi": "悄"
    },
    {
      "id": "g5v1-l23-c02-u7d2f",
      "lessonId": "g5v1-l23",
      "hanzi": "累"
    },
    {
      "id": "g5v1-l23-c03-u5ae6",
      "lessonId": "g5v1-l23",
      "hanzi": "嫦"
    },
    {
      "id": "g5v1-l23-c04-u5a25",
      "lessonId": "g5v1-l23",
      "hanzi": "娥"
    },
    {
      "id": "g5v1-l23-c05-u5ac9",
      "lessonId": "g5v1-l23",
      "hanzi": "嫉"
    },
    {
      "id": "g5v1-l23-c06-u5992",
      "lessonId": "g5v1-l23",
      "hanzi": "妒"
    },
    {
      "id": "g5v1-l23-c07-u74f7",
      "lessonId": "g5v1-l23",
      "hanzi": "瓷"
    },
    {
      "id": "g5v1-l24-c01-u803b",
      "lessonId": "g5v1-l24",
      "hanzi": "耻"
    },
    {
      "id": "g5v1-l24-c02-u8bc6",
      "lessonId": "g5v1-l24",
      "hanzi": "识"
    },
    {
      "id": "g5v1-l24-c03-u5bdd",
      "lessonId": "g5v1-l24",
      "hanzi": "寝"
    },
    {
      "id": "g5v1-l24-c04-u77e3",
      "lessonId": "g5v1-l24",
      "hanzi": "矣"
    },
    {
      "id": "g5v1-l24-c05-u5c82",
      "lessonId": "g5v1-l24",
      "hanzi": "岂"
    },
    {
      "id": "g5v1-l24-c06-u8bf2",
      "lessonId": "g5v1-l24",
      "hanzi": "诲"
    },
    {
      "id": "g5v1-l24-c07-u8c13",
      "lessonId": "g5v1-l24",
      "hanzi": "谓"
    },
    {
      "id": "g5v1-l24-c08-u8bf5",
      "lessonId": "g5v1-l24",
      "hanzi": "诵"
    },
    {
      "id": "g5v1-l25-c01-u8205",
      "lessonId": "g5v1-l25",
      "hanzi": "舅"
    },
    {
      "id": "g5v1-l25-c02-u5bb4",
      "lessonId": "g5v1-l25",
      "hanzi": "宴"
    },
    {
      "id": "g5v1-l25-c03-u65a9",
      "lessonId": "g5v1-l25",
      "hanzi": "斩"
    },
    {
      "id": "g5v1-l25-c04-u51ef",
      "lessonId": "g5v1-l25",
      "hanzi": "凯"
    },
    {
      "id": "g5v1-l25-c05-u845b",
      "lessonId": "g5v1-l25",
      "hanzi": "葛"
    },
    {
      "id": "g5v1-l25-c06-u8ff0",
      "lessonId": "g5v1-l25",
      "hanzi": "述"
    },
    {
      "id": "g5v1-l25-c07-u4f20",
      "lessonId": "g5v1-l25",
      "hanzi": "传"
    },
    {
      "id": "g5v1-l25-c08-u9c81",
      "lessonId": "g5v1-l25",
      "hanzi": "鲁"
    },
    {
      "id": "g5v1-l25-c09-u715e",
      "lessonId": "g5v1-l25",
      "hanzi": "煞"
    },
    {
      "id": "g5v1-l25-c10-u5bc7",
      "lessonId": "g5v1-l25",
      "hanzi": "寇"
    },
    {
      "id": "g5v1-l25-c11-u8d3e",
      "lessonId": "g5v1-l25",
      "hanzi": "贾"
    },
    {
      "id": "g5v1-l25-c12-u5377",
      "lessonId": "g5v1-l25",
      "hanzi": "卷"
    },
    {
      "id": "g5v1-l25-c13-u520a",
      "lessonId": "g5v1-l25",
      "hanzi": "刊"
    },
    {
      "id": "g5v1-l25-c14-u7410",
      "lessonId": "g5v1-l25",
      "hanzi": "琐"
    },
    {
      "id": "g5v1-l25-c15-u547b",
      "lessonId": "g5v1-l25",
      "hanzi": "呻"
    },
    {
      "id": "g5v1-l25-c16-u67d0",
      "lessonId": "g5v1-l25",
      "hanzi": "某"
    },
    {
      "id": "g5v1-l25-c17-u6d25",
      "lessonId": "g5v1-l25",
      "hanzi": "津"
    },
    {
      "id": "g5v1-l25-c18-u9650",
      "lessonId": "g5v1-l25",
      "hanzi": "限"
    },
    {
      "id": "g5v1-l25-c19-u8870",
      "lessonId": "g5v1-l25",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l25-c20-u7edf",
      "lessonId": "g5v1-l25",
      "hanzi": "统"
    },
    {
      "id": "g5v1-l25-c21-u6734",
      "lessonId": "g5v1-l25",
      "hanzi": "朴"
    },
    {
      "id": "g5v1-l26-c01-u55bb",
      "lessonId": "g5v1-l26",
      "hanzi": "喻"
    },
    {
      "id": "g5v1-l26-c02-u5dee",
      "lessonId": "g5v1-l26",
      "hanzi": "差"
    },
    {
      "id": "g5v1-l26-c03-u763e",
      "lessonId": "g5v1-l26",
      "hanzi": "瘾"
    },
    {
      "id": "g5v1-l26-c04-u5954",
      "lessonId": "g5v1-l26",
      "hanzi": "奔"
    },
    {
      "id": "g5v1-l26-c05-u7c4d",
      "lessonId": "g5v1-l26",
      "hanzi": "籍"
    },
    {
      "id": "g5v1-l26-c06-u9965",
      "lessonId": "g5v1-l26",
      "hanzi": "饥"
    },
    {
      "id": "g5v1-l26-c07-u507f",
      "lessonId": "g5v1-l26",
      "hanzi": "偿"
    },
    {
      "id": "g5v1-l26-c08-u7538",
      "lessonId": "g5v1-l26",
      "hanzi": "甸"
    },
    {
      "id": "g5v1-l26-c09-u609f",
      "lessonId": "g5v1-l26",
      "hanzi": "悟"
    },
    {
      "id": "g5v1-l26-c10-u9988",
      "lessonId": "g5v1-l26",
      "hanzi": "馈"
    },
    {
      "id": "g5v1-l26-c11-u78c1",
      "lessonId": "g5v1-l26",
      "hanzi": "磁"
    },
    {
      "id": "g5v1-l26-c12-u9175",
      "lessonId": "g5v1-l26",
      "hanzi": "酵"
    },
    {
      "id": "g5v1-l26-c13-u768e",
      "lessonId": "g5v1-l26",
      "hanzi": "皎"
    },
    {
      "id": "g5v1-l26-c14-u9274",
      "lessonId": "g5v1-l26",
      "hanzi": "鉴"
    },
    {
      "id": "g5v1-l26-c15-u6ca5",
      "lessonId": "g5v1-l26",
      "hanzi": "沥"
    }
  ],
  "honglan": [
    {
      "id": "g5v1-l01-c01-u9e6d",
      "lessonId": "g5v1-l01",
      "hanzi": "鹭"
    },
    {
      "id": "g5v1-l01-c02-u5acc",
      "lessonId": "g5v1-l01",
      "hanzi": "嫌"
    },
    {
      "id": "g5v1-l01-c03-u5d4c",
      "lessonId": "g5v1-l01",
      "hanzi": "嵌"
    },
    {
      "id": "g5v1-l01-c04-u5323",
      "lessonId": "g5v1-l01",
      "hanzi": "匣"
    },
    {
      "id": "g5v1-l01-c05-u55dc",
      "lessonId": "g5v1-l01",
      "hanzi": "嗜"
    },
    {
      "id": "g5v1-l01-c06-u5b9c",
      "lessonId": "g5v1-l01",
      "hanzi": "宜"
    },
    {
      "id": "g5v1-l01-c07-u9e64",
      "lessonId": "g5v1-l01",
      "hanzi": "鹤"
    },
    {
      "id": "g5v1-l01-c08-u6731",
      "lessonId": "g5v1-l01",
      "hanzi": "朱"
    },
    {
      "id": "g5v1-l01-c09-u6846",
      "lessonId": "g5v1-l01",
      "hanzi": "框"
    },
    {
      "id": "g5v1-l01-c10-u54e8",
      "lessonId": "g5v1-l01",
      "hanzi": "哨"
    },
    {
      "id": "g5v1-l01-c11-u6069",
      "lessonId": "g5v1-l01",
      "hanzi": "恩"
    },
    {
      "id": "g5v1-l01-c12-u97f5",
      "lessonId": "g5v1-l01",
      "hanzi": "韵"
    },
    {
      "id": "g5v1-l02-c01-u4ea9",
      "lessonId": "g5v1-l02",
      "hanzi": "亩"
    },
    {
      "id": "g5v1-l02-c02-u5429",
      "lessonId": "g5v1-l02",
      "hanzi": "吩"
    },
    {
      "id": "g5v1-l02-c03-u69a8",
      "lessonId": "g5v1-l02",
      "hanzi": "榨"
    },
    {
      "id": "g5v1-l02-c04-u69b4",
      "lessonId": "g5v1-l02",
      "hanzi": "榴"
    },
    {
      "id": "g5v1-l02-c05-u77ee",
      "lessonId": "g5v1-l02",
      "hanzi": "矮"
    },
    {
      "id": "g5v1-l02-c06-u64ad",
      "lessonId": "g5v1-l02",
      "hanzi": "播"
    },
    {
      "id": "g5v1-l02-c07-u6d47",
      "lessonId": "g5v1-l02",
      "hanzi": "浇"
    },
    {
      "id": "g5v1-l02-c08-u5490",
      "lessonId": "g5v1-l02",
      "hanzi": "咐"
    },
    {
      "id": "g5v1-l02-c09-u4ead",
      "lessonId": "g5v1-l02",
      "hanzi": "亭"
    },
    {
      "id": "g5v1-l02-c10-u6155",
      "lessonId": "g5v1-l02",
      "hanzi": "慕"
    },
    {
      "id": "g5v1-l02-c11-u8c08",
      "lessonId": "g5v1-l02",
      "hanzi": "谈"
    },
    {
      "id": "g5v1-l03-c01-u7ba9",
      "lessonId": "g5v1-l03",
      "hanzi": "箩"
    },
    {
      "id": "g5v1-l03-c02-u676d",
      "lessonId": "g5v1-l03",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l03-c03-u61c2",
      "lessonId": "g5v1-l03",
      "hanzi": "懂"
    },
    {
      "id": "g5v1-l03-c04-u5170",
      "lessonId": "g5v1-l03",
      "hanzi": "兰"
    },
    {
      "id": "g5v1-l03-c05-u5a46",
      "lessonId": "g5v1-l03",
      "hanzi": "婆"
    },
    {
      "id": "g5v1-l03-c06-u7cd5",
      "lessonId": "g5v1-l03",
      "hanzi": "糕"
    },
    {
      "id": "g5v1-l03-c07-u997c",
      "lessonId": "g5v1-l03",
      "hanzi": "饼"
    },
    {
      "id": "g5v1-l03-c08-u6d78",
      "lessonId": "g5v1-l03",
      "hanzi": "浸"
    },
    {
      "id": "g5v1-l03-c09-u7f20",
      "lessonId": "g5v1-l03",
      "hanzi": "缠"
    },
    {
      "id": "g5v1-l03-c10-u8336",
      "lessonId": "g5v1-l03",
      "hanzi": "茶"
    },
    {
      "id": "g5v1-l03-c11-u6361",
      "lessonId": "g5v1-l03",
      "hanzi": "捡"
    },
    {
      "id": "g5v1-l04-c01-u8513",
      "lessonId": "g5v1-l04",
      "hanzi": "蔓"
    },
    {
      "id": "g5v1-l04-c02-u5e7d",
      "lessonId": "g5v1-l04",
      "hanzi": "幽"
    },
    {
      "id": "g5v1-l04-c03-u6089",
      "lessonId": "g5v1-l04",
      "hanzi": "悉"
    },
    {
      "id": "g5v1-l04-c04-u96cf",
      "lessonId": "g5v1-l04",
      "hanzi": "雏"
    },
    {
      "id": "g5v1-l04-c05-u54df",
      "lessonId": "g5v1-l04",
      "hanzi": "哟"
    },
    {
      "id": "g5v1-l04-c06-u67dc",
      "lessonId": "g5v1-l04",
      "hanzi": "柜"
    },
    {
      "id": "g5v1-l04-c07-u4eab",
      "lessonId": "g5v1-l04",
      "hanzi": "享"
    },
    {
      "id": "g5v1-l04-c08-u966a",
      "lessonId": "g5v1-l04",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l04-c09-u8db4",
      "lessonId": "g5v1-l04",
      "hanzi": "趴"
    },
    {
      "id": "g5v1-l04-c10-u7751",
      "lessonId": "g5v1-l04",
      "hanzi": "睑"
    },
    {
      "id": "g5v1-l04-c11-u7738",
      "lessonId": "g5v1-l04",
      "hanzi": "眸"
    },
    {
      "id": "g5v1-l04-c12-u5482",
      "lessonId": "g5v1-l04",
      "hanzi": "咂"
    },
    {
      "id": "g5v1-l05-c01-u6c5b",
      "lessonId": "g5v1-l05",
      "hanzi": "汛"
    },
    {
      "id": "g5v1-l05-c02-u633d",
      "lessonId": "g5v1-l05",
      "hanzi": "挽"
    },
    {
      "id": "g5v1-l05-c03-u95f4",
      "lessonId": "g5v1-l05",
      "hanzi": "间"
    },
    {
      "id": "g5v1-l05-c04-u60f0",
      "lessonId": "g5v1-l05",
      "hanzi": "惰"
    },
    {
      "id": "g5v1-l05-c05-u8861",
      "lessonId": "g5v1-l05",
      "hanzi": "衡"
    },
    {
      "id": "g5v1-l05-c06-u534f",
      "lessonId": "g5v1-l05",
      "hanzi": "协"
    },
    {
      "id": "g5v1-l05-c07-u7ef0",
      "lessonId": "g5v1-l05",
      "hanzi": "绰"
    },
    {
      "id": "g5v1-l05-c08-u6d2a",
      "lessonId": "g5v1-l05",
      "hanzi": "洪"
    },
    {
      "id": "g5v1-l05-c09-u8bbf",
      "lessonId": "g5v1-l05",
      "hanzi": "访"
    },
    {
      "id": "g5v1-l05-c10-u978b",
      "lessonId": "g5v1-l05",
      "hanzi": "鞋"
    },
    {
      "id": "g5v1-l05-c11-u9694",
      "lessonId": "g5v1-l05",
      "hanzi": "隔"
    },
    {
      "id": "g5v1-l05-c12-u61d2",
      "lessonId": "g5v1-l05",
      "hanzi": "懒"
    },
    {
      "id": "g5v1-l05-c13-u7a33",
      "lessonId": "g5v1-l05",
      "hanzi": "稳"
    },
    {
      "id": "g5v1-l05-c14-u514d",
      "lessonId": "g5v1-l05",
      "hanzi": "免"
    },
    {
      "id": "g5v1-l06-c01-u74a7",
      "lessonId": "g5v1-l06",
      "hanzi": "璧"
    },
    {
      "id": "g5v1-l06-c02-u81e3",
      "lessonId": "g5v1-l06",
      "hanzi": "臣"
    },
    {
      "id": "g5v1-l06-c03-u5f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "强"
    },
    {
      "id": "g5v1-l06-c04-u8bfa",
      "lessonId": "g5v1-l06",
      "hanzi": "诺"
    },
    {
      "id": "g5v1-l06-c05-u5212",
      "lessonId": "g5v1-l06",
      "hanzi": "划"
    },
    {
      "id": "g5v1-l06-c06-u5178",
      "lessonId": "g5v1-l06",
      "hanzi": "典"
    },
    {
      "id": "g5v1-l06-c07-u7f6a",
      "lessonId": "g5v1-l06",
      "hanzi": "罪"
    },
    {
      "id": "g5v1-l06-c08-u5ec9",
      "lessonId": "g5v1-l06",
      "hanzi": "廉"
    },
    {
      "id": "g5v1-l06-c09-u62b5",
      "lessonId": "g5v1-l06",
      "hanzi": "抵"
    },
    {
      "id": "g5v1-l06-c10-u5fa1",
      "lessonId": "g5v1-l06",
      "hanzi": "御"
    },
    {
      "id": "g5v1-l06-c11-u8f9e",
      "lessonId": "g5v1-l06",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l06-c12-u8fb1",
      "lessonId": "g5v1-l06",
      "hanzi": "辱"
    },
    {
      "id": "g5v1-l06-c13-u64c5",
      "lessonId": "g5v1-l06",
      "hanzi": "擅"
    },
    {
      "id": "g5v1-l06-c14-u7f36",
      "lessonId": "g5v1-l06",
      "hanzi": "缶"
    },
    {
      "id": "g5v1-l06-c15-u537f",
      "lessonId": "g5v1-l06",
      "hanzi": "卿"
    },
    {
      "id": "g5v1-l06-c16-u524a",
      "lessonId": "g5v1-l06",
      "hanzi": "削"
    },
    {
      "id": "g5v1-l06-c17-u888d",
      "lessonId": "g5v1-l06",
      "hanzi": "袍"
    },
    {
      "id": "g5v1-l06-c18-u53ec",
      "lessonId": "g5v1-l06",
      "hanzi": "召"
    },
    {
      "id": "g5v1-l06-c19-u8bae",
      "lessonId": "g5v1-l06",
      "hanzi": "议"
    },
    {
      "id": "g5v1-l06-c20-u7f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "缺"
    },
    {
      "id": "g5v1-l06-c21-u5bab",
      "lessonId": "g5v1-l06",
      "hanzi": "宫"
    },
    {
      "id": "g5v1-l06-c22-u732e",
      "lessonId": "g5v1-l06",
      "hanzi": "献"
    },
    {
      "id": "g5v1-l06-c23-u627f",
      "lessonId": "g5v1-l06",
      "hanzi": "承"
    },
    {
      "id": "g5v1-l06-c24-u6284",
      "lessonId": "g5v1-l06",
      "hanzi": "抄"
    },
    {
      "id": "g5v1-l06-c25-u602f",
      "lessonId": "g5v1-l06",
      "hanzi": "怯"
    },
    {
      "id": "g5v1-l06-c26-u62d2",
      "lessonId": "g5v1-l06",
      "hanzi": "拒"
    },
    {
      "id": "g5v1-l06-c27-u8346",
      "lessonId": "g5v1-l06",
      "hanzi": "荆"
    },
    {
      "id": "g5v1-l07-c01-u9e35",
      "lessonId": "g5v1-l07",
      "hanzi": "鸵"
    },
    {
      "id": "g5v1-l07-c02-u8d62",
      "lessonId": "g5v1-l07",
      "hanzi": "赢"
    },
    {
      "id": "g5v1-l07-c03-u51a0",
      "lessonId": "g5v1-l07",
      "hanzi": "冠"
    },
    {
      "id": "g5v1-l07-c04-u4fef",
      "lessonId": "g5v1-l07",
      "hanzi": "俯"
    },
    {
      "id": "g5v1-l07-c05-u55b7",
      "lessonId": "g5v1-l07",
      "hanzi": "喷"
    },
    {
      "id": "g5v1-l07-c06-u679a",
      "lessonId": "g5v1-l07",
      "hanzi": "枚"
    },
    {
      "id": "g5v1-l07-c07-u7bad",
      "lessonId": "g5v1-l07",
      "hanzi": "箭"
    },
    {
      "id": "g5v1-l07-c08-u6d69",
      "lessonId": "g5v1-l07",
      "hanzi": "浩"
    },
    {
      "id": "g5v1-l07-c09-u7b52",
      "lessonId": "g5v1-l07",
      "hanzi": "筒"
    },
    {
      "id": "g5v1-l07-c10-u675f",
      "lessonId": "g5v1-l07",
      "hanzi": "束"
    },
    {
      "id": "g5v1-l07-c11-u8d64",
      "lessonId": "g5v1-l07",
      "hanzi": "赤"
    },
    {
      "id": "g5v1-l07-c12-u5708",
      "lessonId": "g5v1-l07",
      "hanzi": "圈"
    },
    {
      "id": "g5v1-l07-c13-u7f6e",
      "lessonId": "g5v1-l07",
      "hanzi": "置"
    },
    {
      "id": "g5v1-l08-c01-u4fb5",
      "lessonId": "g5v1-l08",
      "hanzi": "侵"
    },
    {
      "id": "g5v1-l08-c02-u7565",
      "lessonId": "g5v1-l08",
      "hanzi": "略"
    },
    {
      "id": "g5v1-l08-c03-u5792",
      "lessonId": "g5v1-l08",
      "hanzi": "垒"
    },
    {
      "id": "g5v1-l08-c04-u4efb",
      "lessonId": "g5v1-l08",
      "hanzi": "任"
    },
    {
      "id": "g5v1-l08-c05-u4e18",
      "lessonId": "g5v1-l08",
      "hanzi": "丘"
    },
    {
      "id": "g5v1-l08-c06-u6401",
      "lessonId": "g5v1-l08",
      "hanzi": "搁"
    },
    {
      "id": "g5v1-l08-c07-u9677",
      "lessonId": "g5v1-l08",
      "hanzi": "陷"
    },
    {
      "id": "g5v1-l08-c08-u62d0",
      "lessonId": "g5v1-l08",
      "hanzi": "拐"
    },
    {
      "id": "g5v1-l08-c09-u5c94",
      "lessonId": "g5v1-l08",
      "hanzi": "岔"
    },
    {
      "id": "g5v1-l08-c10-u7b51",
      "lessonId": "g5v1-l08",
      "hanzi": "筑"
    },
    {
      "id": "g5v1-l08-c11-u5821",
      "lessonId": "g5v1-l08",
      "hanzi": "堡"
    },
    {
      "id": "g5v1-l08-c12-u515a",
      "lessonId": "g5v1-l08",
      "hanzi": "党"
    },
    {
      "id": "g5v1-l08-c13-u59a8",
      "lessonId": "g5v1-l08",
      "hanzi": "妨"
    },
    {
      "id": "g5v1-l08-c14-u853d",
      "lessonId": "g5v1-l08",
      "hanzi": "蔽"
    },
    {
      "id": "g5v1-l09-c01-u916c",
      "lessonId": "g5v1-l09",
      "hanzi": "酬"
    },
    {
      "id": "g5v1-l09-c02-u8a93",
      "lessonId": "g5v1-l09",
      "hanzi": "誓"
    },
    {
      "id": "g5v1-l09-c03-u8c0e",
      "lessonId": "g5v1-l09",
      "hanzi": "谎"
    },
    {
      "id": "g5v1-l09-c04-u727a",
      "lessonId": "g5v1-l09",
      "hanzi": "牺"
    },
    {
      "id": "g5v1-l09-c05-u73cd",
      "lessonId": "g5v1-l09",
      "hanzi": "珍"
    },
    {
      "id": "g5v1-l09-c06-u53ee",
      "lessonId": "g5v1-l09",
      "hanzi": "叮"
    },
    {
      "id": "g5v1-l09-c07-u5631",
      "lessonId": "g5v1-l09",
      "hanzi": "嘱"
    },
    {
      "id": "g5v1-l09-c08-u584c",
      "lessonId": "g5v1-l09",
      "hanzi": "塌"
    },
    {
      "id": "g5v1-l09-c09-u7126",
      "lessonId": "g5v1-l09",
      "hanzi": "焦"
    },
    {
      "id": "g5v1-l09-c10-u5ef6",
      "lessonId": "g5v1-l09",
      "hanzi": "延"
    },
    {
      "id": "g5v1-l09-c11-u707e",
      "lessonId": "g5v1-l09",
      "hanzi": "灾"
    },
    {
      "id": "g5v1-l09-c12-u6094",
      "lessonId": "g5v1-l09",
      "hanzi": "悔"
    },
    {
      "id": "g5v1-l09-c13-u6276",
      "lessonId": "g5v1-l09",
      "hanzi": "扶"
    },
    {
      "id": "g5v1-l10-c01-u5ac2",
      "lessonId": "g5v1-l10",
      "hanzi": "嫂"
    },
    {
      "id": "g5v1-l10-c02-u6073",
      "lessonId": "g5v1-l10",
      "hanzi": "恳"
    },
    {
      "id": "g5v1-l10-c03-u7b5b",
      "lessonId": "g5v1-l10",
      "hanzi": "筛"
    },
    {
      "id": "g5v1-l10-c04-u6b79",
      "lessonId": "g5v1-l10",
      "hanzi": "歹"
    },
    {
      "id": "g5v1-l10-c05-u7f55",
      "lessonId": "g5v1-l10",
      "hanzi": "罕"
    },
    {
      "id": "g5v1-l10-c06-u68ad",
      "lessonId": "g5v1-l10",
      "hanzi": "梭"
    },
    {
      "id": "g5v1-l10-c07-u76d1",
      "lessonId": "g5v1-l10",
      "hanzi": "监"
    },
    {
      "id": "g5v1-l10-c08-u72f1",
      "lessonId": "g5v1-l10",
      "hanzi": "狱"
    },
    {
      "id": "g5v1-l10-c09-u917f",
      "lessonId": "g5v1-l10",
      "hanzi": "酿"
    },
    {
      "id": "g5v1-l10-c10-u778c",
      "lessonId": "g5v1-l10",
      "hanzi": "瞌"
    },
    {
      "id": "g5v1-l10-c11-u843d",
      "lessonId": "g5v1-l10",
      "hanzi": "落"
    },
    {
      "id": "g5v1-l10-c12-u5a5a",
      "lessonId": "g5v1-l10",
      "hanzi": "婚"
    },
    {
      "id": "g5v1-l10-c13-u90ce",
      "lessonId": "g5v1-l10",
      "hanzi": "郎"
    },
    {
      "id": "g5v1-l10-c14-u7239",
      "lessonId": "g5v1-l10",
      "hanzi": "爹"
    },
    {
      "id": "g5v1-l10-c15-u8f86",
      "lessonId": "g5v1-l10",
      "hanzi": "辆"
    },
    {
      "id": "g5v1-l10-c16-u7eb1",
      "lessonId": "g5v1-l10",
      "hanzi": "纱"
    },
    {
      "id": "g5v1-l10-c17-u59bb",
      "lessonId": "g5v1-l10",
      "hanzi": "妻"
    },
    {
      "id": "g5v1-l10-c18-u8d9f",
      "lessonId": "g5v1-l10",
      "hanzi": "趟"
    },
    {
      "id": "g5v1-l10-c19-u6258",
      "lessonId": "g5v1-l10",
      "hanzi": "托"
    },
    {
      "id": "g5v1-l10-c20-u6e9c",
      "lessonId": "g5v1-l10",
      "hanzi": "溜"
    },
    {
      "id": "g5v1-l10-c21-u8f88",
      "lessonId": "g5v1-l10",
      "hanzi": "辈"
    },
    {
      "id": "g5v1-l10-c22-u6328",
      "lessonId": "g5v1-l10",
      "hanzi": "挨"
    },
    {
      "id": "g5v1-l11-c01-u4fed",
      "lessonId": "g5v1-l11",
      "hanzi": "俭"
    },
    {
      "id": "g5v1-l11-c02-u7687",
      "lessonId": "g5v1-l11",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l11-c03-u504e",
      "lessonId": "g5v1-l11",
      "hanzi": "偎"
    },
    {
      "id": "g5v1-l11-c04-u8870",
      "lessonId": "g5v1-l11",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l11-c05-u73ca",
      "lessonId": "g5v1-l11",
      "hanzi": "珊"
    },
    {
      "id": "g5v1-l11-c06-u745a",
      "lessonId": "g5v1-l11",
      "hanzi": "瑚"
    },
    {
      "id": "g5v1-l11-c07-u7901",
      "lessonId": "g5v1-l11",
      "hanzi": "礁"
    },
    {
      "id": "g5v1-l11-c08-u7b50",
      "lessonId": "g5v1-l11",
      "hanzi": "筐"
    },
    {
      "id": "g5v1-l11-c09-u62d7",
      "lessonId": "g5v1-l11",
      "hanzi": "拗"
    },
    {
      "id": "g5v1-l12-c01-u4e43",
      "lessonId": "g5v1-l12",
      "hanzi": "乃"
    },
    {
      "id": "g5v1-l12-c02-u718f",
      "lessonId": "g5v1-l12",
      "hanzi": "熏"
    },
    {
      "id": "g5v1-l12-c03-u4ea5",
      "lessonId": "g5v1-l12",
      "hanzi": "亥"
    },
    {
      "id": "g5v1-l12-c04-u6043",
      "lessonId": "g5v1-l12",
      "hanzi": "恃"
    },
    {
      "id": "g5v1-l12-c05-u64de",
      "lessonId": "g5v1-l12",
      "hanzi": "擞"
    },
    {
      "id": "g5v1-l12-c06-u796d",
      "lessonId": "g5v1-l12",
      "hanzi": "祭"
    },
    {
      "id": "g5v1-l12-c07-u676d",
      "lessonId": "g5v1-l12",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l12-c08-u54c0",
      "lessonId": "g5v1-l12",
      "hanzi": "哀"
    },
    {
      "id": "g5v1-l12-c09-u62d8",
      "lessonId": "g5v1-l12",
      "hanzi": "拘"
    },
    {
      "id": "g5v1-l13-c01-u6cfb",
      "lessonId": "g5v1-l13",
      "hanzi": "泻"
    },
    {
      "id": "g5v1-l13-c02-u9cde",
      "lessonId": "g5v1-l13",
      "hanzi": "鳞"
    },
    {
      "id": "g5v1-l13-c03-u60f6",
      "lessonId": "g5v1-l13",
      "hanzi": "惶"
    },
    {
      "id": "g5v1-l13-c04-u80ce",
      "lessonId": "g5v1-l13",
      "hanzi": "胎"
    },
    {
      "id": "g5v1-l13-c05-u5c65",
      "lessonId": "g5v1-l13",
      "hanzi": "履"
    },
    {
      "id": "g5v1-l13-c06-u54c9",
      "lessonId": "g5v1-l13",
      "hanzi": "哉"
    },
    {
      "id": "g5v1-l13-c07-u6f5c",
      "lessonId": "g5v1-l13",
      "hanzi": "潜"
    },
    {
      "id": "g5v1-l13-c08-u8bd5",
      "lessonId": "g5v1-l13",
      "hanzi": "试"
    },
    {
      "id": "g5v1-l13-c09-u7687",
      "lessonId": "g5v1-l13",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l13-c10-u7eb5",
      "lessonId": "g5v1-l13",
      "hanzi": "纵"
    },
    {
      "id": "g5v1-l13-c11-u7586",
      "lessonId": "g5v1-l13",
      "hanzi": "疆"
    },
    {
      "id": "g5v1-l14-c01-u4f30",
      "lessonId": "g5v1-l14",
      "hanzi": "估"
    },
    {
      "id": "g5v1-l14-c02-u714c",
      "lessonId": "g5v1-l14",
      "hanzi": "煌"
    },
    {
      "id": "g5v1-l14-c03-u73d1",
      "lessonId": "g5v1-l14",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l14-c04-u5254",
      "lessonId": "g5v1-l14",
      "hanzi": "剔"
    },
    {
      "id": "g5v1-l14-c05-u6f9c",
      "lessonId": "g5v1-l14",
      "hanzi": "澜"
    },
    {
      "id": "g5v1-l14-c06-u7476",
      "lessonId": "g5v1-l14",
      "hanzi": "瑶"
    },
    {
      "id": "g5v1-l14-c07-u9675",
      "lessonId": "g5v1-l14",
      "hanzi": "陵"
    },
    {
      "id": "g5v1-l14-c08-u5b8f",
      "lessonId": "g5v1-l14",
      "hanzi": "宏"
    },
    {
      "id": "g5v1-l14-c09-u5949",
      "lessonId": "g5v1-l14",
      "hanzi": "奉"
    },
    {
      "id": "g5v1-l14-c10-u70ec",
      "lessonId": "g5v1-l14",
      "hanzi": "烬"
    },
    {
      "id": "g5v1-l14-c11-u6bc1",
      "lessonId": "g5v1-l14",
      "hanzi": "毁"
    },
    {
      "id": "g5v1-l14-c12-u635f",
      "lessonId": "g5v1-l14",
      "hanzi": "损"
    },
    {
      "id": "g5v1-l14-c13-u62f1",
      "lessonId": "g5v1-l14",
      "hanzi": "拱"
    },
    {
      "id": "g5v1-l14-c14-u8f89",
      "lessonId": "g5v1-l14",
      "hanzi": "辉"
    },
    {
      "id": "g5v1-l14-c15-u6bbf",
      "lessonId": "g5v1-l14",
      "hanzi": "殿"
    },
    {
      "id": "g5v1-l14-c16-u89c8",
      "lessonId": "g5v1-l14",
      "hanzi": "览"
    },
    {
      "id": "g5v1-l14-c17-u5883",
      "lessonId": "g5v1-l14",
      "hanzi": "境"
    },
    {
      "id": "g5v1-l14-c18-u5510",
      "lessonId": "g5v1-l14",
      "hanzi": "唐"
    },
    {
      "id": "g5v1-l14-c19-u95ef",
      "lessonId": "g5v1-l14",
      "hanzi": "闯"
    },
    {
      "id": "g5v1-l14-c20-u9500",
      "lessonId": "g5v1-l14",
      "hanzi": "销"
    },
    {
      "id": "g5v1-l15-c01-u7792",
      "lessonId": "g5v1-l15",
      "hanzi": "瞒"
    },
    {
      "id": "g5v1-l15-c02-u57df",
      "lessonId": "g5v1-l15",
      "hanzi": "域"
    },
    {
      "id": "g5v1-l15-c03-u8247",
      "lessonId": "g5v1-l15",
      "hanzi": "艇"
    },
    {
      "id": "g5v1-l15-c04-u77db",
      "lessonId": "g5v1-l15",
      "hanzi": "矛"
    },
    {
      "id": "g5v1-l15-c05-u76fe",
      "lessonId": "g5v1-l15",
      "hanzi": "盾"
    },
    {
      "id": "g5v1-l15-c06-u7b77",
      "lessonId": "g5v1-l15",
      "hanzi": "筷"
    },
    {
      "id": "g5v1-l15-c07-u708a",
      "lessonId": "g5v1-l15",
      "hanzi": "炊"
    },
    {
      "id": "g5v1-l15-c08-u54fc",
      "lessonId": "g5v1-l15",
      "hanzi": "哼"
    },
    {
      "id": "g5v1-l15-c09-u5589",
      "lessonId": "g5v1-l15",
      "hanzi": "喉"
    },
    {
      "id": "g5v1-l15-c10-u5499",
      "lessonId": "g5v1-l15",
      "hanzi": "咙"
    },
    {
      "id": "g5v1-l15-c11-u54fd",
      "lessonId": "g5v1-l15",
      "hanzi": "哽"
    },
    {
      "id": "g5v1-l15-c12-u52fa",
      "lessonId": "g5v1-l15",
      "hanzi": "勺"
    },
    {
      "id": "g5v1-l15-c13-u6405",
      "lessonId": "g5v1-l15",
      "hanzi": "搅"
    },
    {
      "id": "g5v1-l15-c14-u8200",
      "lessonId": "g5v1-l15",
      "hanzi": "舀"
    },
    {
      "id": "g5v1-l16-c01-u6444",
      "lessonId": "g5v1-l16",
      "hanzi": "摄"
    },
    {
      "id": "g5v1-l16-c02-u6b96",
      "lessonId": "g5v1-l16",
      "hanzi": "殖"
    },
    {
      "id": "g5v1-l16-c03-u70ad",
      "lessonId": "g5v1-l16",
      "hanzi": "炭"
    },
    {
      "id": "g5v1-l16-c04-u7597",
      "lessonId": "g5v1-l16",
      "hanzi": "疗"
    },
    {
      "id": "g5v1-l16-c05-u6c0f",
      "lessonId": "g5v1-l16",
      "hanzi": "氏"
    },
    {
      "id": "g5v1-l16-c06-u7cae",
      "lessonId": "g5v1-l16",
      "hanzi": "粮"
    },
    {
      "id": "g5v1-l16-c07-u533a",
      "lessonId": "g5v1-l16",
      "hanzi": "区"
    },
    {
      "id": "g5v1-l16-c08-u6740",
      "lessonId": "g5v1-l16",
      "hanzi": "杀"
    },
    {
      "id": "g5v1-l16-c09-u83cc",
      "lessonId": "g5v1-l16",
      "hanzi": "菌"
    },
    {
      "id": "g5v1-l17-c01-u9a6f",
      "lessonId": "g5v1-l17",
      "hanzi": "驯"
    },
    {
      "id": "g5v1-l17-c02-u77eb",
      "lessonId": "g5v1-l17",
      "hanzi": "矫"
    },
    {
      "id": "g5v1-l17-c03-u6b47",
      "lessonId": "g5v1-l17",
      "hanzi": "歇"
    },
    {
      "id": "g5v1-l17-c04-u6748",
      "lessonId": "g5v1-l17",
      "hanzi": "杈"
    },
    {
      "id": "g5v1-l17-c05-u85d3",
      "lessonId": "g5v1-l17",
      "hanzi": "藓"
    },
    {
      "id": "g5v1-l17-c06-u72ed",
      "lessonId": "g5v1-l17",
      "hanzi": "狭"
    },
    {
      "id": "g5v1-l17-c07-u52c9",
      "lessonId": "g5v1-l17",
      "hanzi": "勉"
    },
    {
      "id": "g5v1-l17-c08-u9525",
      "lessonId": "g5v1-l17",
      "hanzi": "锥"
    },
    {
      "id": "g5v1-l17-c09-u9f20",
      "lessonId": "g5v1-l17",
      "hanzi": "鼠"
    },
    {
      "id": "g5v1-l17-c10-u79c0",
      "lessonId": "g5v1-l17",
      "hanzi": "秀"
    },
    {
      "id": "g5v1-l17-c11-u73b2",
      "lessonId": "g5v1-l17",
      "hanzi": "玲"
    },
    {
      "id": "g5v1-l17-c12-u73d1",
      "lessonId": "g5v1-l17",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l17-c13-u5e3d",
      "lessonId": "g5v1-l17",
      "hanzi": "帽"
    },
    {
      "id": "g5v1-l17-c14-u5c3e",
      "lessonId": "g5v1-l17",
      "hanzi": "尾"
    },
    {
      "id": "g5v1-l17-c15-u7a9d",
      "lessonId": "g5v1-l17",
      "hanzi": "窝"
    },
    {
      "id": "g5v1-l17-c16-u6ed1",
      "lessonId": "g5v1-l17",
      "hanzi": "滑"
    },
    {
      "id": "g5v1-l17-c17-u62fe",
      "lessonId": "g5v1-l17",
      "hanzi": "拾"
    },
    {
      "id": "g5v1-l17-c18-u68b3",
      "lessonId": "g5v1-l17",
      "hanzi": "梳"
    },
    {
      "id": "g5v1-l18-c01-u9b44",
      "lessonId": "g5v1-l18",
      "hanzi": "魄"
    },
    {
      "id": "g5v1-l18-c02-u6291",
      "lessonId": "g5v1-l18",
      "hanzi": "抑"
    },
    {
      "id": "g5v1-l18-c03-u9893",
      "lessonId": "g5v1-l18",
      "hanzi": "颓"
    },
    {
      "id": "g5v1-l18-c04-u7eab",
      "lessonId": "g5v1-l18",
      "hanzi": "纫"
    },
    {
      "id": "g5v1-l18-c05-u566a",
      "lessonId": "g5v1-l18",
      "hanzi": "噪"
    },
    {
      "id": "g5v1-l18-c06-u8910",
      "lessonId": "g5v1-l18",
      "hanzi": "褐"
    },
    {
      "id": "g5v1-l18-c07-u60eb",
      "lessonId": "g5v1-l18",
      "hanzi": "惫"
    },
    {
      "id": "g5v1-l18-c08-u803d",
      "lessonId": "g5v1-l18",
      "hanzi": "耽"
    },
    {
      "id": "g5v1-l18-c09-u515c",
      "lessonId": "g5v1-l18",
      "hanzi": "兜"
    },
    {
      "id": "g5v1-l18-c10-u6743",
      "lessonId": "g5v1-l18",
      "hanzi": "权"
    },
    {
      "id": "g5v1-l18-c11-u8f9e",
      "lessonId": "g5v1-l18",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l18-c12-u788c",
      "lessonId": "g5v1-l18",
      "hanzi": "碌"
    },
    {
      "id": "g5v1-l18-c13-u540a",
      "lessonId": "g5v1-l18",
      "hanzi": "吊"
    },
    {
      "id": "g5v1-l18-c14-u9177",
      "lessonId": "g5v1-l18",
      "hanzi": "酷"
    },
    {
      "id": "g5v1-l18-c15-u6691",
      "lessonId": "g5v1-l18",
      "hanzi": "暑"
    },
    {
      "id": "g5v1-l18-c16-u810a",
      "lessonId": "g5v1-l18",
      "hanzi": "脊"
    },
    {
      "id": "g5v1-l18-c17-u7f69",
      "lessonId": "g5v1-l18",
      "hanzi": "罩"
    },
    {
      "id": "g5v1-l18-c18-u7adf",
      "lessonId": "g5v1-l18",
      "hanzi": "竟"
    },
    {
      "id": "g5v1-l18-c19-u54c7",
      "lessonId": "g5v1-l18",
      "hanzi": "哇"
    },
    {
      "id": "g5v1-l18-c20-u5fcd",
      "lessonId": "g5v1-l18",
      "hanzi": "忍"
    },
    {
      "id": "g5v1-l18-c21-u68b0",
      "lessonId": "g5v1-l18",
      "hanzi": "械"
    },
    {
      "id": "g5v1-l18-c22-u9178",
      "lessonId": "g5v1-l18",
      "hanzi": "酸"
    },
    {
      "id": "g5v1-l19-c01-u8327",
      "lessonId": "g5v1-l19",
      "hanzi": "茧"
    },
    {
      "id": "g5v1-l19-c02-u6808",
      "lessonId": "g5v1-l19",
      "hanzi": "栈"
    },
    {
      "id": "g5v1-l19-c03-u51a4",
      "lessonId": "g5v1-l19",
      "hanzi": "冤"
    },
    {
      "id": "g5v1-l19-c04-u6789",
      "lessonId": "g5v1-l19",
      "hanzi": "枉"
    },
    {
      "id": "g5v1-l19-c05-u604d",
      "lessonId": "g5v1-l19",
      "hanzi": "恍"
    },
    {
      "id": "g5v1-l19-c06-u60da",
      "lessonId": "g5v1-l19",
      "hanzi": "惚"
    },
    {
      "id": "g5v1-l19-c07-u8df7",
      "lessonId": "g5v1-l19",
      "hanzi": "跷"
    },
    {
      "id": "g5v1-l19-c08-u50fb",
      "lessonId": "g5v1-l19",
      "hanzi": "僻"
    },
    {
      "id": "g5v1-l19-c09-u59d4",
      "lessonId": "g5v1-l19",
      "hanzi": "委"
    },
    {
      "id": "g5v1-l19-c10-u8fea",
      "lessonId": "g5v1-l19",
      "hanzi": "迪"
    },
    {
      "id": "g5v1-l19-c11-u5ac1",
      "lessonId": "g5v1-l19",
      "hanzi": "嫁"
    },
    {
      "id": "g5v1-l19-c12-u7f34",
      "lessonId": "g5v1-l19",
      "hanzi": "缴"
    },
    {
      "id": "g5v1-l19-c13-u699c",
      "lessonId": "g5v1-l19",
      "hanzi": "榜"
    },
    {
      "id": "g5v1-l19-c14-u517c",
      "lessonId": "g5v1-l19",
      "hanzi": "兼"
    },
    {
      "id": "g5v1-l19-c15-u5632",
      "lessonId": "g5v1-l19",
      "hanzi": "嘲"
    },
    {
      "id": "g5v1-l19-c16-u6795",
      "lessonId": "g5v1-l19",
      "hanzi": "枕"
    },
    {
      "id": "g5v1-l19-c17-u8695",
      "lessonId": "g5v1-l19",
      "hanzi": "蚕"
    },
    {
      "id": "g5v1-l19-c18-u8003",
      "lessonId": "g5v1-l19",
      "hanzi": "考"
    },
    {
      "id": "g5v1-l19-c19-u75bc",
      "lessonId": "g5v1-l19",
      "hanzi": "疼"
    },
    {
      "id": "g5v1-l19-c20-u5e2d",
      "lessonId": "g5v1-l19",
      "hanzi": "席"
    },
    {
      "id": "g5v1-l19-c21-u7cd6",
      "lessonId": "g5v1-l19",
      "hanzi": "糖"
    },
    {
      "id": "g5v1-l19-c22-u5c51",
      "lessonId": "g5v1-l19",
      "hanzi": "屑"
    },
    {
      "id": "g5v1-l19-c23-u9489",
      "lessonId": "g5v1-l19",
      "hanzi": "钉"
    },
    {
      "id": "g5v1-l19-c24-u966a",
      "lessonId": "g5v1-l19",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l19-c25-u6bd5",
      "lessonId": "g5v1-l19",
      "hanzi": "毕"
    },
    {
      "id": "g5v1-l19-c26-u716e",
      "lessonId": "g5v1-l19",
      "hanzi": "煮"
    },
    {
      "id": "g5v1-l20-c01-u817c",
      "lessonId": "g5v1-l20",
      "hanzi": "腼"
    },
    {
      "id": "g5v1-l20-c02-u8146",
      "lessonId": "g5v1-l20",
      "hanzi": "腆"
    },
    {
      "id": "g5v1-l20-c03-u8a8a",
      "lessonId": "g5v1-l20",
      "hanzi": "誊"
    },
    {
      "id": "g5v1-l20-c04-u52b1",
      "lessonId": "g5v1-l20",
      "hanzi": "励"
    },
    {
      "id": "g5v1-l20-c05-u7248",
      "lessonId": "g5v1-l20",
      "hanzi": "版"
    },
    {
      "id": "g5v1-l20-c06-u7965",
      "lessonId": "g5v1-l20",
      "hanzi": "祥"
    },
    {
      "id": "g5v1-l20-c07-u6b67",
      "lessonId": "g5v1-l20",
      "hanzi": "歧"
    },
    {
      "id": "g5v1-l20-c08-u8c28",
      "lessonId": "g5v1-l20",
      "hanzi": "谨"
    },
    {
      "id": "g5v1-l21-c01-u6986",
      "lessonId": "g5v1-l21",
      "hanzi": "榆"
    },
    {
      "id": "g5v1-l21-c02-u7554",
      "lessonId": "g5v1-l21",
      "hanzi": "畔"
    },
    {
      "id": "g5v1-l21-c03-u66f4",
      "lessonId": "g5v1-l21",
      "hanzi": "更"
    },
    {
      "id": "g5v1-l21-c04-u8052",
      "lessonId": "g5v1-l21",
      "hanzi": "聒"
    },
    {
      "id": "g5v1-l21-c05-u5b59",
      "lessonId": "g5v1-l21",
      "hanzi": "孙"
    },
    {
      "id": "g5v1-l21-c06-u6cca",
      "lessonId": "g5v1-l21",
      "hanzi": "泊"
    },
    {
      "id": "g5v1-l21-c07-u6101",
      "lessonId": "g5v1-l21",
      "hanzi": "愁"
    },
    {
      "id": "g5v1-l21-c08-u5bfa",
      "lessonId": "g5v1-l21",
      "hanzi": "寺"
    },
    {
      "id": "g5v1-l22-c01-u6868",
      "lessonId": "g5v1-l22",
      "hanzi": "桨"
    },
    {
      "id": "g5v1-l22-c02-u6869",
      "lessonId": "g5v1-l22",
      "hanzi": "桩"
    },
    {
      "id": "g5v1-l22-c03-u6687",
      "lessonId": "g5v1-l22",
      "hanzi": "暇"
    },
    {
      "id": "g5v1-l22-c04-u6995",
      "lessonId": "g5v1-l22",
      "hanzi": "榕"
    },
    {
      "id": "g5v1-l22-c05-u7ea0",
      "lessonId": "g5v1-l22",
      "hanzi": "纠"
    },
    {
      "id": "g5v1-l22-c06-u8000",
      "lessonId": "g5v1-l22",
      "hanzi": "耀"
    },
    {
      "id": "g5v1-l22-c07-u6da8",
      "lessonId": "g5v1-l22",
      "hanzi": "涨"
    },
    {
      "id": "g5v1-l22-c08-u5854",
      "lessonId": "g5v1-l22",
      "hanzi": "塔"
    },
    {
      "id": "g5v1-l22-c09-u68a2",
      "lessonId": "g5v1-l22",
      "hanzi": "梢"
    },
    {
      "id": "g5v1-l22-c10-u7709",
      "lessonId": "g5v1-l22",
      "hanzi": "眉"
    },
    {
      "id": "g5v1-l22-c11-u629b",
      "lessonId": "g5v1-l22",
      "hanzi": "抛"
    },
    {
      "id": "g5v1-l23-c01-u6084",
      "lessonId": "g5v1-l23",
      "hanzi": "悄"
    },
    {
      "id": "g5v1-l23-c02-u7d2f",
      "lessonId": "g5v1-l23",
      "hanzi": "累"
    },
    {
      "id": "g5v1-l23-c03-u5ae6",
      "lessonId": "g5v1-l23",
      "hanzi": "嫦"
    },
    {
      "id": "g5v1-l23-c04-u5a25",
      "lessonId": "g5v1-l23",
      "hanzi": "娥"
    },
    {
      "id": "g5v1-l23-c05-u5ac9",
      "lessonId": "g5v1-l23",
      "hanzi": "嫉"
    },
    {
      "id": "g5v1-l23-c06-u5992",
      "lessonId": "g5v1-l23",
      "hanzi": "妒"
    },
    {
      "id": "g5v1-l23-c07-u74f7",
      "lessonId": "g5v1-l23",
      "hanzi": "瓷"
    },
    {
      "id": "g5v1-l24-c01-u803b",
      "lessonId": "g5v1-l24",
      "hanzi": "耻"
    },
    {
      "id": "g5v1-l24-c02-u8bc6",
      "lessonId": "g5v1-l24",
      "hanzi": "识"
    },
    {
      "id": "g5v1-l24-c03-u5bdd",
      "lessonId": "g5v1-l24",
      "hanzi": "寝"
    },
    {
      "id": "g5v1-l24-c04-u77e3",
      "lessonId": "g5v1-l24",
      "hanzi": "矣"
    },
    {
      "id": "g5v1-l24-c05-u5c82",
      "lessonId": "g5v1-l24",
      "hanzi": "岂"
    },
    {
      "id": "g5v1-l24-c06-u8bf2",
      "lessonId": "g5v1-l24",
      "hanzi": "诲"
    },
    {
      "id": "g5v1-l24-c07-u8c13",
      "lessonId": "g5v1-l24",
      "hanzi": "谓"
    },
    {
      "id": "g5v1-l24-c08-u8bf5",
      "lessonId": "g5v1-l24",
      "hanzi": "诵"
    },
    {
      "id": "g5v1-l25-c01-u8205",
      "lessonId": "g5v1-l25",
      "hanzi": "舅"
    },
    {
      "id": "g5v1-l25-c02-u5bb4",
      "lessonId": "g5v1-l25",
      "hanzi": "宴"
    },
    {
      "id": "g5v1-l25-c03-u65a9",
      "lessonId": "g5v1-l25",
      "hanzi": "斩"
    },
    {
      "id": "g5v1-l25-c04-u51ef",
      "lessonId": "g5v1-l25",
      "hanzi": "凯"
    },
    {
      "id": "g5v1-l25-c05-u845b",
      "lessonId": "g5v1-l25",
      "hanzi": "葛"
    },
    {
      "id": "g5v1-l25-c06-u8ff0",
      "lessonId": "g5v1-l25",
      "hanzi": "述"
    },
    {
      "id": "g5v1-l25-c07-u4f20",
      "lessonId": "g5v1-l25",
      "hanzi": "传"
    },
    {
      "id": "g5v1-l25-c08-u9c81",
      "lessonId": "g5v1-l25",
      "hanzi": "鲁"
    },
    {
      "id": "g5v1-l25-c09-u715e",
      "lessonId": "g5v1-l25",
      "hanzi": "煞"
    },
    {
      "id": "g5v1-l25-c10-u5bc7",
      "lessonId": "g5v1-l25",
      "hanzi": "寇"
    },
    {
      "id": "g5v1-l25-c11-u8d3e",
      "lessonId": "g5v1-l25",
      "hanzi": "贾"
    },
    {
      "id": "g5v1-l25-c12-u5377",
      "lessonId": "g5v1-l25",
      "hanzi": "卷"
    },
    {
      "id": "g5v1-l25-c13-u520a",
      "lessonId": "g5v1-l25",
      "hanzi": "刊"
    },
    {
      "id": "g5v1-l25-c14-u7410",
      "lessonId": "g5v1-l25",
      "hanzi": "琐"
    },
    {
      "id": "g5v1-l25-c15-u547b",
      "lessonId": "g5v1-l25",
      "hanzi": "呻"
    },
    {
      "id": "g5v1-l25-c16-u67d0",
      "lessonId": "g5v1-l25",
      "hanzi": "某"
    },
    {
      "id": "g5v1-l25-c17-u6d25",
      "lessonId": "g5v1-l25",
      "hanzi": "津"
    },
    {
      "id": "g5v1-l25-c18-u9650",
      "lessonId": "g5v1-l25",
      "hanzi": "限"
    },
    {
      "id": "g5v1-l25-c19-u8870",
      "lessonId": "g5v1-l25",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l25-c20-u7edf",
      "lessonId": "g5v1-l25",
      "hanzi": "统"
    },
    {
      "id": "g5v1-l25-c21-u6734",
      "lessonId": "g5v1-l25",
      "hanzi": "朴"
    },
    {
      "id": "g5v1-l26-c01-u55bb",
      "lessonId": "g5v1-l26",
      "hanzi": "喻"
    },
    {
      "id": "g5v1-l26-c02-u5dee",
      "lessonId": "g5v1-l26",
      "hanzi": "差"
    },
    {
      "id": "g5v1-l26-c03-u763e",
      "lessonId": "g5v1-l26",
      "hanzi": "瘾"
    },
    {
      "id": "g5v1-l26-c04-u5954",
      "lessonId": "g5v1-l26",
      "hanzi": "奔"
    },
    {
      "id": "g5v1-l26-c05-u7c4d",
      "lessonId": "g5v1-l26",
      "hanzi": "籍"
    },
    {
      "id": "g5v1-l26-c06-u9965",
      "lessonId": "g5v1-l26",
      "hanzi": "饥"
    },
    {
      "id": "g5v1-l26-c07-u507f",
      "lessonId": "g5v1-l26",
      "hanzi": "偿"
    },
    {
      "id": "g5v1-l26-c08-u7538",
      "lessonId": "g5v1-l26",
      "hanzi": "甸"
    },
    {
      "id": "g5v1-l26-c09-u609f",
      "lessonId": "g5v1-l26",
      "hanzi": "悟"
    },
    {
      "id": "g5v1-l26-c10-u9988",
      "lessonId": "g5v1-l26",
      "hanzi": "馈"
    },
    {
      "id": "g5v1-l26-c11-u78c1",
      "lessonId": "g5v1-l26",
      "hanzi": "磁"
    },
    {
      "id": "g5v1-l26-c12-u9175",
      "lessonId": "g5v1-l26",
      "hanzi": "酵"
    },
    {
      "id": "g5v1-l26-c13-u768e",
      "lessonId": "g5v1-l26",
      "hanzi": "皎"
    },
    {
      "id": "g5v1-l26-c14-u9274",
      "lessonId": "g5v1-l26",
      "hanzi": "鉴"
    },
    {
      "id": "g5v1-l26-c15-u6ca5",
      "lessonId": "g5v1-l26",
      "hanzi": "沥"
    }
  ],
  "structure": [
    {
      "id": "g5v1-l01-c01-u9e6d",
      "lessonId": "g5v1-l01",
      "hanzi": "鹭"
    },
    {
      "id": "g5v1-l01-c02-u5acc",
      "lessonId": "g5v1-l01",
      "hanzi": "嫌"
    },
    {
      "id": "g5v1-l01-c03-u5d4c",
      "lessonId": "g5v1-l01",
      "hanzi": "嵌"
    },
    {
      "id": "g5v1-l01-c04-u5323",
      "lessonId": "g5v1-l01",
      "hanzi": "匣"
    },
    {
      "id": "g5v1-l01-c05-u55dc",
      "lessonId": "g5v1-l01",
      "hanzi": "嗜"
    },
    {
      "id": "g5v1-l01-c06-u5b9c",
      "lessonId": "g5v1-l01",
      "hanzi": "宜"
    },
    {
      "id": "g5v1-l01-c07-u9e64",
      "lessonId": "g5v1-l01",
      "hanzi": "鹤"
    },
    {
      "id": "g5v1-l01-c08-u6731",
      "lessonId": "g5v1-l01",
      "hanzi": "朱"
    },
    {
      "id": "g5v1-l01-c09-u6846",
      "lessonId": "g5v1-l01",
      "hanzi": "框"
    },
    {
      "id": "g5v1-l01-c10-u54e8",
      "lessonId": "g5v1-l01",
      "hanzi": "哨"
    },
    {
      "id": "g5v1-l01-c11-u6069",
      "lessonId": "g5v1-l01",
      "hanzi": "恩"
    },
    {
      "id": "g5v1-l01-c12-u97f5",
      "lessonId": "g5v1-l01",
      "hanzi": "韵"
    },
    {
      "id": "g5v1-l02-c01-u4ea9",
      "lessonId": "g5v1-l02",
      "hanzi": "亩"
    },
    {
      "id": "g5v1-l02-c02-u5429",
      "lessonId": "g5v1-l02",
      "hanzi": "吩"
    },
    {
      "id": "g5v1-l02-c03-u69a8",
      "lessonId": "g5v1-l02",
      "hanzi": "榨"
    },
    {
      "id": "g5v1-l02-c04-u69b4",
      "lessonId": "g5v1-l02",
      "hanzi": "榴"
    },
    {
      "id": "g5v1-l02-c05-u77ee",
      "lessonId": "g5v1-l02",
      "hanzi": "矮"
    },
    {
      "id": "g5v1-l02-c06-u64ad",
      "lessonId": "g5v1-l02",
      "hanzi": "播"
    },
    {
      "id": "g5v1-l02-c07-u6d47",
      "lessonId": "g5v1-l02",
      "hanzi": "浇"
    },
    {
      "id": "g5v1-l02-c08-u5490",
      "lessonId": "g5v1-l02",
      "hanzi": "咐"
    },
    {
      "id": "g5v1-l02-c09-u4ead",
      "lessonId": "g5v1-l02",
      "hanzi": "亭"
    },
    {
      "id": "g5v1-l02-c10-u6155",
      "lessonId": "g5v1-l02",
      "hanzi": "慕"
    },
    {
      "id": "g5v1-l02-c11-u8c08",
      "lessonId": "g5v1-l02",
      "hanzi": "谈"
    },
    {
      "id": "g5v1-l03-c01-u7ba9",
      "lessonId": "g5v1-l03",
      "hanzi": "箩"
    },
    {
      "id": "g5v1-l03-c02-u676d",
      "lessonId": "g5v1-l03",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l03-c03-u61c2",
      "lessonId": "g5v1-l03",
      "hanzi": "懂"
    },
    {
      "id": "g5v1-l03-c04-u5170",
      "lessonId": "g5v1-l03",
      "hanzi": "兰"
    },
    {
      "id": "g5v1-l03-c05-u5a46",
      "lessonId": "g5v1-l03",
      "hanzi": "婆"
    },
    {
      "id": "g5v1-l03-c06-u7cd5",
      "lessonId": "g5v1-l03",
      "hanzi": "糕"
    },
    {
      "id": "g5v1-l03-c07-u997c",
      "lessonId": "g5v1-l03",
      "hanzi": "饼"
    },
    {
      "id": "g5v1-l03-c08-u6d78",
      "lessonId": "g5v1-l03",
      "hanzi": "浸"
    },
    {
      "id": "g5v1-l03-c09-u7f20",
      "lessonId": "g5v1-l03",
      "hanzi": "缠"
    },
    {
      "id": "g5v1-l03-c10-u8336",
      "lessonId": "g5v1-l03",
      "hanzi": "茶"
    },
    {
      "id": "g5v1-l03-c11-u6361",
      "lessonId": "g5v1-l03",
      "hanzi": "捡"
    },
    {
      "id": "g5v1-l04-c01-u8513",
      "lessonId": "g5v1-l04",
      "hanzi": "蔓"
    },
    {
      "id": "g5v1-l04-c02-u5e7d",
      "lessonId": "g5v1-l04",
      "hanzi": "幽"
    },
    {
      "id": "g5v1-l04-c03-u6089",
      "lessonId": "g5v1-l04",
      "hanzi": "悉"
    },
    {
      "id": "g5v1-l04-c04-u96cf",
      "lessonId": "g5v1-l04",
      "hanzi": "雏"
    },
    {
      "id": "g5v1-l04-c05-u54df",
      "lessonId": "g5v1-l04",
      "hanzi": "哟"
    },
    {
      "id": "g5v1-l04-c06-u67dc",
      "lessonId": "g5v1-l04",
      "hanzi": "柜"
    },
    {
      "id": "g5v1-l04-c07-u4eab",
      "lessonId": "g5v1-l04",
      "hanzi": "享"
    },
    {
      "id": "g5v1-l04-c08-u966a",
      "lessonId": "g5v1-l04",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l04-c09-u8db4",
      "lessonId": "g5v1-l04",
      "hanzi": "趴"
    },
    {
      "id": "g5v1-l04-c10-u7751",
      "lessonId": "g5v1-l04",
      "hanzi": "睑"
    },
    {
      "id": "g5v1-l04-c11-u7738",
      "lessonId": "g5v1-l04",
      "hanzi": "眸"
    },
    {
      "id": "g5v1-l04-c12-u5482",
      "lessonId": "g5v1-l04",
      "hanzi": "咂"
    },
    {
      "id": "g5v1-l05-c01-u6c5b",
      "lessonId": "g5v1-l05",
      "hanzi": "汛"
    },
    {
      "id": "g5v1-l05-c02-u633d",
      "lessonId": "g5v1-l05",
      "hanzi": "挽"
    },
    {
      "id": "g5v1-l05-c03-u95f4",
      "lessonId": "g5v1-l05",
      "hanzi": "间"
    },
    {
      "id": "g5v1-l05-c04-u60f0",
      "lessonId": "g5v1-l05",
      "hanzi": "惰"
    },
    {
      "id": "g5v1-l05-c05-u8861",
      "lessonId": "g5v1-l05",
      "hanzi": "衡"
    },
    {
      "id": "g5v1-l05-c06-u534f",
      "lessonId": "g5v1-l05",
      "hanzi": "协"
    },
    {
      "id": "g5v1-l05-c07-u7ef0",
      "lessonId": "g5v1-l05",
      "hanzi": "绰"
    },
    {
      "id": "g5v1-l05-c08-u6d2a",
      "lessonId": "g5v1-l05",
      "hanzi": "洪"
    },
    {
      "id": "g5v1-l05-c09-u8bbf",
      "lessonId": "g5v1-l05",
      "hanzi": "访"
    },
    {
      "id": "g5v1-l05-c10-u978b",
      "lessonId": "g5v1-l05",
      "hanzi": "鞋"
    },
    {
      "id": "g5v1-l05-c11-u9694",
      "lessonId": "g5v1-l05",
      "hanzi": "隔"
    },
    {
      "id": "g5v1-l05-c12-u61d2",
      "lessonId": "g5v1-l05",
      "hanzi": "懒"
    },
    {
      "id": "g5v1-l05-c13-u7a33",
      "lessonId": "g5v1-l05",
      "hanzi": "稳"
    },
    {
      "id": "g5v1-l05-c14-u514d",
      "lessonId": "g5v1-l05",
      "hanzi": "免"
    },
    {
      "id": "g5v1-l06-c01-u74a7",
      "lessonId": "g5v1-l06",
      "hanzi": "璧"
    },
    {
      "id": "g5v1-l06-c02-u81e3",
      "lessonId": "g5v1-l06",
      "hanzi": "臣"
    },
    {
      "id": "g5v1-l06-c03-u5f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "强"
    },
    {
      "id": "g5v1-l06-c04-u8bfa",
      "lessonId": "g5v1-l06",
      "hanzi": "诺"
    },
    {
      "id": "g5v1-l06-c05-u5212",
      "lessonId": "g5v1-l06",
      "hanzi": "划"
    },
    {
      "id": "g5v1-l06-c06-u5178",
      "lessonId": "g5v1-l06",
      "hanzi": "典"
    },
    {
      "id": "g5v1-l06-c07-u7f6a",
      "lessonId": "g5v1-l06",
      "hanzi": "罪"
    },
    {
      "id": "g5v1-l06-c08-u5ec9",
      "lessonId": "g5v1-l06",
      "hanzi": "廉"
    },
    {
      "id": "g5v1-l06-c09-u62b5",
      "lessonId": "g5v1-l06",
      "hanzi": "抵"
    },
    {
      "id": "g5v1-l06-c10-u5fa1",
      "lessonId": "g5v1-l06",
      "hanzi": "御"
    },
    {
      "id": "g5v1-l06-c11-u8f9e",
      "lessonId": "g5v1-l06",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l06-c12-u8fb1",
      "lessonId": "g5v1-l06",
      "hanzi": "辱"
    },
    {
      "id": "g5v1-l06-c13-u64c5",
      "lessonId": "g5v1-l06",
      "hanzi": "擅"
    },
    {
      "id": "g5v1-l06-c14-u7f36",
      "lessonId": "g5v1-l06",
      "hanzi": "缶"
    },
    {
      "id": "g5v1-l06-c15-u537f",
      "lessonId": "g5v1-l06",
      "hanzi": "卿"
    },
    {
      "id": "g5v1-l06-c16-u524a",
      "lessonId": "g5v1-l06",
      "hanzi": "削"
    },
    {
      "id": "g5v1-l06-c17-u888d",
      "lessonId": "g5v1-l06",
      "hanzi": "袍"
    },
    {
      "id": "g5v1-l06-c18-u53ec",
      "lessonId": "g5v1-l06",
      "hanzi": "召"
    },
    {
      "id": "g5v1-l06-c19-u8bae",
      "lessonId": "g5v1-l06",
      "hanzi": "议"
    },
    {
      "id": "g5v1-l06-c20-u7f3a",
      "lessonId": "g5v1-l06",
      "hanzi": "缺"
    },
    {
      "id": "g5v1-l06-c21-u5bab",
      "lessonId": "g5v1-l06",
      "hanzi": "宫"
    },
    {
      "id": "g5v1-l06-c22-u732e",
      "lessonId": "g5v1-l06",
      "hanzi": "献"
    },
    {
      "id": "g5v1-l06-c23-u627f",
      "lessonId": "g5v1-l06",
      "hanzi": "承"
    },
    {
      "id": "g5v1-l06-c24-u6284",
      "lessonId": "g5v1-l06",
      "hanzi": "抄"
    },
    {
      "id": "g5v1-l06-c25-u602f",
      "lessonId": "g5v1-l06",
      "hanzi": "怯"
    },
    {
      "id": "g5v1-l06-c26-u62d2",
      "lessonId": "g5v1-l06",
      "hanzi": "拒"
    },
    {
      "id": "g5v1-l06-c27-u8346",
      "lessonId": "g5v1-l06",
      "hanzi": "荆"
    },
    {
      "id": "g5v1-l07-c01-u9e35",
      "lessonId": "g5v1-l07",
      "hanzi": "鸵"
    },
    {
      "id": "g5v1-l07-c02-u8d62",
      "lessonId": "g5v1-l07",
      "hanzi": "赢"
    },
    {
      "id": "g5v1-l07-c03-u51a0",
      "lessonId": "g5v1-l07",
      "hanzi": "冠"
    },
    {
      "id": "g5v1-l07-c04-u4fef",
      "lessonId": "g5v1-l07",
      "hanzi": "俯"
    },
    {
      "id": "g5v1-l07-c05-u55b7",
      "lessonId": "g5v1-l07",
      "hanzi": "喷"
    },
    {
      "id": "g5v1-l07-c06-u679a",
      "lessonId": "g5v1-l07",
      "hanzi": "枚"
    },
    {
      "id": "g5v1-l07-c07-u7bad",
      "lessonId": "g5v1-l07",
      "hanzi": "箭"
    },
    {
      "id": "g5v1-l07-c08-u6d69",
      "lessonId": "g5v1-l07",
      "hanzi": "浩"
    },
    {
      "id": "g5v1-l07-c09-u7b52",
      "lessonId": "g5v1-l07",
      "hanzi": "筒"
    },
    {
      "id": "g5v1-l07-c10-u675f",
      "lessonId": "g5v1-l07",
      "hanzi": "束"
    },
    {
      "id": "g5v1-l07-c11-u8d64",
      "lessonId": "g5v1-l07",
      "hanzi": "赤"
    },
    {
      "id": "g5v1-l07-c12-u5708",
      "lessonId": "g5v1-l07",
      "hanzi": "圈"
    },
    {
      "id": "g5v1-l07-c13-u7f6e",
      "lessonId": "g5v1-l07",
      "hanzi": "置"
    },
    {
      "id": "g5v1-l08-c01-u4fb5",
      "lessonId": "g5v1-l08",
      "hanzi": "侵"
    },
    {
      "id": "g5v1-l08-c02-u7565",
      "lessonId": "g5v1-l08",
      "hanzi": "略"
    },
    {
      "id": "g5v1-l08-c03-u5792",
      "lessonId": "g5v1-l08",
      "hanzi": "垒"
    },
    {
      "id": "g5v1-l08-c04-u4efb",
      "lessonId": "g5v1-l08",
      "hanzi": "任"
    },
    {
      "id": "g5v1-l08-c05-u4e18",
      "lessonId": "g5v1-l08",
      "hanzi": "丘"
    },
    {
      "id": "g5v1-l08-c06-u6401",
      "lessonId": "g5v1-l08",
      "hanzi": "搁"
    },
    {
      "id": "g5v1-l08-c07-u9677",
      "lessonId": "g5v1-l08",
      "hanzi": "陷"
    },
    {
      "id": "g5v1-l08-c08-u62d0",
      "lessonId": "g5v1-l08",
      "hanzi": "拐"
    },
    {
      "id": "g5v1-l08-c09-u5c94",
      "lessonId": "g5v1-l08",
      "hanzi": "岔"
    },
    {
      "id": "g5v1-l08-c10-u7b51",
      "lessonId": "g5v1-l08",
      "hanzi": "筑"
    },
    {
      "id": "g5v1-l08-c11-u5821",
      "lessonId": "g5v1-l08",
      "hanzi": "堡"
    },
    {
      "id": "g5v1-l08-c12-u515a",
      "lessonId": "g5v1-l08",
      "hanzi": "党"
    },
    {
      "id": "g5v1-l08-c13-u59a8",
      "lessonId": "g5v1-l08",
      "hanzi": "妨"
    },
    {
      "id": "g5v1-l08-c14-u853d",
      "lessonId": "g5v1-l08",
      "hanzi": "蔽"
    },
    {
      "id": "g5v1-l09-c01-u916c",
      "lessonId": "g5v1-l09",
      "hanzi": "酬"
    },
    {
      "id": "g5v1-l09-c02-u8a93",
      "lessonId": "g5v1-l09",
      "hanzi": "誓"
    },
    {
      "id": "g5v1-l09-c03-u8c0e",
      "lessonId": "g5v1-l09",
      "hanzi": "谎"
    },
    {
      "id": "g5v1-l09-c04-u727a",
      "lessonId": "g5v1-l09",
      "hanzi": "牺"
    },
    {
      "id": "g5v1-l09-c05-u73cd",
      "lessonId": "g5v1-l09",
      "hanzi": "珍"
    },
    {
      "id": "g5v1-l09-c06-u53ee",
      "lessonId": "g5v1-l09",
      "hanzi": "叮"
    },
    {
      "id": "g5v1-l09-c07-u5631",
      "lessonId": "g5v1-l09",
      "hanzi": "嘱"
    },
    {
      "id": "g5v1-l09-c08-u584c",
      "lessonId": "g5v1-l09",
      "hanzi": "塌"
    },
    {
      "id": "g5v1-l09-c09-u7126",
      "lessonId": "g5v1-l09",
      "hanzi": "焦"
    },
    {
      "id": "g5v1-l09-c10-u5ef6",
      "lessonId": "g5v1-l09",
      "hanzi": "延"
    },
    {
      "id": "g5v1-l09-c11-u707e",
      "lessonId": "g5v1-l09",
      "hanzi": "灾"
    },
    {
      "id": "g5v1-l09-c12-u6094",
      "lessonId": "g5v1-l09",
      "hanzi": "悔"
    },
    {
      "id": "g5v1-l09-c13-u6276",
      "lessonId": "g5v1-l09",
      "hanzi": "扶"
    },
    {
      "id": "g5v1-l10-c01-u5ac2",
      "lessonId": "g5v1-l10",
      "hanzi": "嫂"
    },
    {
      "id": "g5v1-l10-c02-u6073",
      "lessonId": "g5v1-l10",
      "hanzi": "恳"
    },
    {
      "id": "g5v1-l10-c03-u7b5b",
      "lessonId": "g5v1-l10",
      "hanzi": "筛"
    },
    {
      "id": "g5v1-l10-c04-u6b79",
      "lessonId": "g5v1-l10",
      "hanzi": "歹"
    },
    {
      "id": "g5v1-l10-c05-u7f55",
      "lessonId": "g5v1-l10",
      "hanzi": "罕"
    },
    {
      "id": "g5v1-l10-c06-u68ad",
      "lessonId": "g5v1-l10",
      "hanzi": "梭"
    },
    {
      "id": "g5v1-l10-c07-u76d1",
      "lessonId": "g5v1-l10",
      "hanzi": "监"
    },
    {
      "id": "g5v1-l10-c08-u72f1",
      "lessonId": "g5v1-l10",
      "hanzi": "狱"
    },
    {
      "id": "g5v1-l10-c09-u917f",
      "lessonId": "g5v1-l10",
      "hanzi": "酿"
    },
    {
      "id": "g5v1-l10-c10-u778c",
      "lessonId": "g5v1-l10",
      "hanzi": "瞌"
    },
    {
      "id": "g5v1-l10-c11-u843d",
      "lessonId": "g5v1-l10",
      "hanzi": "落"
    },
    {
      "id": "g5v1-l10-c12-u5a5a",
      "lessonId": "g5v1-l10",
      "hanzi": "婚"
    },
    {
      "id": "g5v1-l10-c13-u90ce",
      "lessonId": "g5v1-l10",
      "hanzi": "郎"
    },
    {
      "id": "g5v1-l10-c14-u7239",
      "lessonId": "g5v1-l10",
      "hanzi": "爹"
    },
    {
      "id": "g5v1-l10-c15-u8f86",
      "lessonId": "g5v1-l10",
      "hanzi": "辆"
    },
    {
      "id": "g5v1-l10-c16-u7eb1",
      "lessonId": "g5v1-l10",
      "hanzi": "纱"
    },
    {
      "id": "g5v1-l10-c17-u59bb",
      "lessonId": "g5v1-l10",
      "hanzi": "妻"
    },
    {
      "id": "g5v1-l10-c18-u8d9f",
      "lessonId": "g5v1-l10",
      "hanzi": "趟"
    },
    {
      "id": "g5v1-l10-c19-u6258",
      "lessonId": "g5v1-l10",
      "hanzi": "托"
    },
    {
      "id": "g5v1-l10-c20-u6e9c",
      "lessonId": "g5v1-l10",
      "hanzi": "溜"
    },
    {
      "id": "g5v1-l10-c21-u8f88",
      "lessonId": "g5v1-l10",
      "hanzi": "辈"
    },
    {
      "id": "g5v1-l10-c22-u6328",
      "lessonId": "g5v1-l10",
      "hanzi": "挨"
    },
    {
      "id": "g5v1-l11-c01-u4fed",
      "lessonId": "g5v1-l11",
      "hanzi": "俭"
    },
    {
      "id": "g5v1-l11-c02-u7687",
      "lessonId": "g5v1-l11",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l11-c03-u504e",
      "lessonId": "g5v1-l11",
      "hanzi": "偎"
    },
    {
      "id": "g5v1-l11-c04-u8870",
      "lessonId": "g5v1-l11",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l11-c05-u73ca",
      "lessonId": "g5v1-l11",
      "hanzi": "珊"
    },
    {
      "id": "g5v1-l11-c06-u745a",
      "lessonId": "g5v1-l11",
      "hanzi": "瑚"
    },
    {
      "id": "g5v1-l11-c07-u7901",
      "lessonId": "g5v1-l11",
      "hanzi": "礁"
    },
    {
      "id": "g5v1-l11-c08-u7b50",
      "lessonId": "g5v1-l11",
      "hanzi": "筐"
    },
    {
      "id": "g5v1-l11-c09-u62d7",
      "lessonId": "g5v1-l11",
      "hanzi": "拗"
    },
    {
      "id": "g5v1-l12-c01-u4e43",
      "lessonId": "g5v1-l12",
      "hanzi": "乃"
    },
    {
      "id": "g5v1-l12-c02-u718f",
      "lessonId": "g5v1-l12",
      "hanzi": "熏"
    },
    {
      "id": "g5v1-l12-c03-u4ea5",
      "lessonId": "g5v1-l12",
      "hanzi": "亥"
    },
    {
      "id": "g5v1-l12-c04-u6043",
      "lessonId": "g5v1-l12",
      "hanzi": "恃"
    },
    {
      "id": "g5v1-l12-c05-u64de",
      "lessonId": "g5v1-l12",
      "hanzi": "擞"
    },
    {
      "id": "g5v1-l12-c06-u796d",
      "lessonId": "g5v1-l12",
      "hanzi": "祭"
    },
    {
      "id": "g5v1-l12-c07-u676d",
      "lessonId": "g5v1-l12",
      "hanzi": "杭"
    },
    {
      "id": "g5v1-l12-c08-u54c0",
      "lessonId": "g5v1-l12",
      "hanzi": "哀"
    },
    {
      "id": "g5v1-l12-c09-u62d8",
      "lessonId": "g5v1-l12",
      "hanzi": "拘"
    },
    {
      "id": "g5v1-l13-c01-u6cfb",
      "lessonId": "g5v1-l13",
      "hanzi": "泻"
    },
    {
      "id": "g5v1-l13-c02-u9cde",
      "lessonId": "g5v1-l13",
      "hanzi": "鳞"
    },
    {
      "id": "g5v1-l13-c03-u60f6",
      "lessonId": "g5v1-l13",
      "hanzi": "惶"
    },
    {
      "id": "g5v1-l13-c04-u80ce",
      "lessonId": "g5v1-l13",
      "hanzi": "胎"
    },
    {
      "id": "g5v1-l13-c05-u5c65",
      "lessonId": "g5v1-l13",
      "hanzi": "履"
    },
    {
      "id": "g5v1-l13-c06-u54c9",
      "lessonId": "g5v1-l13",
      "hanzi": "哉"
    },
    {
      "id": "g5v1-l13-c07-u6f5c",
      "lessonId": "g5v1-l13",
      "hanzi": "潜"
    },
    {
      "id": "g5v1-l13-c08-u8bd5",
      "lessonId": "g5v1-l13",
      "hanzi": "试"
    },
    {
      "id": "g5v1-l13-c09-u7687",
      "lessonId": "g5v1-l13",
      "hanzi": "皇"
    },
    {
      "id": "g5v1-l13-c10-u7eb5",
      "lessonId": "g5v1-l13",
      "hanzi": "纵"
    },
    {
      "id": "g5v1-l13-c11-u7586",
      "lessonId": "g5v1-l13",
      "hanzi": "疆"
    },
    {
      "id": "g5v1-l14-c01-u4f30",
      "lessonId": "g5v1-l14",
      "hanzi": "估"
    },
    {
      "id": "g5v1-l14-c02-u714c",
      "lessonId": "g5v1-l14",
      "hanzi": "煌"
    },
    {
      "id": "g5v1-l14-c03-u73d1",
      "lessonId": "g5v1-l14",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l14-c04-u5254",
      "lessonId": "g5v1-l14",
      "hanzi": "剔"
    },
    {
      "id": "g5v1-l14-c05-u6f9c",
      "lessonId": "g5v1-l14",
      "hanzi": "澜"
    },
    {
      "id": "g5v1-l14-c06-u7476",
      "lessonId": "g5v1-l14",
      "hanzi": "瑶"
    },
    {
      "id": "g5v1-l14-c07-u9675",
      "lessonId": "g5v1-l14",
      "hanzi": "陵"
    },
    {
      "id": "g5v1-l14-c08-u5b8f",
      "lessonId": "g5v1-l14",
      "hanzi": "宏"
    },
    {
      "id": "g5v1-l14-c09-u5949",
      "lessonId": "g5v1-l14",
      "hanzi": "奉"
    },
    {
      "id": "g5v1-l14-c10-u70ec",
      "lessonId": "g5v1-l14",
      "hanzi": "烬"
    },
    {
      "id": "g5v1-l14-c11-u6bc1",
      "lessonId": "g5v1-l14",
      "hanzi": "毁"
    },
    {
      "id": "g5v1-l14-c12-u635f",
      "lessonId": "g5v1-l14",
      "hanzi": "损"
    },
    {
      "id": "g5v1-l14-c13-u62f1",
      "lessonId": "g5v1-l14",
      "hanzi": "拱"
    },
    {
      "id": "g5v1-l14-c14-u8f89",
      "lessonId": "g5v1-l14",
      "hanzi": "辉"
    },
    {
      "id": "g5v1-l14-c15-u6bbf",
      "lessonId": "g5v1-l14",
      "hanzi": "殿"
    },
    {
      "id": "g5v1-l14-c16-u89c8",
      "lessonId": "g5v1-l14",
      "hanzi": "览"
    },
    {
      "id": "g5v1-l14-c17-u5883",
      "lessonId": "g5v1-l14",
      "hanzi": "境"
    },
    {
      "id": "g5v1-l14-c18-u5510",
      "lessonId": "g5v1-l14",
      "hanzi": "唐"
    },
    {
      "id": "g5v1-l14-c19-u95ef",
      "lessonId": "g5v1-l14",
      "hanzi": "闯"
    },
    {
      "id": "g5v1-l14-c20-u9500",
      "lessonId": "g5v1-l14",
      "hanzi": "销"
    },
    {
      "id": "g5v1-l15-c01-u7792",
      "lessonId": "g5v1-l15",
      "hanzi": "瞒"
    },
    {
      "id": "g5v1-l15-c02-u57df",
      "lessonId": "g5v1-l15",
      "hanzi": "域"
    },
    {
      "id": "g5v1-l15-c03-u8247",
      "lessonId": "g5v1-l15",
      "hanzi": "艇"
    },
    {
      "id": "g5v1-l15-c04-u77db",
      "lessonId": "g5v1-l15",
      "hanzi": "矛"
    },
    {
      "id": "g5v1-l15-c05-u76fe",
      "lessonId": "g5v1-l15",
      "hanzi": "盾"
    },
    {
      "id": "g5v1-l15-c06-u7b77",
      "lessonId": "g5v1-l15",
      "hanzi": "筷"
    },
    {
      "id": "g5v1-l15-c07-u708a",
      "lessonId": "g5v1-l15",
      "hanzi": "炊"
    },
    {
      "id": "g5v1-l15-c08-u54fc",
      "lessonId": "g5v1-l15",
      "hanzi": "哼"
    },
    {
      "id": "g5v1-l15-c09-u5589",
      "lessonId": "g5v1-l15",
      "hanzi": "喉"
    },
    {
      "id": "g5v1-l15-c10-u5499",
      "lessonId": "g5v1-l15",
      "hanzi": "咙"
    },
    {
      "id": "g5v1-l15-c11-u54fd",
      "lessonId": "g5v1-l15",
      "hanzi": "哽"
    },
    {
      "id": "g5v1-l15-c12-u52fa",
      "lessonId": "g5v1-l15",
      "hanzi": "勺"
    },
    {
      "id": "g5v1-l15-c13-u6405",
      "lessonId": "g5v1-l15",
      "hanzi": "搅"
    },
    {
      "id": "g5v1-l15-c14-u8200",
      "lessonId": "g5v1-l15",
      "hanzi": "舀"
    },
    {
      "id": "g5v1-l16-c01-u6444",
      "lessonId": "g5v1-l16",
      "hanzi": "摄"
    },
    {
      "id": "g5v1-l16-c02-u6b96",
      "lessonId": "g5v1-l16",
      "hanzi": "殖"
    },
    {
      "id": "g5v1-l16-c03-u70ad",
      "lessonId": "g5v1-l16",
      "hanzi": "炭"
    },
    {
      "id": "g5v1-l16-c04-u7597",
      "lessonId": "g5v1-l16",
      "hanzi": "疗"
    },
    {
      "id": "g5v1-l16-c05-u6c0f",
      "lessonId": "g5v1-l16",
      "hanzi": "氏"
    },
    {
      "id": "g5v1-l16-c06-u7cae",
      "lessonId": "g5v1-l16",
      "hanzi": "粮"
    },
    {
      "id": "g5v1-l16-c07-u533a",
      "lessonId": "g5v1-l16",
      "hanzi": "区"
    },
    {
      "id": "g5v1-l16-c08-u6740",
      "lessonId": "g5v1-l16",
      "hanzi": "杀"
    },
    {
      "id": "g5v1-l16-c09-u83cc",
      "lessonId": "g5v1-l16",
      "hanzi": "菌"
    },
    {
      "id": "g5v1-l17-c01-u9a6f",
      "lessonId": "g5v1-l17",
      "hanzi": "驯"
    },
    {
      "id": "g5v1-l17-c02-u77eb",
      "lessonId": "g5v1-l17",
      "hanzi": "矫"
    },
    {
      "id": "g5v1-l17-c03-u6b47",
      "lessonId": "g5v1-l17",
      "hanzi": "歇"
    },
    {
      "id": "g5v1-l17-c04-u6748",
      "lessonId": "g5v1-l17",
      "hanzi": "杈"
    },
    {
      "id": "g5v1-l17-c05-u85d3",
      "lessonId": "g5v1-l17",
      "hanzi": "藓"
    },
    {
      "id": "g5v1-l17-c06-u72ed",
      "lessonId": "g5v1-l17",
      "hanzi": "狭"
    },
    {
      "id": "g5v1-l17-c07-u52c9",
      "lessonId": "g5v1-l17",
      "hanzi": "勉"
    },
    {
      "id": "g5v1-l17-c08-u9525",
      "lessonId": "g5v1-l17",
      "hanzi": "锥"
    },
    {
      "id": "g5v1-l17-c09-u9f20",
      "lessonId": "g5v1-l17",
      "hanzi": "鼠"
    },
    {
      "id": "g5v1-l17-c10-u79c0",
      "lessonId": "g5v1-l17",
      "hanzi": "秀"
    },
    {
      "id": "g5v1-l17-c11-u73b2",
      "lessonId": "g5v1-l17",
      "hanzi": "玲"
    },
    {
      "id": "g5v1-l17-c12-u73d1",
      "lessonId": "g5v1-l17",
      "hanzi": "珑"
    },
    {
      "id": "g5v1-l17-c13-u5e3d",
      "lessonId": "g5v1-l17",
      "hanzi": "帽"
    },
    {
      "id": "g5v1-l17-c14-u5c3e",
      "lessonId": "g5v1-l17",
      "hanzi": "尾"
    },
    {
      "id": "g5v1-l17-c15-u7a9d",
      "lessonId": "g5v1-l17",
      "hanzi": "窝"
    },
    {
      "id": "g5v1-l17-c16-u6ed1",
      "lessonId": "g5v1-l17",
      "hanzi": "滑"
    },
    {
      "id": "g5v1-l17-c17-u62fe",
      "lessonId": "g5v1-l17",
      "hanzi": "拾"
    },
    {
      "id": "g5v1-l17-c18-u68b3",
      "lessonId": "g5v1-l17",
      "hanzi": "梳"
    },
    {
      "id": "g5v1-l18-c01-u9b44",
      "lessonId": "g5v1-l18",
      "hanzi": "魄"
    },
    {
      "id": "g5v1-l18-c02-u6291",
      "lessonId": "g5v1-l18",
      "hanzi": "抑"
    },
    {
      "id": "g5v1-l18-c03-u9893",
      "lessonId": "g5v1-l18",
      "hanzi": "颓"
    },
    {
      "id": "g5v1-l18-c04-u7eab",
      "lessonId": "g5v1-l18",
      "hanzi": "纫"
    },
    {
      "id": "g5v1-l18-c05-u566a",
      "lessonId": "g5v1-l18",
      "hanzi": "噪"
    },
    {
      "id": "g5v1-l18-c06-u8910",
      "lessonId": "g5v1-l18",
      "hanzi": "褐"
    },
    {
      "id": "g5v1-l18-c07-u60eb",
      "lessonId": "g5v1-l18",
      "hanzi": "惫"
    },
    {
      "id": "g5v1-l18-c08-u803d",
      "lessonId": "g5v1-l18",
      "hanzi": "耽"
    },
    {
      "id": "g5v1-l18-c09-u515c",
      "lessonId": "g5v1-l18",
      "hanzi": "兜"
    },
    {
      "id": "g5v1-l18-c10-u6743",
      "lessonId": "g5v1-l18",
      "hanzi": "权"
    },
    {
      "id": "g5v1-l18-c11-u8f9e",
      "lessonId": "g5v1-l18",
      "hanzi": "辞"
    },
    {
      "id": "g5v1-l18-c12-u788c",
      "lessonId": "g5v1-l18",
      "hanzi": "碌"
    },
    {
      "id": "g5v1-l18-c13-u540a",
      "lessonId": "g5v1-l18",
      "hanzi": "吊"
    },
    {
      "id": "g5v1-l18-c14-u9177",
      "lessonId": "g5v1-l18",
      "hanzi": "酷"
    },
    {
      "id": "g5v1-l18-c15-u6691",
      "lessonId": "g5v1-l18",
      "hanzi": "暑"
    },
    {
      "id": "g5v1-l18-c16-u810a",
      "lessonId": "g5v1-l18",
      "hanzi": "脊"
    },
    {
      "id": "g5v1-l18-c17-u7f69",
      "lessonId": "g5v1-l18",
      "hanzi": "罩"
    },
    {
      "id": "g5v1-l18-c18-u7adf",
      "lessonId": "g5v1-l18",
      "hanzi": "竟"
    },
    {
      "id": "g5v1-l18-c19-u54c7",
      "lessonId": "g5v1-l18",
      "hanzi": "哇"
    },
    {
      "id": "g5v1-l18-c20-u5fcd",
      "lessonId": "g5v1-l18",
      "hanzi": "忍"
    },
    {
      "id": "g5v1-l18-c21-u68b0",
      "lessonId": "g5v1-l18",
      "hanzi": "械"
    },
    {
      "id": "g5v1-l18-c22-u9178",
      "lessonId": "g5v1-l18",
      "hanzi": "酸"
    },
    {
      "id": "g5v1-l19-c01-u8327",
      "lessonId": "g5v1-l19",
      "hanzi": "茧"
    },
    {
      "id": "g5v1-l19-c02-u6808",
      "lessonId": "g5v1-l19",
      "hanzi": "栈"
    },
    {
      "id": "g5v1-l19-c03-u51a4",
      "lessonId": "g5v1-l19",
      "hanzi": "冤"
    },
    {
      "id": "g5v1-l19-c04-u6789",
      "lessonId": "g5v1-l19",
      "hanzi": "枉"
    },
    {
      "id": "g5v1-l19-c05-u604d",
      "lessonId": "g5v1-l19",
      "hanzi": "恍"
    },
    {
      "id": "g5v1-l19-c06-u60da",
      "lessonId": "g5v1-l19",
      "hanzi": "惚"
    },
    {
      "id": "g5v1-l19-c07-u8df7",
      "lessonId": "g5v1-l19",
      "hanzi": "跷"
    },
    {
      "id": "g5v1-l19-c08-u50fb",
      "lessonId": "g5v1-l19",
      "hanzi": "僻"
    },
    {
      "id": "g5v1-l19-c09-u59d4",
      "lessonId": "g5v1-l19",
      "hanzi": "委"
    },
    {
      "id": "g5v1-l19-c10-u8fea",
      "lessonId": "g5v1-l19",
      "hanzi": "迪"
    },
    {
      "id": "g5v1-l19-c11-u5ac1",
      "lessonId": "g5v1-l19",
      "hanzi": "嫁"
    },
    {
      "id": "g5v1-l19-c12-u7f34",
      "lessonId": "g5v1-l19",
      "hanzi": "缴"
    },
    {
      "id": "g5v1-l19-c13-u699c",
      "lessonId": "g5v1-l19",
      "hanzi": "榜"
    },
    {
      "id": "g5v1-l19-c14-u517c",
      "lessonId": "g5v1-l19",
      "hanzi": "兼"
    },
    {
      "id": "g5v1-l19-c15-u5632",
      "lessonId": "g5v1-l19",
      "hanzi": "嘲"
    },
    {
      "id": "g5v1-l19-c16-u6795",
      "lessonId": "g5v1-l19",
      "hanzi": "枕"
    },
    {
      "id": "g5v1-l19-c17-u8695",
      "lessonId": "g5v1-l19",
      "hanzi": "蚕"
    },
    {
      "id": "g5v1-l19-c18-u8003",
      "lessonId": "g5v1-l19",
      "hanzi": "考"
    },
    {
      "id": "g5v1-l19-c19-u75bc",
      "lessonId": "g5v1-l19",
      "hanzi": "疼"
    },
    {
      "id": "g5v1-l19-c20-u5e2d",
      "lessonId": "g5v1-l19",
      "hanzi": "席"
    },
    {
      "id": "g5v1-l19-c21-u7cd6",
      "lessonId": "g5v1-l19",
      "hanzi": "糖"
    },
    {
      "id": "g5v1-l19-c22-u5c51",
      "lessonId": "g5v1-l19",
      "hanzi": "屑"
    },
    {
      "id": "g5v1-l19-c23-u9489",
      "lessonId": "g5v1-l19",
      "hanzi": "钉"
    },
    {
      "id": "g5v1-l19-c24-u966a",
      "lessonId": "g5v1-l19",
      "hanzi": "陪"
    },
    {
      "id": "g5v1-l19-c25-u6bd5",
      "lessonId": "g5v1-l19",
      "hanzi": "毕"
    },
    {
      "id": "g5v1-l19-c26-u716e",
      "lessonId": "g5v1-l19",
      "hanzi": "煮"
    },
    {
      "id": "g5v1-l20-c01-u817c",
      "lessonId": "g5v1-l20",
      "hanzi": "腼"
    },
    {
      "id": "g5v1-l20-c02-u8146",
      "lessonId": "g5v1-l20",
      "hanzi": "腆"
    },
    {
      "id": "g5v1-l20-c03-u8a8a",
      "lessonId": "g5v1-l20",
      "hanzi": "誊"
    },
    {
      "id": "g5v1-l20-c04-u52b1",
      "lessonId": "g5v1-l20",
      "hanzi": "励"
    },
    {
      "id": "g5v1-l20-c05-u7248",
      "lessonId": "g5v1-l20",
      "hanzi": "版"
    },
    {
      "id": "g5v1-l20-c06-u7965",
      "lessonId": "g5v1-l20",
      "hanzi": "祥"
    },
    {
      "id": "g5v1-l20-c07-u6b67",
      "lessonId": "g5v1-l20",
      "hanzi": "歧"
    },
    {
      "id": "g5v1-l20-c08-u8c28",
      "lessonId": "g5v1-l20",
      "hanzi": "谨"
    },
    {
      "id": "g5v1-l21-c01-u6986",
      "lessonId": "g5v1-l21",
      "hanzi": "榆"
    },
    {
      "id": "g5v1-l21-c02-u7554",
      "lessonId": "g5v1-l21",
      "hanzi": "畔"
    },
    {
      "id": "g5v1-l21-c03-u66f4",
      "lessonId": "g5v1-l21",
      "hanzi": "更"
    },
    {
      "id": "g5v1-l21-c04-u8052",
      "lessonId": "g5v1-l21",
      "hanzi": "聒"
    },
    {
      "id": "g5v1-l21-c05-u5b59",
      "lessonId": "g5v1-l21",
      "hanzi": "孙"
    },
    {
      "id": "g5v1-l21-c06-u6cca",
      "lessonId": "g5v1-l21",
      "hanzi": "泊"
    },
    {
      "id": "g5v1-l21-c07-u6101",
      "lessonId": "g5v1-l21",
      "hanzi": "愁"
    },
    {
      "id": "g5v1-l21-c08-u5bfa",
      "lessonId": "g5v1-l21",
      "hanzi": "寺"
    },
    {
      "id": "g5v1-l22-c01-u6868",
      "lessonId": "g5v1-l22",
      "hanzi": "桨"
    },
    {
      "id": "g5v1-l22-c02-u6869",
      "lessonId": "g5v1-l22",
      "hanzi": "桩"
    },
    {
      "id": "g5v1-l22-c03-u6687",
      "lessonId": "g5v1-l22",
      "hanzi": "暇"
    },
    {
      "id": "g5v1-l22-c04-u6995",
      "lessonId": "g5v1-l22",
      "hanzi": "榕"
    },
    {
      "id": "g5v1-l22-c05-u7ea0",
      "lessonId": "g5v1-l22",
      "hanzi": "纠"
    },
    {
      "id": "g5v1-l22-c06-u8000",
      "lessonId": "g5v1-l22",
      "hanzi": "耀"
    },
    {
      "id": "g5v1-l22-c07-u6da8",
      "lessonId": "g5v1-l22",
      "hanzi": "涨"
    },
    {
      "id": "g5v1-l22-c08-u5854",
      "lessonId": "g5v1-l22",
      "hanzi": "塔"
    },
    {
      "id": "g5v1-l22-c09-u68a2",
      "lessonId": "g5v1-l22",
      "hanzi": "梢"
    },
    {
      "id": "g5v1-l22-c10-u7709",
      "lessonId": "g5v1-l22",
      "hanzi": "眉"
    },
    {
      "id": "g5v1-l22-c11-u629b",
      "lessonId": "g5v1-l22",
      "hanzi": "抛"
    },
    {
      "id": "g5v1-l23-c01-u6084",
      "lessonId": "g5v1-l23",
      "hanzi": "悄"
    },
    {
      "id": "g5v1-l23-c02-u7d2f",
      "lessonId": "g5v1-l23",
      "hanzi": "累"
    },
    {
      "id": "g5v1-l23-c03-u5ae6",
      "lessonId": "g5v1-l23",
      "hanzi": "嫦"
    },
    {
      "id": "g5v1-l23-c04-u5a25",
      "lessonId": "g5v1-l23",
      "hanzi": "娥"
    },
    {
      "id": "g5v1-l23-c05-u5ac9",
      "lessonId": "g5v1-l23",
      "hanzi": "嫉"
    },
    {
      "id": "g5v1-l23-c06-u5992",
      "lessonId": "g5v1-l23",
      "hanzi": "妒"
    },
    {
      "id": "g5v1-l23-c07-u74f7",
      "lessonId": "g5v1-l23",
      "hanzi": "瓷"
    },
    {
      "id": "g5v1-l24-c01-u803b",
      "lessonId": "g5v1-l24",
      "hanzi": "耻"
    },
    {
      "id": "g5v1-l24-c02-u8bc6",
      "lessonId": "g5v1-l24",
      "hanzi": "识"
    },
    {
      "id": "g5v1-l24-c03-u5bdd",
      "lessonId": "g5v1-l24",
      "hanzi": "寝"
    },
    {
      "id": "g5v1-l24-c04-u77e3",
      "lessonId": "g5v1-l24",
      "hanzi": "矣"
    },
    {
      "id": "g5v1-l24-c05-u5c82",
      "lessonId": "g5v1-l24",
      "hanzi": "岂"
    },
    {
      "id": "g5v1-l24-c06-u8bf2",
      "lessonId": "g5v1-l24",
      "hanzi": "诲"
    },
    {
      "id": "g5v1-l24-c07-u8c13",
      "lessonId": "g5v1-l24",
      "hanzi": "谓"
    },
    {
      "id": "g5v1-l24-c08-u8bf5",
      "lessonId": "g5v1-l24",
      "hanzi": "诵"
    },
    {
      "id": "g5v1-l25-c01-u8205",
      "lessonId": "g5v1-l25",
      "hanzi": "舅"
    },
    {
      "id": "g5v1-l25-c02-u5bb4",
      "lessonId": "g5v1-l25",
      "hanzi": "宴"
    },
    {
      "id": "g5v1-l25-c03-u65a9",
      "lessonId": "g5v1-l25",
      "hanzi": "斩"
    },
    {
      "id": "g5v1-l25-c04-u51ef",
      "lessonId": "g5v1-l25",
      "hanzi": "凯"
    },
    {
      "id": "g5v1-l25-c05-u845b",
      "lessonId": "g5v1-l25",
      "hanzi": "葛"
    },
    {
      "id": "g5v1-l25-c06-u8ff0",
      "lessonId": "g5v1-l25",
      "hanzi": "述"
    },
    {
      "id": "g5v1-l25-c07-u4f20",
      "lessonId": "g5v1-l25",
      "hanzi": "传"
    },
    {
      "id": "g5v1-l25-c08-u9c81",
      "lessonId": "g5v1-l25",
      "hanzi": "鲁"
    },
    {
      "id": "g5v1-l25-c09-u715e",
      "lessonId": "g5v1-l25",
      "hanzi": "煞"
    },
    {
      "id": "g5v1-l25-c10-u5bc7",
      "lessonId": "g5v1-l25",
      "hanzi": "寇"
    },
    {
      "id": "g5v1-l25-c11-u8d3e",
      "lessonId": "g5v1-l25",
      "hanzi": "贾"
    },
    {
      "id": "g5v1-l25-c12-u5377",
      "lessonId": "g5v1-l25",
      "hanzi": "卷"
    },
    {
      "id": "g5v1-l25-c13-u520a",
      "lessonId": "g5v1-l25",
      "hanzi": "刊"
    },
    {
      "id": "g5v1-l25-c14-u7410",
      "lessonId": "g5v1-l25",
      "hanzi": "琐"
    },
    {
      "id": "g5v1-l25-c15-u547b",
      "lessonId": "g5v1-l25",
      "hanzi": "呻"
    },
    {
      "id": "g5v1-l25-c16-u67d0",
      "lessonId": "g5v1-l25",
      "hanzi": "某"
    },
    {
      "id": "g5v1-l25-c17-u6d25",
      "lessonId": "g5v1-l25",
      "hanzi": "津"
    },
    {
      "id": "g5v1-l25-c18-u9650",
      "lessonId": "g5v1-l25",
      "hanzi": "限"
    },
    {
      "id": "g5v1-l25-c19-u8870",
      "lessonId": "g5v1-l25",
      "hanzi": "衰"
    },
    {
      "id": "g5v1-l25-c20-u7edf",
      "lessonId": "g5v1-l25",
      "hanzi": "统"
    },
    {
      "id": "g5v1-l25-c21-u6734",
      "lessonId": "g5v1-l25",
      "hanzi": "朴"
    },
    {
      "id": "g5v1-l26-c01-u55bb",
      "lessonId": "g5v1-l26",
      "hanzi": "喻"
    },
    {
      "id": "g5v1-l26-c02-u5dee",
      "lessonId": "g5v1-l26",
      "hanzi": "差"
    },
    {
      "id": "g5v1-l26-c03-u763e",
      "lessonId": "g5v1-l26",
      "hanzi": "瘾"
    },
    {
      "id": "g5v1-l26-c04-u5954",
      "lessonId": "g5v1-l26",
      "hanzi": "奔"
    },
    {
      "id": "g5v1-l26-c05-u7c4d",
      "lessonId": "g5v1-l26",
      "hanzi": "籍"
    },
    {
      "id": "g5v1-l26-c06-u9965",
      "lessonId": "g5v1-l26",
      "hanzi": "饥"
    },
    {
      "id": "g5v1-l26-c07-u507f",
      "lessonId": "g5v1-l26",
      "hanzi": "偿"
    },
    {
      "id": "g5v1-l26-c08-u7538",
      "lessonId": "g5v1-l26",
      "hanzi": "甸"
    },
    {
      "id": "g5v1-l26-c09-u609f",
      "lessonId": "g5v1-l26",
      "hanzi": "悟"
    },
    {
      "id": "g5v1-l26-c10-u9988",
      "lessonId": "g5v1-l26",
      "hanzi": "馈"
    },
    {
      "id": "g5v1-l26-c11-u78c1",
      "lessonId": "g5v1-l26",
      "hanzi": "磁"
    },
    {
      "id": "g5v1-l26-c12-u9175",
      "lessonId": "g5v1-l26",
      "hanzi": "酵"
    },
    {
      "id": "g5v1-l26-c13-u768e",
      "lessonId": "g5v1-l26",
      "hanzi": "皎"
    },
    {
      "id": "g5v1-l26-c14-u9274",
      "lessonId": "g5v1-l26",
      "hanzi": "鉴"
    },
    {
      "id": "g5v1-l26-c15-u6ca5",
      "lessonId": "g5v1-l26",
      "hanzi": "沥"
    }
  ]
};

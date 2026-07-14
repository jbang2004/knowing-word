/* This catalog is a sanitized, public learning dataset. It deliberately excludes account, enrollment, progress, media URLs, and all signed asset URLs. */

export type ExerciseKind = "single" | "structure" | "components" | "write";

export type Exercise = {
  id: string;
  origin: string;
  kind: ExerciseKind;
  questionType: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; radical: boolean }[];
  explanation: string;
};

export type CharacterItem = {
  id: string; lessonId: string; lessonTitle: string; lessonPosition: number; word: string; wordPosition: number; hanzi: string; primary: boolean; ready: boolean; pinyin: string; charType: string; decomposition: string; originalMeaning: string; description: string; originalText: string; parts: { char: string; radical: boolean }[]; compositions: { char: string; description: string; charType: string; children: string[] }[]; exercises: Exercise[];
};

export type ComponentItem = {
  id: string; title: string; glyph: string; examples: string[]; description: string; characterSet: string[]; group: number; sequence: number;
};

export const catalog = {
  "course": {
    "title": "语文 · 五年级上册",
    "edition": "统编版（六三制）",
    "grade": 5
  },
  "lessons": [
    {
      "id": "019f0523-819f-7702-89a2-75f13809d57a",
      "title": "桂花雨",
      "position": 1
    },
    {
      "id": "019f0523-819f-7702-89a2-7b176be276e5",
      "title": "落花生",
      "position": 2
    },
    {
      "id": "019f0523-819f-7702-89a2-7cf5002b615d",
      "title": "冀中的地道战",
      "position": 4
    }
  ],
  "characters": [
    {
      "id": "019f0554-ea21-740f-af56-8f5393f25abc",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "桂花",
      "wordPosition": 1,
      "hanzi": "桂",
      "primary": true,
      "ready": true,
      "pinyin": "guì",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "肉桂",
      "description": "形声字，左右结构，本义是肉桂。左边的“木”，表示“桂”的本义与植物有关；右边的“圭”本义是玉制礼器，在这里提示读音。我们可以将字形这样联想：秋天的大树枝头，挂满了像玉圭一样金黄色的小花，小朋友们站在树下的小土堆上去闻那扑鼻的香气。在这里“桂花”的“桂”就指桂花树。",
      "originalText": "中秋节前后，正是故乡桂花盛开的时节。",
      "parts": [
        {
          "char": "木",
          "radical": true
        },
        {
          "char": "圭",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "木",
          "description": "“木”是象形字，字形就像一棵有枝干、有树根的大树，本义就是树。现在也常用来指木头。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "圭",
          "description": "“圭”是两个“土”上下叠成的会意字，本义是古代帝王诸侯举行典礼时手持的玉制礼器，上圆下方。古代用圭作分封土地的凭证，所以字形用两个“土”来表示。",
          "charType": "会意字",
          "children": [
            "土",
            "土"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d764-7510-b938-f076f8dce58b",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“桂”的本义是？",
          "options": [
            {
              "id": "019f140f-d764-7510-b938-f076f8dce58b-0",
              "text": "警告，规劝，让人有所警觉注意",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f076f8dce58b-1",
              "text": "细丝",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f076f8dce58b-2",
              "text": "肉桂",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d764-7510-b938-f7aac77a3f5c",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“桂”是什么结构?",
          "options": [
            {
              "id": "019f140f-d764-7510-b938-f7aac77a3f5c-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f7aac77a3f5c-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f7aac77a3f5c-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f7aac77a3f5c-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“桂”字的结构吧。"
        },
        {
          "id": "019f140f-d764-7510-b938-f8a402d03c0a",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“桂”字呢？",
          "options": [
            {
              "id": "019f140f-d764-7510-b938-f8a402d03c0a-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f8a402d03c0a-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-f8a402d03c0a-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“桂”的本义是肉桂哟。"
        },
        {
          "id": "019f140f-d764-7510-b938-ff1eafb966b3",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“桂”的部件。",
          "options": [
            {
              "id": "019f140f-d764-7510-b938-ff1eafb966b3-0",
              "text": "圭",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-ff1eafb966b3-1",
              "text": "予",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d764-7510-b938-ff1eafb966b3-2",
              "text": "奉",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d764-7510-b938-ff1eafb966b3-3",
              "text": "木",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d764-7510-b939-03245bad52ba",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“桂”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d772-740e-8e05-508632a7c8ca",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“桂”的部件。",
          "options": [
            {
              "id": "019f140f-d772-740e-8e05-508632a7c8ca-0",
              "text": "木",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d772-740e-8e05-508632a7c8ca-1",
              "text": "叚",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d772-740e-8e05-508632a7c8ca-2",
              "text": "圭",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d772-740e-8e05-508632a7c8ca-3",
              "text": "身",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07db-7671-9959-9dc15e9fd28d",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“桂”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76d-70b8-a564-509ee7aba6a6",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“桂”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76d-70b8-a564-509ee7aba6a6-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-509ee7aba6a6-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-509ee7aba6a6-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-509ee7aba6a6-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d754-762c-bdec-85b673d3a65c",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“桂”的部件。",
          "options": [
            {
              "id": "019f140f-d754-762c-bdec-85b673d3a65c-0",
              "text": "圭",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d754-762c-bdec-85b673d3a65c-1",
              "text": "木",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d754-762c-bdec-85b673d3a65c-2",
              "text": "女",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d754-762c-bdec-85b673d3a65c-3",
              "text": "寸",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-91a530f5a84a",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "桂花",
      "wordPosition": 1,
      "hanzi": "花",
      "primary": true,
      "ready": true,
      "pinyin": "huā",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "花朵",
      "description": "花是形声字，上下结构，本义是花朵。上面的“艹”本义是草，表示“花”的含义与植物有关；下面的“化”本义是变化，在这里提示读音。我们可以这样联想：草木长出绿色枝叶后，会慢慢开五颜六色的花朵，这是植物生长中最美的一次变化，所以用表示变化的“化”来记。“桂花”的“花”就是桂树开出的花朵。",
      "originalText": "中秋节前后，正是故乡桂花盛开的时节。",
      "parts": [
        {
          "char": "艹",
          "radical": true
        },
        {
          "char": "化",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "艹",
          "description": "艹是艸的偏旁变体。“艸”是象形字，独体字，本义是草。作偏旁写在字的上面就写成“艹”（草字头），带“艹”的字大多和草、植物有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "化",
          "description": "“化”是一个会意字，左边是一个正立的人，右边是一个倒立的人。它就像一个人翻了个跟头，样子完全变了。所以“化”的本义就是“变化”，指事物在形态或性质上发生改变。",
          "charType": "会意字",
          "children": [
            "人",
            "七"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d767-735e-8064-fe71d3ec0881",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“花”的本义是？",
          "options": [
            {
              "id": "019f140f-d767-735e-8064-fe71d3ec0881-0",
              "text": "婴儿",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8064-fe71d3ec0881-1",
              "text": "花朵",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8064-fe71d3ec0881-2",
              "text": "大声呼喝",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d767-735e-8065-00c832c8ddad",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“花”是什么结构?",
          "options": [
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“花”字的结构吧。"
        },
        {
          "id": "019f140f-d767-735e-8065-05681be565aa",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“花”字呢？",
          "options": [
            {
              "id": "019f140f-d767-735e-8065-05681be565aa-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-05681be565aa-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-05681be565aa-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“花”的本义是花朵哟。"
        },
        {
          "id": "019f140f-d767-735e-8065-0a85d7556f3c",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“花”的部件。",
          "options": [
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-0",
              "text": "卓",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-1",
              "text": "化",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-2",
              "text": "折",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-3",
              "text": "艹",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d767-735e-8065-0ca02f921984",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“花”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d774-749d-a748-030e9463a109",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“花”的部件。",
          "options": [
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-0",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-1",
              "text": "亚",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-2",
              "text": "化",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-3",
              "text": "夋",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07de-7035-a0a0-3ffe926440c1",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“花”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“花”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d756-764a-a49b-33315b21de09",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“花”的部件。",
          "options": [
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-0",
              "text": "扌",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-1",
              "text": "化",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-2",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-3",
              "text": "欠",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-98e4990b31e9",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "故乡",
      "wordPosition": 2,
      "hanzi": "故",
      "primary": true,
      "ready": true,
      "pinyin": "gù",
      "charType": "会意兼形声字",
      "decomposition": "左右结构",
      "originalMeaning": "旧、从前",
      "description": "会意兼形声字，左右结构，本义是旧、从前。左边的“古”本义是坚固的盾牌，在这里提示读音、也表意；右边的“攵”本义是手拿小棍子轻击。我们可以将字形这样联想：人类用手拿着盾牌大战是很久以前的事情了，所以“故”有时间久远的意思；时间久远就表示事情早已经过去，于是“故”表示从前、旧时。在“故乡”里，“故”就指从前的、早年的，“故乡”就是自己早年出生、从小长大、早已成为从前回忆的老家。",
      "originalText": "中秋节前后，正是故乡桂花盛开的时节。",
      "parts": [
        {
          "char": "古",
          "radical": true
        },
        {
          "char": "攵",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "古",
          "description": "“古”是会意字，上面是“十”，下面是“口”。它的本义是过去久远年代的事物。古人用“十”表示很多人，“口”表示嘴，合起来表示许多张嘴代代相传的往事，所以“古”指很久以前的年代。",
          "charType": "会意字",
          "children": [
            "十",
            "口"
          ]
        },
        {
          "char": "攵",
          "description": "“攵”是“攴”作偏旁时的写法，会意字，字形是一只手拿着小棍棒，本义是手持棍棒轻敲、敲打。带“攵”的字大多和手的动作、敲打有关，如收、教、攻。",
          "charType": "会意字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d762-75c4-8f47-d28af829f539",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“故”的本义是？",
          "options": [
            {
              "id": "019f140f-d762-75c4-8f47-d28af829f539-0",
              "text": "向上或向前移动，前行（与“退”相对）",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-d28af829f539-1",
              "text": "背着、背负",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-d28af829f539-2",
              "text": "使人做事",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d762-75c4-8f47-d4a10efdc59e",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“故”是什么结构?",
          "options": [
            {
              "id": "019f140f-d762-75c4-8f47-d4a10efdc59e-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-d4a10efdc59e-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-d4a10efdc59e-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-d4a10efdc59e-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“故”字的结构吧。"
        },
        {
          "id": "019f140f-d762-75c4-8f47-daebab48b494",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“故”字呢？",
          "options": [
            {
              "id": "019f140f-d762-75c4-8f47-daebab48b494-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-daebab48b494-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-daebab48b494-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“故”的本义是使人做事哟。"
        },
        {
          "id": "019f140f-d762-75c4-8f47-dfc011dfa490",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“故”的部件。",
          "options": [
            {
              "id": "019f140f-d762-75c4-8f47-dfc011dfa490-0",
              "text": "古",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d762-75c4-8f47-dfc011dfa490-1",
              "text": "亍",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d762-75c4-8f47-dfc011dfa490-2",
              "text": "片",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d762-75c4-8f47-dfc011dfa490-3",
              "text": "攵",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d762-75c4-8f47-e0515e7ded9b",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“故”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d772-740e-8e05-3cfca38075d4",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“故”的部件。",
          "options": [
            {
              "id": "019f140f-d772-740e-8e05-3cfca38075d4-0",
              "text": "古",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d772-740e-8e05-3cfca38075d4-1",
              "text": "攵",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d772-740e-8e05-3cfca38075d4-2",
              "text": "儿",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d772-740e-8e05-3cfca38075d4-3",
              "text": "爿",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d9-749b-bb13-9109ee8ca1a9",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“故”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d772-740e-8e05-44d614c334b8",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“古”的部件。",
          "options": [
            {
              "id": "019f140f-d772-740e-8e05-44d614c334b8-0",
              "text": "扁",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d772-740e-8e05-44d614c334b8-1",
              "text": "乙",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d772-740e-8e05-44d614c334b8-2",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d772-740e-8e05-44d614c334b8-3",
              "text": "十",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d9-749b-bb13-97e590e5c7a5",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“古”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76d-70b8-a564-4b113fb202af",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“故”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76d-70b8-a564-4b113fb202af-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-4b113fb202af-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-4b113fb202af-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-4b113fb202af-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d752-73f0-a037-77ecb471d72d",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“故”的部件。",
          "options": [
            {
              "id": "019f140f-d752-73f0-a037-77ecb471d72d-0",
              "text": "古",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d752-73f0-a037-77ecb471d72d-1",
              "text": "月",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d752-73f0-a037-77ecb471d72d-2",
              "text": "攵",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d752-73f0-a037-77ecb471d72d-3",
              "text": "吏",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-9f077aee3190",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "故乡",
      "wordPosition": 2,
      "hanzi": "乡",
      "primary": true,
      "ready": true,
      "pinyin": "xiāng",
      "charType": "会意字",
      "decomposition": "独体字",
      "originalMeaning": "享用",
      "description": "会意字，独体字。它的甲骨文画的是两个人张着嘴巴面对面坐着，中间摆着一件盛满食物的食器，表示两个人对坐共同享用食物的情形，所以本义是享用。简体字的“乡”是两个跪坐的人重叠在一起的侧影。能凑在一起吃饭的，多是住在同一个地方、一起生活的族人，所以“乡”后来引申出家乡、乡村的意思。我们可以将字形联想成：来自同一个地方、一起生活的人们总会坐在一起吃饭。在“故乡”里，“乡”就指自己出生、长大的家乡。",
      "originalText": "中秋节前后，正是故乡桂花盛开的时节。",
      "parts": [
        {
          "char": "乡",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d759-749d-a8f3-ff4eb79869ef",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“乡”的本义是？",
          "options": [
            {
              "id": "019f140f-d759-749d-a8f3-ff4eb79869ef-0",
              "text": "大地",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f3-ff4eb79869ef-1",
              "text": "二人相向对食",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f3-ff4eb79869ef-2",
              "text": "放，放下",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d759-749d-a8f4-02466c164130",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“乡”是什么结构?",
          "options": [
            {
              "id": "019f140f-d759-749d-a8f4-02466c164130-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f4-02466c164130-1",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f4-02466c164130-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f4-02466c164130-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“乡”字的结构吧。"
        },
        {
          "id": "019f140f-d759-749d-a8f4-047a5112e2bc",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“乡”字呢？",
          "options": [
            {
              "id": "019f140f-d759-749d-a8f4-047a5112e2bc-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f4-047a5112e2bc-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d759-749d-a8f4-047a5112e2bc-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“乡”的本义是二人相向对食哟。"
        },
        {
          "id": "019f140f-d759-749d-a8f4-092ba9bc0bcc",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“乡”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07cd-7202-8c86-86209be7007c",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“乡”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76b-71c4-b8ea-48896604c012",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“乡”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76b-71c4-b8ea-48896604c012-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-48896604c012-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-48896604c012-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-48896604c012-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d749-7728-bf2e-1b9b45dd0d2f",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“乡”的部件。",
          "options": [
            {
              "id": "019f140f-d749-7728-bf2e-1b9b45dd0d2f-0",
              "text": "乡",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d749-7728-bf2e-1b9b45dd0d2f-1",
              "text": "氵",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d749-7728-bf2e-1b9b45dd0d2f-2",
              "text": "欠",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d749-7728-bf2e-1b9b45dd0d2f-3",
              "text": "斤",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-a849ce35f999",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "欣赏",
      "wordPosition": 3,
      "hanzi": "赏",
      "primary": true,
      "ready": false,
      "pinyin": "shǎng",
      "charType": "会意兼形声字",
      "decomposition": "上下结构",
      "originalMeaning": "奖励，赐予，赠予",
      "description": "会意兼形声字，上下结构，本义是奖励，赐予，赠予。上面的“尚”本义是酒器，在这里提示读音、也表意：古代赏赐有功的人要赐酒，就用酒器代表赏赐；下面的“贝”本义是贝壳，古代用作货币，表示赏赐的钱财。我们还可以这样联想：“尚”是酒器，古代有功的人会被赐酒庆功，端起这只酒器就是受赏，所以用“尚”记“赏”的赐予。奖赏是因为认可、赞许一个人做得好，于是“赏”由奖赏引申出称赞、赞扬；心怀赞赏，就会喜爱地去观看、品味，又引申为欣赏、玩赏，在“欣赏”里就指带着喜爱去观赏花的美好。",
      "originalText": "小时候，我无论对什么花，都不懂得欣赏。",
      "parts": [
        {
          "char": "尚",
          "radical": true
        },
        {
          "char": "贝",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "尚",
          "description": "“尚”是一个象形字，它的古文字形就像一只盛酒的器具。它的本义是“酒器”。现在“尚”常用来表示“崇尚”“尊崇”的意思，和本义差别很大。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "贝",
          "description": "“贝”是象形字，独体字，本义是海贝。甲骨文的字形像海贝形，上古时贝壳曾被用作货币。凡是带“贝”的字，往往跟财货有关，如财、货。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d769-70e8-bd35-8ab70253f500",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“赏”的本义是？",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-8ab70253f500-0",
              "text": "奖励，赐予，赠予",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-8ab70253f500-1",
              "text": "花朵",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-8ab70253f500-2",
              "text": "按着、凭借",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d769-70e8-bd35-8fbf2b8b20ba",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“赏”是什么结构?",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-8fbf2b8b20ba-0",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-8fbf2b8b20ba-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-8fbf2b8b20ba-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-8fbf2b8b20ba-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“赏”字的结构吧。"
        },
        {
          "id": "019f140f-d769-70e8-bd35-92f7ea289fdf",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“赏”字呢？",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-92f7ea289fdf-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-92f7ea289fdf-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-92f7ea289fdf-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“赏”的本义是奖励，赐予，赠予哟。"
        },
        {
          "id": "019f140f-d769-70e8-bd35-9408942fbd62",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“赏”的部件。",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-9408942fbd62-0",
              "text": "乂",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-9408942fbd62-1",
              "text": "氵",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d769-70e8-bd35-9408942fbd62-2",
              "text": "贝",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-9408942fbd62-3",
              "text": "尚",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d769-70e8-bd35-98115bb34264",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“赏”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d774-749d-a748-1a73b9473580",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“赏”的部件。",
          "options": [
            {
              "id": "019f140f-d774-749d-a748-1a73b9473580-0",
              "text": "尚",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-1a73b9473580-1",
              "text": "贝",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d774-749d-a748-1a73b9473580-2",
              "text": "多",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d774-749d-a748-1a73b9473580-3",
              "text": "去",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07df-717c-8ea1-87159e015e4b",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“赏”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76f-75fe-8b38-d62f9135f1da",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“赏”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76f-75fe-8b38-d62f9135f1da-0",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-d62f9135f1da-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-d62f9135f1da-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-d62f9135f1da-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d757-7663-bd21-4f4cdbcda512",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“赏”的部件。",
          "options": [
            {
              "id": "019f140f-d757-7663-bd21-4f4cdbcda512-0",
              "text": "贝",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d757-7663-bd21-4f4cdbcda512-1",
              "text": "尚",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d757-7663-bd21-4f4cdbcda512-2",
              "text": "攵",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d757-7663-bd21-4f4cdbcda512-3",
              "text": "禾",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-a597cc432bfa",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "欣赏",
      "wordPosition": 3,
      "hanzi": "欣",
      "primary": true,
      "ready": true,
      "pinyin": "xīn",
      "charType": "会意兼形声字",
      "decomposition": "左右结构",
      "originalMeaning": "喜悦，快乐",
      "description": "会意兼形声字，左右结构。左边的“斤”本义是斧子，在这里提示读音；右边的“欠”本义是张口出气，人们高兴时会张口哈哈大笑，所以本义是喜悦，快乐。我们可以将字形联想成：古人扛着斧子上山砍柴，结果有了很多收获，心里高兴得哈哈大笑。“欣赏”的“欣”就是内心愉悦、喜悦。",
      "originalText": "小时候，我无论对什么花，都不懂得欣赏。",
      "parts": [
        {
          "char": "斤",
          "radical": true
        },
        {
          "char": "欠",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "斤",
          "description": "“斤”是象形字，独体字。甲骨文的字形像横刃锛斧形，本义是砍木头的横刃锛斧。凡是带“斤”的字，往往跟斧子或用斧子劈开等义有关，如折、斩、新等。后来，“斤”被借用作重量单位，如“一斤”。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "欠",
          "description": "“欠”是象形字，像一个人张大嘴巴向外吐气，本义是打呵欠。现在“欠”常表示缺少、亏欠。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d765-7578-94e7-77f0ef3dbcb9",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“欣”的本义是？",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-77f0ef3dbcb9-0",
              "text": "开阔",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-77f0ef3dbcb9-1",
              "text": "喜悦，快乐",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-77f0ef3dbcb9-2",
              "text": "山体倒塌",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d765-7578-94e7-7bdaa0394aa4",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“欣”是什么结构?",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-7bdaa0394aa4-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-7bdaa0394aa4-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-7bdaa0394aa4-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-7bdaa0394aa4-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“欣”字的结构吧。"
        },
        {
          "id": "019f140f-d765-7578-94e7-7ea3c5d08fa2",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“欣”字呢？",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-7ea3c5d08fa2-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-7ea3c5d08fa2-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-7ea3c5d08fa2-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“欣”的本义是喜悦，快乐哟。"
        },
        {
          "id": "019f140f-d765-7578-94e7-833df82e7c60",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“欣”的部件。",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-833df82e7c60-0",
              "text": "欠",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-833df82e7c60-1",
              "text": "屯",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d765-7578-94e7-833df82e7c60-2",
              "text": "川",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d765-7578-94e7-833df82e7c60-3",
              "text": "斤",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d765-7578-94e7-8620642ddb57",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“欣”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d773-70dc-80c7-c1bc6b52fbe0",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“欣”的部件。",
          "options": [
            {
              "id": "019f140f-d773-70dc-80c7-c1bc6b52fbe0-0",
              "text": "欠",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d773-70dc-80c7-c1bc6b52fbe0-1",
              "text": "斤",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d773-70dc-80c7-c1bc6b52fbe0-2",
              "text": "束",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d773-70dc-80c7-c1bc6b52fbe0-3",
              "text": "其",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07dc-7037-8f61-5e60941afd38",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“欣”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76e-70ba-96a6-bc53a8e08512",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“欣”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76e-70ba-96a6-bc53a8e08512-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-bc53a8e08512-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-bc53a8e08512-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-bc53a8e08512-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d754-762c-bdec-8b08a3b75991",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“欣”的部件。",
          "options": [
            {
              "id": "019f140f-d754-762c-bdec-8b08a3b75991-0",
              "text": "忄",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d754-762c-bdec-8b08a3b75991-1",
              "text": "扌",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d754-762c-bdec-8b08a3b75991-2",
              "text": "斤",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d754-762c-bdec-8b08a3b75991-3",
              "text": "欠",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-bbfbd3faf147",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "木兰花",
      "wordPosition": 4,
      "hanzi": "花",
      "primary": false,
      "ready": true,
      "pinyin": "huā",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "花朵",
      "description": "花是形声字，上下结构，本义是花朵。上面的“艹”本义是草，表示“花”的含义与植物有关；下面的“化”本义是变化，在这里提示读音。我们可以这样联想：草木长出绿色枝叶后，会慢慢开五颜六色的花朵，这是植物生长中最美的一次变化，所以用表示变化的“化”来记。",
      "originalText": "父亲总是指指点点地告诉我，这是梅花，那是木兰花……但我除了记些名字外，并不喜欢。",
      "parts": [
        {
          "char": "艹",
          "radical": true
        },
        {
          "char": "化",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "艹",
          "description": "艹是艸的偏旁变体。“艸”是象形字，独体字，本义是草。作偏旁写在字的上面就写成“艹”（草字头），带“艹”的字大多和草、植物有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "化",
          "description": "“化”是一个会意字，左边是一个正立的人，右边是一个倒立的人。它就像一个人翻了个跟头，样子完全变了。所以“化”的本义就是“变化”，指事物在形态或性质上发生改变。",
          "charType": "会意字",
          "children": [
            "人",
            "七"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d767-735e-8064-fe71d3ec0881",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“花”的本义是？",
          "options": [
            {
              "id": "019f140f-d767-735e-8064-fe71d3ec0881-0",
              "text": "婴儿",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8064-fe71d3ec0881-1",
              "text": "花朵",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8064-fe71d3ec0881-2",
              "text": "大声呼喝",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d767-735e-8065-00c832c8ddad",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“花”是什么结构?",
          "options": [
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-00c832c8ddad-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“花”字的结构吧。"
        },
        {
          "id": "019f140f-d767-735e-8065-05681be565aa",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“花”字呢？",
          "options": [
            {
              "id": "019f140f-d767-735e-8065-05681be565aa-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-05681be565aa-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-05681be565aa-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“花”的本义是花朵哟。"
        },
        {
          "id": "019f140f-d767-735e-8065-0a85d7556f3c",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“花”的部件。",
          "options": [
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-0",
              "text": "卓",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-1",
              "text": "化",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-2",
              "text": "折",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d767-735e-8065-0a85d7556f3c-3",
              "text": "艹",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d767-735e-8065-0ca02f921984",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“花”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d774-749d-a748-030e9463a109",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“花”的部件。",
          "options": [
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-0",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-1",
              "text": "亚",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-2",
              "text": "化",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d774-749d-a748-030e9463a109-3",
              "text": "夋",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07de-7035-a0a0-3ffe926440c1",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“花”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“花”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c97ad3cd6354-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d756-764a-a49b-33315b21de09",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“花”的部件。",
          "options": [
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-0",
              "text": "扌",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-1",
              "text": "化",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-2",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d756-764a-a49b-33315b21de09-3",
              "text": "欠",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-b5a49431c08a",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "木兰花",
      "wordPosition": 4,
      "hanzi": "兰",
      "primary": true,
      "ready": true,
      "pinyin": "lán",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "兰草",
      "description": "形声字，上下结构，本义是兰草，一种全株带香气的草。它的繁体写作“蘭”，上面的“艹”本义是草，表示“蘭”的含义与植物有关；下面的“闌”本义是门前的栅栏，在这里提示读音。简体把繁体换成了好写的“丷”加“三”：“丷”本义是分开、向两边张开，“三”本义是数字三。我们可以这样联想：一株兰草的叶子从根部往两边分开，中间有两朵像“丷”形张开的花，花下面有三条细长的叶子。这里的木兰花是兰草的一种，开花时香气浓郁。",
      "originalText": "父亲总是指指点点地告诉我，这是梅花，那是木兰花……但我除了记些名字外，并不喜欢。",
      "parts": [
        {
          "char": "兰",
          "radical": true
        }
      ],
      "compositions": [
        {
          "char": "丷",
          "description": "丷是八的偏旁变体。八是指事字，用两笔向两边分开的线条表示分开的意思，本义就是分开。后来借用来表示数字八。",
          "charType": "指事字",
          "children": []
        },
        {
          "char": "三",
          "description": "“三”是指事字，独体字，古人用三横来记数，本义就是数字三。三横一层层叠着，所以“三”也常表示数量多。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d75c-73ff-b09c-804dcbd2622f",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“兰”的本义是？",
          "options": [
            {
              "id": "019f140f-d75c-73ff-b09c-804dcbd2622f-0",
              "text": "树",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-804dcbd2622f-1",
              "text": "兰草",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-804dcbd2622f-2",
              "text": "古代的一种兵器",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75c-73ff-b09c-861c5a3a8c8a",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“兰”是什么结构?",
          "options": [
            {
              "id": "019f140f-d75c-73ff-b09c-861c5a3a8c8a-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-861c5a3a8c8a-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-861c5a3a8c8a-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-861c5a3a8c8a-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“兰”字的结构吧。"
        },
        {
          "id": "019f140f-d75c-73ff-b09c-89a1b3de5515",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“兰”字呢？",
          "options": [
            {
              "id": "019f140f-d75c-73ff-b09c-89a1b3de5515-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-89a1b3de5515-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-89a1b3de5515-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“兰”的本义是兰草哟。"
        },
        {
          "id": "019f140f-d75c-73ff-b09c-92ae475dc955",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“兰”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07d2-721d-afaa-48671eae8be6",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“兰”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76b-71c4-b8ea-51d43767b3e7",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“兰”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76b-71c4-b8ea-51d43767b3e7-0",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-51d43767b3e7-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-51d43767b3e7-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-51d43767b3e7-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d74d-74aa-9b36-4de908a19421",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“兰”的部件。",
          "options": [
            {
              "id": "019f140f-d74d-74aa-9b36-4de908a19421-0",
              "text": "果",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d74d-74aa-9b36-4de908a19421-1",
              "text": "兰",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d74d-74aa-9b36-4de908a19421-2",
              "text": "生",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d74d-74aa-9b36-4de908a19421-3",
              "text": "刀",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-b2be37c57c6f",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "木兰花",
      "wordPosition": 4,
      "hanzi": "木",
      "primary": true,
      "ready": true,
      "pinyin": "mù",
      "charType": "象形",
      "decomposition": "独体字",
      "originalMeaning": "树",
      "description": "象形字，独体字，本义是树。甲骨文就是画出一棵树的轮廓，上面伸出的是枝叶，中间一竖是树干，下面分开的是树根，所以“木”指的就是树木。",
      "originalText": "父亲总是指指点点地告诉我，这是梅花，那是木兰花……但我除了记些名字外，并不喜欢。",
      "parts": [
        {
          "char": "木",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d763-70a0-a0cb-436873f6d04e",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“木”的本义是？",
          "options": [
            {
              "id": "019f140f-d763-70a0-a0cb-436873f6d04e-0",
              "text": "依靠",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-436873f6d04e-1",
              "text": "树",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-436873f6d04e-2",
              "text": "禾麦吐穗上平整",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d763-70a0-a0cb-471532cf30b5",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“木”是什么结构?",
          "options": [
            {
              "id": "019f140f-d763-70a0-a0cb-471532cf30b5-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-471532cf30b5-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-471532cf30b5-2",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-471532cf30b5-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“木”字的结构吧。"
        },
        {
          "id": "019f140f-d763-70a0-a0cb-4b5f8e0539ad",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“木”字呢？",
          "options": [
            {
              "id": "019f140f-d763-70a0-a0cb-4b5f8e0539ad-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-4b5f8e0539ad-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d763-70a0-a0cb-4b5f8e0539ad-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“木”的本义是树哟。"
        },
        {
          "id": "019f140f-d763-70a0-a0cb-4e6b380c3497",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“木”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07d9-749b-bb13-9a393b6d5f70",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“木”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76d-70b8-a564-4d5b5c480453",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“木”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76d-70b8-a564-4d5b5c480453-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-4d5b5c480453-1",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-4d5b5c480453-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76d-70b8-a564-4d5b5c480453-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d753-770f-a172-5d5be17d7b00",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“木”的部件。",
          "options": [
            {
              "id": "019f140f-d753-770f-a172-5d5be17d7b00-0",
              "text": "木",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d753-770f-a172-5d5be17d7b00-1",
              "text": "人",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d753-770f-a172-5d5be17d7b00-2",
              "text": "马",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d753-770f-a172-5d5be17d7b00-3",
              "text": "口",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-c69fa0ab0a63",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "台风",
      "wordPosition": 5,
      "hanzi": "风",
      "primary": true,
      "ready": true,
      "pinyin": "fēng",
      "charType": "形声字",
      "decomposition": "半包围结构",
      "originalMeaning": "因气压差异而产生的与地面大致平行的空气流动现象",
      "description": "形声字，半包围结构。 外面的“几”可以想象为风姑娘的嘴巴，里面“乂”可以想象为气流，风姑娘张开嘴吹气，风就来了。",
      "originalText": "故乡靠海，八月是台风季节。",
      "parts": [
        {
          "char": "几",
          "radical": true
        },
        {
          "char": "乂",
          "radical": false
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d769-70e8-bd35-9cbac8086326",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“风”的本义是？",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-9cbac8086326-0",
              "text": "日落、傍晚（“暮”的本字）",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-9cbac8086326-1",
              "text": "放，放下",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-9cbac8086326-2",
              "text": "因气压差异而产生的与地面大致平行的空气流动现象",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d769-70e8-bd35-a1b3cd943e46",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“风”是什么结构?",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-a1b3cd943e46-0",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-a1b3cd943e46-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-a1b3cd943e46-2",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-a1b3cd943e46-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“风”字的结构吧。"
        },
        {
          "id": "019f140f-d769-70e8-bd35-a58e06c35664",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“风”字呢？",
          "options": [
            {
              "id": "019f140f-d769-70e8-bd35-a58e06c35664-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-a58e06c35664-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d769-70e8-bd35-a58e06c35664-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“风”的本义是因气压差异而产生的与地面大致平行的空气流动现象哟。"
        },
        {
          "id": "019f140f-d769-70e8-bd35-abaee8b94e4e",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“风”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07e0-729b-ac1b-d19ac7cf1c59",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“风”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76f-75fe-8b38-d9458b9012e6",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“风”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76f-75fe-8b38-d9458b9012e6-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-d9458b9012e6-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-d9458b9012e6-2",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-d9458b9012e6-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d758-7073-a513-caf683553aa6",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“风”的部件。",
          "options": [
            {
              "id": "019f140f-d758-7073-a513-caf683553aa6-0",
              "text": "氵",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d758-7073-a513-caf683553aa6-1",
              "text": "几",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d758-7073-a513-caf683553aa6-2",
              "text": "欠",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d758-7073-a513-caf683553aa6-3",
              "text": "乂",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-c30d06561eab",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "台风",
      "wordPosition": 5,
      "hanzi": "台",
      "primary": true,
      "ready": true,
      "pinyin": "tái",
      "charType": "会意字",
      "decomposition": "独体字",
      "originalMeaning": "用泥土修筑、高而平坦的建筑，也就是高台",
      "description": "象形字，独体字，本义是用泥土修筑、高而平坦的建筑，也就是高台。整个字形描摹出古代高台、戏台的模样：上方的“厶”像高台顶端，下方的“口”像高台下面平整的基座，所以“台”的本义就是高台。后来也引申泛指所有高而平的地方。普通的风贴近海面平稳吹拂，而台风风力强劲，云团会向上大幅隆起，远远望去，仿佛海面凭空矗立起一座巨型高台，所以就借用表高台的“台”字，把这种破坏力极强的大风叫作台风。",
      "originalText": "故乡靠海，八月是台风季节。",
      "parts": [
        {
          "char": "台",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d75e-76b0-8e7c-6ebd08ecb722",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“台”的本义是？",
          "options": [
            {
              "id": "019f140f-d75e-76b0-8e7c-6ebd08ecb722-0",
              "text": "怀胎",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-6ebd08ecb722-1",
              "text": "多条河水合流，水势盛大",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-6ebd08ecb722-2",
              "text": "辈分，特指人与人之间长幼尊卑的关系",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75e-76b0-8e7c-72aa6244fc05",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“台”是什么结构?",
          "options": [
            {
              "id": "019f140f-d75e-76b0-8e7c-72aa6244fc05-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-72aa6244fc05-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-72aa6244fc05-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-72aa6244fc05-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“台”字的结构吧。"
        },
        {
          "id": "019f140f-d75e-76b0-8e7c-77edd11ce11c",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“台”字呢？",
          "options": [
            {
              "id": "019f140f-d75e-76b0-8e7c-77edd11ce11c-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-77edd11ce11c-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-77edd11ce11c-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“台”的本义是怀胎哟。"
        },
        {
          "id": "019f140f-d75e-76b0-8e7c-7b7fbe92075a",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“台”的部件。",
          "options": [
            {
              "id": "019f140f-d75e-76b0-8e7c-7b7fbe92075a-0",
              "text": "卩又",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-7b7fbe92075a-1",
              "text": "厶",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-7b7fbe92075a-2",
              "text": "心",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75e-76b0-8e7c-7b7fbe92075a-3",
              "text": "口",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75e-76b0-8e7c-7d0efbb3877c",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“台”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d770-730c-964c-c70eaf08e4a2",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“台”的部件。",
          "options": [
            {
              "id": "019f140f-d770-730c-964c-c70eaf08e4a2-0",
              "text": "古",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d770-730c-964c-c70eaf08e4a2-1",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d770-730c-964c-c70eaf08e4a2-2",
              "text": "癶",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d770-730c-964c-c70eaf08e4a2-3",
              "text": "厶",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d5-7028-8d2c-cc79dde159e2",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“台”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76c-7013-8010-7b80aa9f5daa",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“台”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76c-7013-8010-7b80aa9f5daa-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-7b80aa9f5daa-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-7b80aa9f5daa-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-7b80aa9f5daa-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d74f-748b-a4b3-392d882b0475",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“台”的部件。",
          "options": [
            {
              "id": "019f140f-d74f-748b-a4b3-392d882b0475-0",
              "text": "厶",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d74f-748b-a4b3-392d882b0475-1",
              "text": "又",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d74f-748b-a4b3-392d882b0475-2",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d74f-748b-a4b3-392d882b0475-3",
              "text": "米",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-cee56e724f90",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "老婆婆",
      "wordPosition": 6,
      "hanzi": "老",
      "primary": true,
      "ready": true,
      "pinyin": "lǎo",
      "charType": "象形字",
      "decomposition": "独体字",
      "originalMeaning": "年岁大的人",
      "description": "象形字，独体字，本义是年岁大的人。甲骨文画的是一位披着长发、弯着腰、拄着拐杖的老人，“老”的整个字就是照着拄拐杖的老人样子描下来的。后来字形慢慢变整齐，甲骨文中表示头发的部分变成了“耂”，下面拄杖的手变成了“匕”。",
      "originalText": "送一箩给胡家老爷爷，送一箩给毛家老婆婆，他们两家糕饼做得多。”",
      "parts": [
        {
          "char": "耂",
          "radical": true
        },
        {
          "char": "匕",
          "radical": false
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d766-70dd-b8ff-286959f41045",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“老”的本义是？",
          "options": [
            {
              "id": "019f140f-d766-70dd-b8ff-286959f41045-0",
              "text": "年岁大的人",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-286959f41045-1",
              "text": "马鸣",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-286959f41045-2",
              "text": "水流滚动的样子",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d766-70dd-b8ff-2e3cfd5fa306",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“老”是什么结构?",
          "options": [
            {
              "id": "019f140f-d766-70dd-b8ff-2e3cfd5fa306-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-2e3cfd5fa306-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-2e3cfd5fa306-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-2e3cfd5fa306-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“老”字的结构吧。"
        },
        {
          "id": "019f140f-d766-70dd-b8ff-326e2ffaed20",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“老”字呢？",
          "options": [
            {
              "id": "019f140f-d766-70dd-b8ff-326e2ffaed20-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-326e2ffaed20-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d766-70dd-b8ff-326e2ffaed20-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“老”的本义是年岁大的人哟。"
        },
        {
          "id": "019f140f-d766-70dd-b8ff-371957b67c39",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“老”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07dd-774e-ae49-fef6c20c4cff",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“老”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76e-70ba-96a6-c555342cd799",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“老”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76e-70ba-96a6-c555342cd799-0",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c555342cd799-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c555342cd799-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c555342cd799-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d756-764a-a49b-2f967b9b7784",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“老”的部件。",
          "options": [
            {
              "id": "019f140f-d756-764a-a49b-2f967b9b7784-0",
              "text": "生",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d756-764a-a49b-2f967b9b7784-1",
              "text": "耂",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d756-764a-a49b-2f967b9b7784-2",
              "text": "页",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d756-764a-a49b-2f967b9b7784-3",
              "text": "匕",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-d0a1e8088ef3",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "老婆婆",
      "wordPosition": 6,
      "hanzi": "婆",
      "primary": true,
      "ready": true,
      "pinyin": "pó",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "母亲或与母亲一辈的女子",
      "description": "婆是形声字，上下结构，本义是母亲或与母亲一辈的女子。上面的“波”本义是波浪，在这里提示读音；下面的“女”本义是女子，表示“婆”的含义与女性有关。现在我们也常用“婆婆”称呼老年妇女，结合“婆”的部件，可以这样联想记忆：脸上的皮肤有着像波浪一样皱纹的女子，就是老年妇女。",
      "originalText": "送一箩给胡家老爷爷，送一箩给毛家老婆婆，他们两家糕饼做得多。”",
      "parts": [
        {
          "char": "波",
          "radical": true
        },
        {
          "char": "女",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "波",
          "description": "“波”是会意兼形声字，由左边的“氵”（水）和右边的“皮”组成。“氵”表示水，“皮”像一层表皮，合起来表示水面像蒙了皮一样起伏，本义是掀起波浪。现在“波”也指波浪或像波浪一样起伏的现象。",
          "charType": "会意兼形声字",
          "children": [
            "氵",
            "皮"
          ]
        },
        {
          "char": "女",
          "description": "女是象形字，甲骨文画的是一个女子两手交叉在胸前、跪坐的样子，本义是未出嫁的女子，后来泛指女性。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d760-7539-8a5e-605a80c2bb5e",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“婆”的本义是？",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-605a80c2bb5e-0",
              "text": "大地",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-605a80c2bb5e-1",
              "text": "头部",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-605a80c2bb5e-2",
              "text": "母亲或与母亲一辈的女子",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d760-7539-8a5e-67ee010329c9",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“婆”是什么结构?",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“婆”字的结构吧。"
        },
        {
          "id": "019f140f-d760-7539-8a5e-6a02ba8645f0",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“婆”字呢？",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-6a02ba8645f0-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6a02ba8645f0-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6a02ba8645f0-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“婆”的本义是母亲或与母亲一辈的女子哟。"
        },
        {
          "id": "019f140f-d760-7539-8a5e-6fd0908066ea",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“婆”的部件。",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-0",
              "text": "女",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-1",
              "text": "田",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-2",
              "text": "波",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-3",
              "text": "戌",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d760-7539-8a5e-71d102796f6c",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“婆”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d771-71ef-8e81-816eb9c79e47",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“婆”的部件。",
          "options": [
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-0",
              "text": "左",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-1",
              "text": "女",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-2",
              "text": "波",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-3",
              "text": "而",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d7-737a-9359-5729edfe74aa",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“婆”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76c-7013-8010-81d19a0a6559",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“婆”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-0",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d751-714b-b28e-d0e239734f15",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“婆”的部件。",
          "options": [
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-0",
              "text": "波",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-1",
              "text": "土",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-2",
              "text": "女",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-3",
              "text": "日",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-d596ba1ac69d",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "老婆婆",
      "wordPosition": 6,
      "hanzi": "婆",
      "primary": false,
      "ready": true,
      "pinyin": "pó",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "母亲或与母亲一辈的女子",
      "description": "婆是形声字，上下结构，本义是母亲或与母亲一辈的女子。上面的“波”本义是波浪，在这里提示读音；下面的“女”本义是女子，表示“婆”的含义与女性有关。现在我们也常用“婆婆”称呼老年妇女，结合“婆”的部件，可以这样联想记忆：脸上的皮肤有着像波浪一样皱纹的女子，就是老年妇女。",
      "originalText": "送一箩给胡家老爷爷，送一箩给毛家老婆婆，他们两家糕饼做得多。”",
      "parts": [
        {
          "char": "波",
          "radical": true
        },
        {
          "char": "女",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "波",
          "description": "“波”是会意兼形声字，由左边的“氵”（水）和右边的“皮”组成。“氵”表示水，“皮”像一层表皮，合起来表示水面像蒙了皮一样起伏，本义是掀起波浪。现在“波”也指波浪或像波浪一样起伏的现象。",
          "charType": "会意兼形声字",
          "children": [
            "氵",
            "皮"
          ]
        },
        {
          "char": "女",
          "description": "女是象形字，甲骨文画的是一个女子两手交叉在胸前、跪坐的样子，本义是未出嫁的女子，后来泛指女性。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d760-7539-8a5e-605a80c2bb5e",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“婆”的本义是？",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-605a80c2bb5e-0",
              "text": "大地",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-605a80c2bb5e-1",
              "text": "头部",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-605a80c2bb5e-2",
              "text": "母亲或与母亲一辈的女子",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d760-7539-8a5e-67ee010329c9",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“婆”是什么结构?",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-67ee010329c9-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“婆”字的结构吧。"
        },
        {
          "id": "019f140f-d760-7539-8a5e-6a02ba8645f0",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“婆”字呢？",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-6a02ba8645f0-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6a02ba8645f0-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6a02ba8645f0-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“婆”的本义是母亲或与母亲一辈的女子哟。"
        },
        {
          "id": "019f140f-d760-7539-8a5e-6fd0908066ea",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“婆”的部件。",
          "options": [
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-0",
              "text": "女",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-1",
              "text": "田",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-2",
              "text": "波",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d760-7539-8a5e-6fd0908066ea-3",
              "text": "戌",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d760-7539-8a5e-71d102796f6c",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“婆”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d771-71ef-8e81-816eb9c79e47",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“婆”的部件。",
          "options": [
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-0",
              "text": "左",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-1",
              "text": "女",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-2",
              "text": "波",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d771-71ef-8e81-816eb9c79e47-3",
              "text": "而",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d7-737a-9359-5729edfe74aa",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“婆”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76c-7013-8010-81d19a0a6559",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“婆”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-0",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-81d19a0a6559-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d751-714b-b28e-d0e239734f15",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“婆”的部件。",
          "options": [
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-0",
              "text": "波",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-1",
              "text": "土",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-2",
              "text": "女",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d751-714b-b28e-d0e239734f15-3",
              "text": "日",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-e20f48f7369d",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "糕饼",
      "wordPosition": 7,
      "hanzi": "饼",
      "primary": true,
      "ready": true,
      "pinyin": "bǐng",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "烤熟或者蒸熟的面食",
      "description": "形声字，左右结构，本义是烤熟或者蒸熟的面食。左边的“饣（shí）”本义是吃饭，表示“饼”的本义与食物有关；右边的“并”本义是合并，在这里提示读音。我们可以这样联想：左边的“饣”是一个人在张口吃长长的面条，右边放着好几张合并在一起的大饼，面条和大饼都是面食。",
      "originalText": "送一箩给胡家老爷爷，送一箩给毛家老婆婆，他们两家糕饼做得多。”",
      "parts": [
        {
          "char": "饣",
          "radical": true
        },
        {
          "char": "并",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "饣",
          "description": "“饣”是“食”的偏旁变体。“食”是会意字，上下结构，本义是饭食、食物，带“饣”的字大多和饮食有关。",
          "charType": "会意字",
          "children": []
        },
        {
          "char": "并",
          "description": "“并”的古文字形像两个人并排站立在地上，是一个会意字。它的本义是“合并”或“并列”，就是把两个或几个事物合在一起。现在我们也常用它来表示“一起”的意思。",
          "charType": "会意字",
          "children": [
            "丷",
            "开"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d76a-75c9-a35b-68c405345f88",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“饼”的本义是？",
          "options": [
            {
              "id": "019f140f-d76a-75c9-a35b-68c405345f88-0",
              "text": "烤熟或者蒸熟的面食",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-68c405345f88-1",
              "text": "古人居住的半地下土窖。地室",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-68c405345f88-2",
              "text": "细丝",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d76a-75c9-a35b-6c608b3e83d2",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“饼”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76a-75c9-a35b-6c608b3e83d2-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-6c608b3e83d2-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-6c608b3e83d2-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-6c608b3e83d2-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“饼”字的结构吧。"
        },
        {
          "id": "019f140f-d76a-75c9-a35b-732ea530d37d",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“饼”字呢？",
          "options": [
            {
              "id": "019f140f-d76a-75c9-a35b-732ea530d37d-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-732ea530d37d-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-732ea530d37d-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“饼”的本义是烤熟或者蒸熟的面食哟。"
        },
        {
          "id": "019f140f-d76a-75c9-a35b-76e406b3f959",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“饼”的部件。",
          "options": [
            {
              "id": "019f140f-d76a-75c9-a35b-76e406b3f959-0",
              "text": "饣",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d76a-75c9-a35b-76e406b3f959-1",
              "text": "卉",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d76a-75c9-a35b-76e406b3f959-2",
              "text": "并",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76a-75c9-a35b-76e406b3f959-3",
              "text": "廴",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d76a-75c9-a35b-7a2d7b429699",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“饼”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d775-76ac-a59c-4cf69eea0480",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“饼”的部件。",
          "options": [
            {
              "id": "019f140f-d775-76ac-a59c-4cf69eea0480-0",
              "text": "饣",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d775-76ac-a59c-4cf69eea0480-1",
              "text": "儿",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d775-76ac-a59c-4cf69eea0480-2",
              "text": "并",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d775-76ac-a59c-4cf69eea0480-3",
              "text": "止",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07e0-729b-ac1b-d5e3b33d139e",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“饼”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76f-75fe-8b38-decc15c8f066",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“饼”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76f-75fe-8b38-decc15c8f066-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-decc15c8f066-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-decc15c8f066-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-decc15c8f066-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d758-7073-a513-cd7b257bd7c0",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“饼”的部件。",
          "options": [
            {
              "id": "019f140f-d758-7073-a513-cd7b257bd7c0-0",
              "text": "并",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d758-7073-a513-cd7b257bd7c0-1",
              "text": "口",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d758-7073-a513-cd7b257bd7c0-2",
              "text": "⺈",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d758-7073-a513-cd7b257bd7c0-3",
              "text": "饣",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-df19f47aff27",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "糕饼",
      "wordPosition": 7,
      "hanzi": "糕",
      "primary": true,
      "ready": true,
      "pinyin": "gāo",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "糕饼",
      "description": "形声字，左右结构，本义是糕饼。左边的“米”本义是小米，表示“糕”的含义与食物有关；右边的“羔”本义是小羊羔，在这里提示读音。我们可以这样联想：“羔”可以拆成“羊”和“灬”，下面的“灬”就是火，做糕点要先把大米磨成浆，再加入羊奶，放进锅里用火蒸烤才能做成。",
      "originalText": "送一箩给胡家老爷爷，送一箩给毛家老婆婆，他们两家糕饼做得多。”",
      "parts": [
        {
          "char": "米",
          "radical": true
        },
        {
          "char": "羔",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "米",
          "description": "“米”是象形字，画的是谷穗，中间一横像穗梗，上下的小点像脱壳后的米粒。本义是“小米”，也就是谷子去皮后的籽实，现在也泛指各种去壳的粮食，比如大米。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "羔",
          "description": "“羔”是形声字，上面是“羊”，下面“灬”（火）提示读音，本义是小羊羔。",
          "charType": "会意字",
          "children": [
            "羊",
            "灬"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d765-7578-94e7-88f5da02cc59",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“糕”的本义是？",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-88f5da02cc59-0",
              "text": "用动物的皮、角、骨熬制的有黏性的物质",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-88f5da02cc59-1",
              "text": "经过，经历",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-88f5da02cc59-2",
              "text": "糕饼",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d765-7578-94e7-8f4e6942ad97",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“糕”是什么结构?",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-8f4e6942ad97-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-8f4e6942ad97-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-8f4e6942ad97-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-8f4e6942ad97-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“糕”字的结构吧。"
        },
        {
          "id": "019f140f-d765-7578-94e7-90b5c301340c",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“糕”字呢？",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-90b5c301340c-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-90b5c301340c-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-90b5c301340c-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“糕”的本义是糕饼哟。"
        },
        {
          "id": "019f140f-d765-7578-94e7-952065dbfa0d",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“糕”的部件。",
          "options": [
            {
              "id": "019f140f-d765-7578-94e7-952065dbfa0d-0",
              "text": "羔",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d765-7578-94e7-952065dbfa0d-1",
              "text": "豆",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d765-7578-94e7-952065dbfa0d-2",
              "text": "米",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d765-7578-94e7-952065dbfa0d-3",
              "text": "歹",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d765-7578-94e7-9ad0135b1edd",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“糕”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d773-70dc-80c7-ca6096d35a31",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“糕”的部件。",
          "options": [
            {
              "id": "019f140f-d773-70dc-80c7-ca6096d35a31-0",
              "text": "羔",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d773-70dc-80c7-ca6096d35a31-1",
              "text": "米",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d773-70dc-80c7-ca6096d35a31-2",
              "text": "关",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d773-70dc-80c7-ca6096d35a31-3",
              "text": "忄",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07dd-774e-ae49-fbb6951d0c85",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“糕”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76e-70ba-96a6-c3d410a6149a",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“糕”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76e-70ba-96a6-c3d410a6149a-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c3d410a6149a-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c3d410a6149a-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-c3d410a6149a-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d755-736f-8e35-d565705ab09a",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“糕”的部件。",
          "options": [
            {
              "id": "019f140f-d755-736f-8e35-d565705ab09a-0",
              "text": "米",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d755-736f-8e35-d565705ab09a-1",
              "text": "羔",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d755-736f-8e35-d565705ab09a-2",
              "text": "女",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d755-736f-8e35-d565705ab09a-3",
              "text": "亻",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-ec702611da9c",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "尤其",
      "wordPosition": 8,
      "hanzi": "其",
      "primary": true,
      "ready": true,
      "pinyin": "qí",
      "charType": "象形字",
      "decomposition": "独体字",
      "originalMeaning": "簸箕",
      "description": "象形字，独体字，本义是簸箕。它的金文字形就是照着像簸箕的样子描下来的。“其”在课文中的意思跟本义“簸箕”没有关系，在“尤其”这个词里面，它是一个语气词，加在“尤”后面，帮“尤”把“特别、更进一层”的意思突显出来。",
      "originalText": "如果让它开过了，落在泥土里，尤其是被风吹落，比摇下来的香味就差多了。",
      "parts": [
        {
          "char": "其",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d75c-73ff-b09c-94138bcad921",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“其”的本义是？",
          "options": [
            {
              "id": "019f140f-d75c-73ff-b09c-94138bcad921-0",
              "text": "簸箕",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-94138bcad921-1",
              "text": "编排完整，有次序条理",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-94138bcad921-2",
              "text": "母亲或与母亲一辈的女子",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75c-73ff-b09c-9bc8f4dbd712",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“其”是什么结构?",
          "options": [
            {
              "id": "019f140f-d75c-73ff-b09c-9bc8f4dbd712-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-9bc8f4dbd712-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-9bc8f4dbd712-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-9bc8f4dbd712-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“其”字的结构吧。"
        },
        {
          "id": "019f140f-d75c-73ff-b09c-9f18ce695ca7",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“其”字呢？",
          "options": [
            {
              "id": "019f140f-d75c-73ff-b09c-9f18ce695ca7-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-9f18ce695ca7-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75c-73ff-b09c-9f18ce695ca7-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“其”的本义是簸箕哟。"
        },
        {
          "id": "019f140f-d75c-73ff-b09c-a037754df498",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“其”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07d3-7288-a7fc-c4da6acfc618",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“其”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76b-71c4-b8ea-5671595bff17",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“其”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76b-71c4-b8ea-5671595bff17-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-5671595bff17-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-5671595bff17-2",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-5671595bff17-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d74e-71be-9f1e-c1d5f783402d",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“其”的部件。",
          "options": [
            {
              "id": "019f140f-d74e-71be-9f1e-c1d5f783402d-0",
              "text": "禾",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d74e-71be-9f1e-c1d5f783402d-1",
              "text": "衤",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d74e-71be-9f1e-c1d5f783402d-2",
              "text": "吏",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d74e-71be-9f1e-c1d5f783402d-3",
              "text": "其",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-eb8a1342988b",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "尤其",
      "wordPosition": 8,
      "hanzi": "尤",
      "primary": true,
      "ready": true,
      "pinyin": "yóu",
      "charType": "指事字",
      "decomposition": "独体字",
      "originalMeaning": "赘疣",
      "description": "指事字，独体字，本义是赘疣，就是身上长出来的多余小肉瘤。甲骨文在“又”（手）上加一斜画，指出手上长出的赘疣。“尤”在课文中的意思是“特别如此”，关于这个意思，我们可以联想记忆为：人的右手摊开，大拇指有赘疣被割除了，所以贴上了一个创可贴（就是“尤”上的一点），这个创可贴在手上很显眼，很特别，因而“尤”产生了“特别如此”的意思。",
      "originalText": "如果让它开过了，落在泥土里，尤其是被风吹落，比摇下来的香味就差多了。",
      "parts": [
        {
          "char": "尤",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d761-70eb-9cbf-7e759afd865b",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“尤”的本义是？",
          "options": [
            {
              "id": "019f140f-d761-70eb-9cbf-7e759afd865b-0",
              "text": "古代祭祀时用的半只牲口",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-7e759afd865b-1",
              "text": "毛驴，一种像马而小、耳朵较长的家畜",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-7e759afd865b-2",
              "text": "赘疣",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d761-70eb-9cbf-836045fe9464",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“尤”是什么结构?",
          "options": [
            {
              "id": "019f140f-d761-70eb-9cbf-836045fe9464-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-836045fe9464-1",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-836045fe9464-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-836045fe9464-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“尤”字的结构吧。"
        },
        {
          "id": "019f140f-d761-70eb-9cbf-85b1437b8cb1",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“尤”字呢？",
          "options": [
            {
              "id": "019f140f-d761-70eb-9cbf-85b1437b8cb1-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-85b1437b8cb1-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d761-70eb-9cbf-85b1437b8cb1-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“尤”的本义是赘疣哟。"
        },
        {
          "id": "019f140f-d761-70eb-9cbf-8b0d4e43b0fe",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“尤”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07d8-700e-a789-f0f5b8320d4a",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“尤”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76c-7013-8010-859a06d854ec",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“尤”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76c-7013-8010-859a06d854ec-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-859a06d854ec-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-859a06d854ec-2",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-859a06d854ec-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d751-714b-b28e-d445d3fa1281",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“尤”的部件。",
          "options": [
            {
              "id": "019f140f-d751-714b-b28e-d445d3fa1281-0",
              "text": "寸",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d751-714b-b28e-d445d3fa1281-1",
              "text": "衣",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d751-714b-b28e-d445d3fa1281-2",
              "text": "吏",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d751-714b-b28e-d445d3fa1281-3",
              "text": "尤",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-fbb5f4ff5346",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "使劲",
      "wordPosition": 9,
      "hanzi": "劲",
      "primary": true,
      "ready": true,
      "pinyin": "jìn",
      "charType": "会意兼形声字",
      "decomposition": "左右结构",
      "originalMeaning": "(弓)强有力",
      "description": "会意兼形声字，左右结构，本义是(弓)强有力。它的繁体写作“勁”，由“巠”和“力”组成：左边的“巠”本义是织布机上绷直的经线，在这里提示读音、也提示意义，线被拉得又直又紧；右边的“力”本义是耕地的农具耒，后引申指力气，“力”的引申义与“勁”的本义直接相关。简体把“巠”写成了形近的记号“𢀖”，意思不变。我们可以结合部件含义联想记忆：“𢀖”是一台大的织布机，人要把织布机抬起来，就需要花力气。课文中“使劲”里的“劲”就是这股力气。",
      "originalText": "这下，我可乐了，帮大人抱着桂花树，使劲地摇。",
      "parts": [
        {
          "char": "巠",
          "radical": true
        },
        {
          "char": "力",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "巠",
          "description": "“巠”像织布机上绷直的丝线，三竖是经线、上下两横是穿线的框架，本义是织机上的直丝。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "力",
          "description": "力是象形字，最早画的是耕地用的农具耒的样子，因为用农具干活要使劲，后来就引申出力气、力量的意思。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d75d-747b-b8df-16cf2a3492e0",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“劲”的本义是？",
          "options": [
            {
              "id": "019f140f-d75d-747b-b8df-16cf2a3492e0-0",
              "text": "兰草",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-16cf2a3492e0-1",
              "text": "(弓)强有力",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-16cf2a3492e0-2",
              "text": "衣服套在胳膊上的部分，即衣袖",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75d-747b-b8df-182a2d0b322a",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“劲”是什么结构?",
          "options": [
            {
              "id": "019f140f-d75d-747b-b8df-182a2d0b322a-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-182a2d0b322a-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-182a2d0b322a-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-182a2d0b322a-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“劲”字的结构吧。"
        },
        {
          "id": "019f140f-d75d-747b-b8df-1e7f03f5d5a1",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“劲”字呢？",
          "options": [
            {
              "id": "019f140f-d75d-747b-b8df-1e7f03f5d5a1-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-1e7f03f5d5a1-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-1e7f03f5d5a1-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“劲”的本义是(弓)强有力哟。"
        },
        {
          "id": "019f140f-d75d-747b-b8df-202ee6ad5a2d",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“劲”的部件。",
          "options": [
            {
              "id": "019f140f-d75d-747b-b8df-202ee6ad5a2d-0",
              "text": "力",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-202ee6ad5a2d-1",
              "text": "肀",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d75d-747b-b8df-202ee6ad5a2d-2",
              "text": "古",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75d-747b-b8df-202ee6ad5a2d-3",
              "text": "巠",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75d-747b-b8df-26f4e7ba14de",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“劲”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d770-730c-964c-bce78044a567",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“劲”的部件。",
          "options": [
            {
              "id": "019f140f-d770-730c-964c-bce78044a567-0",
              "text": "戒",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d770-730c-964c-bce78044a567-1",
              "text": "力",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d770-730c-964c-bce78044a567-2",
              "text": "虫",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d770-730c-964c-bce78044a567-3",
              "text": "巠",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d4-755e-a039-caaee4e95f19",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“劲”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76c-7013-8010-775c1f737818",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“劲”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76c-7013-8010-775c1f737818-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-775c1f737818-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-775c1f737818-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-775c1f737818-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d74f-748b-a4b3-34620256d1a9",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“劲”的部件。",
          "options": [
            {
              "id": "019f140f-d74f-748b-a4b3-34620256d1a9-0",
              "text": "辛",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d74f-748b-a4b3-34620256d1a9-1",
              "text": "贝",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d74f-748b-a4b3-34620256d1a9-2",
              "text": "巠",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d74f-748b-a4b3-34620256d1a9-3",
              "text": "力",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af56-f733d22bc224",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "使劲",
      "wordPosition": 9,
      "hanzi": "使",
      "primary": true,
      "ready": true,
      "pinyin": "shǐ",
      "charType": "会意兼形声字",
      "decomposition": "左右结构",
      "originalMeaning": "差遣，指派",
      "description": "会意兼形声字，左右结构，本义是差遣，指派。左边的“亻”是人，表示这个字跟人有关；右边的“吏”在这里提示读音、也表意：古文字像一只手握着武器打猎，本义是去做事情，后来引申指管事的官员。“使”在课文中的含义是“动用，使出”，我们可以结合“使”的部件含义联想记忆：“吏”像手举着猎叉，人要把手里的猎叉举起来，需要使出力气，所以“使”就有“动用，使出”的意思。",
      "originalText": "这下，我可乐了，帮大人抱着桂花树，使劲地摇。",
      "parts": [
        {
          "char": "亻",
          "radical": true
        },
        {
          "char": "吏",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "亻",
          "description": "亻，“人”的偏旁变体。“人”是象形字，独体字，甲骨文像一个侧身站立的人，本义指人。凡是带“人”（亻）的字往往跟人有关，如众、信。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "吏",
          "description": "“吏”是会意字，古文字像一只手握着猎叉打猎，本义是从事打猎，后来引申指管事的官员。",
          "charType": "会意字",
          "children": [
            "丈",
            "口"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d75a-743e-884a-ea802e0b3078",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“使”的本义是？",
          "options": [
            {
              "id": "019f140f-d75a-743e-884a-ea802e0b3078-0",
              "text": "古代计时的漏壶",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-ea802e0b3078-1",
              "text": "差遣，指派",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-ea802e0b3078-2",
              "text": "烤熟或者蒸熟的面食",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75a-743e-884a-efd622ea8c3c",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“使”是什么结构?",
          "options": [
            {
              "id": "019f140f-d75a-743e-884a-efd622ea8c3c-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-efd622ea8c3c-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-efd622ea8c3c-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-efd622ea8c3c-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“使”字的结构吧。"
        },
        {
          "id": "019f140f-d75a-743e-884a-f06f294929d9",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“使”字呢？",
          "options": [
            {
              "id": "019f140f-d75a-743e-884a-f06f294929d9-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-f06f294929d9-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-f06f294929d9-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“使”的本义是差遣，指派哟。"
        },
        {
          "id": "019f140f-d75a-743e-884a-f62e4efaa897",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“使”的部件。",
          "options": [
            {
              "id": "019f140f-d75a-743e-884a-f62e4efaa897-0",
              "text": "亻",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d75a-743e-884a-f62e4efaa897-1",
              "text": "吏",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75a-743e-884a-f62e4efaa897-2",
              "text": "可",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d75a-743e-884a-f62e4efaa897-3",
              "text": "卩又",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75a-743e-884a-f8815b9eef2c",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“使”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76f-75fe-8b38-e75c26442c94",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“使”的部件。",
          "options": [
            {
              "id": "019f140f-d76f-75fe-8b38-e75c26442c94-0",
              "text": "言",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76f-75fe-8b38-e75c26442c94-1",
              "text": "巛",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d76f-75fe-8b38-e75c26442c94-2",
              "text": "亻",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d76f-75fe-8b38-e75c26442c94-3",
              "text": "吏",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07d1-761c-91d6-40f7a6acc48f",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“使”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76b-71c4-b8ea-4cf208466d79",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“使”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76b-71c4-b8ea-4cf208466d79-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-4cf208466d79-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-4cf208466d79-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76b-71c4-b8ea-4cf208466d79-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d74c-76bf-807a-aabee53784e8",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“使”的部件。",
          "options": [
            {
              "id": "019f140f-d74c-76bf-807a-aabee53784e8-0",
              "text": "氵",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d74c-76bf-807a-aabee53784e8-1",
              "text": "门",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d74c-76bf-807a-aabee53784e8-2",
              "text": "吏",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d74c-76bf-807a-aabee53784e8-3",
              "text": "亻",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af57-0073c73d6737",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "茶叶",
      "wordPosition": 10,
      "hanzi": "茶",
      "primary": true,
      "ready": true,
      "pinyin": "chá",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "茶树",
      "description": "茶是形声字，上下结构，本义是茶树。上面的“艹”本义是草，表示茶树是一种植物；下面的“余”本义是房屋，在这里提示读音。不过我们可以这样联想：茶树的叶子是古代一种常见的饮品材料，也可以卖钱（是一种经济作物），所以古人会在房屋（“余”）后栽种茶树，所以“艹”下配上表示房屋的“余”，帮我们记住这种在古代生活中非常重要的植物。",
      "originalText": "桂花摇落以后，挑去小枝小叶，晒上几天太阳，收在铁盒子里，可以加在茶叶里泡茶，过年时还可以做糕饼。",
      "parts": [
        {
          "char": "艹",
          "radical": true
        },
        {
          "char": "余",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "艹",
          "description": "艹是艸的偏旁变体。“艸”是象形字，独体字，本义是草。作偏旁写在字的上面就写成“艹”（草字头），带“艹”的字大多和草、植物有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "余",
          "description": "“余”是一个象形字，它的甲骨文就像用几根木头搭起来的小茅屋，所以本义是“茅屋”。现在“余”常用来表示“我”或“剩下的”意思。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f140f-d768-71ac-a4d1-d6e64b41973b",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“茶”的本义是？",
          "options": [
            {
              "id": "019f140f-d768-71ac-a4d1-d6e64b41973b-0",
              "text": "水势盛大",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-d6e64b41973b-1",
              "text": "用手轻触",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-d6e64b41973b-2",
              "text": "茶树",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d768-71ac-a4d1-dbd94f508ab4",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“茶”是什么结构?",
          "options": [
            {
              "id": "019f140f-d768-71ac-a4d1-dbd94f508ab4-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-dbd94f508ab4-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-dbd94f508ab4-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-dbd94f508ab4-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“茶”字的结构吧。"
        },
        {
          "id": "019f140f-d768-71ac-a4d1-dd5087e9cd67",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“茶”字呢？",
          "options": [
            {
              "id": "019f140f-d768-71ac-a4d1-dd5087e9cd67-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-dd5087e9cd67-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-dd5087e9cd67-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“茶”的本义是茶树哟。"
        },
        {
          "id": "019f140f-d768-71ac-a4d1-e19ba84c0127",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“茶”的部件。",
          "options": [
            {
              "id": "019f140f-d768-71ac-a4d1-e19ba84c0127-0",
              "text": "余",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-e19ba84c0127-1",
              "text": "昜",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d768-71ac-a4d1-e19ba84c0127-2",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d768-71ac-a4d1-e19ba84c0127-3",
              "text": "北",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d768-71ac-a4d1-e4160f5f5242",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“茶”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d774-749d-a748-1272be0596e0",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“茶”的部件。",
          "options": [
            {
              "id": "019f140f-d774-749d-a748-1272be0596e0-0",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-1272be0596e0-1",
              "text": "办",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d774-749d-a748-1272be0596e0-2",
              "text": "余",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d774-749d-a748-1272be0596e0-3",
              "text": "壬",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1809-07de-7035-a0a0-45d17cb55633",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“茶”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76e-70ba-96a6-ceb0bed8063c",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“茶”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76e-70ba-96a6-ceb0bed8063c-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-ceb0bed8063c-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-ceb0bed8063c-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76e-70ba-96a6-ceb0bed8063c-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d757-7663-bd21-4a13a3b5a92e",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“茶”的部件。",
          "options": [
            {
              "id": "019f140f-d757-7663-bd21-4a13a3b5a92e-0",
              "text": "余",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d757-7663-bd21-4a13a3b5a92e-1",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d757-7663-bd21-4a13a3b5a92e-2",
              "text": "马",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f140f-d757-7663-bd21-4a13a3b5a92e-3",
              "text": "十",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea21-740f-af57-040b5e6e761b",
      "lessonId": "019f0523-819f-7702-89a2-75f13809d57a",
      "lessonTitle": "桂花雨",
      "lessonPosition": 1,
      "word": "茶叶",
      "wordPosition": 10,
      "hanzi": "叶",
      "primary": true,
      "ready": true,
      "pinyin": "yè",
      "charType": "象形字",
      "decomposition": "左右结构",
      "originalMeaning": "树上很多叶子的形状，一种植物",
      "description": "“叶”的繁体字是“葉”，象形字，上下结构，描摹了树上很多叶子的形状，后增加“艹”，强调“叶子”是一种植物。简体字“叶”看起来是“左右结构”，左边是“口”，右边是“十”，但是和我们过去学习的“口”和“十”表示的含义不同，为了方便记忆，我们可以把“口”想象成“叶子”，“十”想象成树叶繁茂的树。在这里叶子就是茶树的叶子。",
      "originalText": "桂花摇落以后，挑去小枝小叶，晒上几天太阳，收在铁盒子里，可以加在茶叶里泡茶，过年时还可以做糕饼。",
      "parts": [
        {
          "char": "口",
          "radical": true
        },
        {
          "char": "十",
          "radical": false
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f140f-d75f-7543-9e68-8ef749c498d4",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“叶”的本义是？",
          "options": [
            {
              "id": "019f140f-d75f-7543-9e68-8ef749c498d4-0",
              "text": "树上很多叶子的形状，一种植物",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-8ef749c498d4-1",
              "text": "古人居住的半地下土窖。地室",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-8ef749c498d4-2",
              "text": "背着、背负",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d75f-7543-9e68-91e81de02641",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“叶”是什么结构?",
          "options": [
            {
              "id": "019f140f-d75f-7543-9e68-91e81de02641-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-91e81de02641-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-91e81de02641-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-91e81de02641-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“叶”字的结构吧。"
        },
        {
          "id": "019f140f-d75f-7543-9e68-94c5986972a0",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“叶”字呢？",
          "options": [
            {
              "id": "019f140f-d75f-7543-9e68-94c5986972a0-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-94c5986972a0-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d75f-7543-9e68-94c5986972a0-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“叶”的本义是树上很多叶子的形状，一种植物哟。"
        },
        {
          "id": "019f140f-d75f-7543-9e68-996d855ed960",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“叶”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1809-07d5-7028-8d2c-d3ecad7159c4",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“叶”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f140f-d76c-7013-8010-7f71cba2aa5e",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“叶”是什么结构?",
          "options": [
            {
              "id": "019f140f-d76c-7013-8010-7f71cba2aa5e-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-7f71cba2aa5e-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-7f71cba2aa5e-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d76c-7013-8010-7f71cba2aa5e-3",
              "text": "上下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f140f-d750-752c-8071-d9c54e0146cd",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“叶”的部件。",
          "options": [
            {
              "id": "019f140f-d750-752c-8071-d9c54e0146cd-0",
              "text": "口",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f140f-d750-752c-8071-d9c54e0146cd-1",
              "text": "并",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f140f-d750-752c-8071-d9c54e0146cd-2",
              "text": "十",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f140f-d750-752c-8071-d9c54e0146cd-3",
              "text": "厶",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-d3fa2de611be",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "浇水",
      "wordPosition": 1,
      "hanzi": "浇",
      "primary": true,
      "ready": true,
      "pinyin": "jiāo",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "用水灌溉",
      "description": "“浇”，形声字，左右结构，本义是用水灌溉。“浇”的繁体字是“澆”，左边的“氵”表示字义和水有关；右边的“尧”（繁体作“堯”）读 yáo，在这里提示读音——“尧”上边的“垚”由三个“土”叠在一起，好多泥土一层层堆起来就成了高高的大山，下边的“兀”表示高而平，合起来“尧”表示高上加高。把“氵”和“尧”的意思结合起来，水从高处往低处流，浇灌花草和田地，就是“浇”。",
      "originalText": "我们姐弟几个都很高兴，买种、翻地、播种、浇水，没过几个月，居然收获了。",
      "parts": [
        {
          "char": "氵",
          "radical": true
        },
        {
          "char": "尧",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "氵",
          "description": "“氵”是“水”的偏旁形，象形字，独体字，本义是河流。甲骨文的字形像水流蜿蜒流动的形状，两侧的点像水滴。凡是带“氵”（水）的字，往往跟水流等义有关，如江、河。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "尧",
          "description": "“尧”是会意字，上面是三个“土”叠成的“垚”，表示土堆得很高；下面的“兀”表示高处。土堆在高处之上，又高又远，所以“尧”的本义是“土高貌”，指土堆得高高的样子。如今“尧”常用作上古帝王“唐尧”的名字。",
          "charType": "会意字",
          "children": [
            "垚",
            "兀"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f3890-3a2a-73f2-8aef-292de7b737f1",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“浇”的本义是？",
          "options": [
            {
              "id": "019f3890-3a2a-73f2-8aef-292de7b737f1-0",
              "text": "山脊",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-292de7b737f1-1",
              "text": "系物的大绳",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-292de7b737f1-2",
              "text": "用水灌溉",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a2a-73f2-8aef-2d98c01fd18e",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“浇”是什么结构?",
          "options": [
            {
              "id": "019f3890-3a2a-73f2-8aef-2d98c01fd18e-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-2d98c01fd18e-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-2d98c01fd18e-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-2d98c01fd18e-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“浇”字的结构吧。"
        },
        {
          "id": "019f3890-3a2a-73f2-8aef-334dfcace2a3",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“浇”字呢？",
          "options": [
            {
              "id": "019f3890-3a2a-73f2-8aef-334dfcace2a3-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-334dfcace2a3-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-334dfcace2a3-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“浇”的本义是用水灌溉哟。"
        },
        {
          "id": "019f3890-3a2a-73f2-8aef-3733a432a9c1",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“浇”的部件。",
          "options": [
            {
              "id": "019f3890-3a2a-73f2-8aef-3733a432a9c1-0",
              "text": "七",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-3733a432a9c1-1",
              "text": "氵",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-3733a432a9c1-2",
              "text": "丁",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2a-73f2-8aef-3733a432a9c1-3",
              "text": "尧",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a2a-73f2-8aef-3b576d21f0c4",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“浇”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f3890-3a32-729b-9c74-d41b9ebd95bb",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“浇”的部件。",
          "options": [
            {
              "id": "019f3890-3a32-729b-9c74-d41b9ebd95bb-0",
              "text": "厷",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f3890-3a32-729b-9c74-d41b9ebd95bb-1",
              "text": "羊",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a32-729b-9c74-d41b9ebd95bb-2",
              "text": "尧",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a32-729b-9c74-d41b9ebd95bb-3",
              "text": "氵",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a32-729b-9c74-da1cae776ce8",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“浇”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00df-7407-8dda-5125b7100eb8",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“浇”是什么结构?",
          "options": [
            {
              "id": "019f1453-00df-7407-8dda-5125b7100eb8-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-5125b7100eb8-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-5125b7100eb8-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-5125b7100eb8-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa6-77bd-88ba-c6a3d7c73591",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“浇”的部件。",
          "options": [
            {
              "id": "019f1455-aaa6-77bd-88ba-c6a3d7c73591-0",
              "text": "尧",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-c6a3d7c73591-1",
              "text": "氵",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-c6a3d7c73591-2",
              "text": "叔",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-c6a3d7c73591-3",
              "text": "衣",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-d4bb77fae57f",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "浇水",
      "wordPosition": 1,
      "hanzi": "水",
      "primary": true,
      "ready": true,
      "pinyin": "shuǐ",
      "charType": "象形字",
      "decomposition": "独体字",
      "originalMeaning": "河流",
      "description": "象形字，独体字，本义是河流。甲骨文字形中间一笔看作水流，两旁的小点是溅起的水珠，连起来就是一条蜿蜒曲折的水流动的形状。河流就是由无色透明、能流淌的液体来构成的，人们将这种液体称为“水”。这里指浇到地里、用来滋润种子的水。",
      "originalText": "我们姐弟几个都很高兴，买种、翻地、播种、浇水，没过几个月，居然收获了。",
      "parts": [
        {
          "char": "水",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f310c-3f0c-72e3-a1d9-e82d89af3611",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“水”的本义是？",
          "options": [
            {
              "id": "019f310c-3f0c-72e3-a1d9-e82d89af3611-0",
              "text": "按规定的标准考核、考验",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-e82d89af3611-1",
              "text": "劈开",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-e82d89af3611-2",
              "text": "河流",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0c-72e3-a1d9-edb105d126e7",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“水”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f0c-72e3-a1d9-edb105d126e7-0",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-edb105d126e7-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-edb105d126e7-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-edb105d126e7-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“水”字的结构吧。"
        },
        {
          "id": "019f310c-3f0c-72e3-a1d9-f268fe325bf9",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“水”字呢？",
          "options": [
            {
              "id": "019f310c-3f0c-72e3-a1d9-f268fe325bf9-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-f268fe325bf9-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0c-72e3-a1d9-f268fe325bf9-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“水”的本义是河流哟。"
        },
        {
          "id": "019f310c-3f0c-72e3-a1d9-f4645f8e4e53",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“水”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4079-71d9-a605-92a51bb1fb2b",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“水”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00df-7407-8dda-4c99b8bdb630",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“水”是什么结构?",
          "options": [
            {
              "id": "019f1453-00df-7407-8dda-4c99b8bdb630-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-4c99b8bdb630-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-4c99b8bdb630-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-4c99b8bdb630-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa6-77bd-88ba-c285880c9a9d",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“水”的部件。",
          "options": [
            {
              "id": "019f1455-aaa6-77bd-88ba-c285880c9a9d-0",
              "text": "龙",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-c285880c9a9d-1",
              "text": "方",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-c285880c9a9d-2",
              "text": "页",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-c285880c9a9d-3",
              "text": "水",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-e1631ffd2c46",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "食品",
      "wordPosition": 2,
      "hanzi": "品",
      "primary": true,
      "ready": true,
      "pinyin": "pǐn",
      "charType": "会意字",
      "decomposition": "上下结构",
      "originalMeaning": "众多",
      "description": "会意字，上下结构，本义是众多。三个“口”描绘了三个用来盛放祭品的容器的形状，说明祭品数量和种类多，“品”就有“众多”的意思。祭品放在祭器里时，不能随便乱放，而是要按照相同的种类放在同一个容器里，所以“品”就有“种类”的意思。“食品”就是可以用来吃的食物种类。",
      "originalText": "母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。",
      "parts": [
        {
          "char": "口",
          "radical": true
        },
        {
          "char": "口",
          "radical": false
        },
        {
          "char": "口",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "口",
          "description": "口是象形字，字形像张开的嘴巴，本义就是人的嘴。嘴用来吃东西和说话，所以现代也常用来表示说话、人口或像口一样的东西。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "口",
          "description": "口是象形字，字形像张开的嘴巴，本义就是人的嘴。嘴用来吃东西和说话，所以现代也常用来表示说话、人口或像口一样的东西。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "口",
          "description": "口是象形字，字形像张开的嘴巴，本义就是人的嘴。嘴用来吃东西和说话，所以现代也常用来表示说话、人口或像口一样的东西。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f09-7721-9c61-2841e9f753f2",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“品”的本义是？",
          "options": [
            {
              "id": "019f310c-3f09-7721-9c61-2841e9f753f2-0",
              "text": "众多",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-2841e9f753f2-1",
              "text": "劳作时加油鼓劲儿的歌声",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-2841e9f753f2-2",
              "text": "头部",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f09-7721-9c61-2ef6b4600526",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“品”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f09-7721-9c61-2ef6b4600526-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-2ef6b4600526-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-2ef6b4600526-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-2ef6b4600526-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“品”字的结构吧。"
        },
        {
          "id": "019f310c-3f09-7721-9c61-328f96730704",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“品”字呢？",
          "options": [
            {
              "id": "019f310c-3f09-7721-9c61-328f96730704-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-328f96730704-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f09-7721-9c61-328f96730704-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“品”的本义是众多哟。"
        },
        {
          "id": "019f310c-3f09-7721-9c61-3afe3b893f90",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“品”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4077-70cf-b458-a66b8b4df3f9",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“品”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00df-7407-8dda-46447f18e0aa",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“品”是什么结构?",
          "options": [
            {
              "id": "019f1453-00df-7407-8dda-46447f18e0aa-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-46447f18e0aa-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-46447f18e0aa-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-46447f18e0aa-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa5-76df-a98c-3ddb35420641",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“品”的部件。",
          "options": [
            {
              "id": "019f1455-aaa5-76df-a98c-3ddb35420641-0",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-3ddb35420641-1",
              "text": "口",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa5-76df-a98c-3ddb35420641-2",
              "text": "凡",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-3ddb35420641-3",
              "text": "口",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-dd82ee494384",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "食品",
      "wordPosition": 2,
      "hanzi": "食",
      "primary": true,
      "ready": true,
      "pinyin": "shí",
      "charType": "会意字，形声字",
      "decomposition": "上下结构",
      "originalMeaning": "张口吃饭",
      "description": "会意字，上下结构，本义是张口吃饭。甲骨文字形像一个人张开口靠近食器上方进食的状态。上面的“亼”，表示人低头张开嘴；下面的“皀”，是盛满饭的食器。“食”一开始只指人吃“米饭”，但人不仅可以吃“米饭”，还可以吃水果、蔬菜，所以食就引申出各种食物的意思。",
      "originalText": "母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。",
      "parts": [
        {
          "char": "亼",
          "radical": true
        },
        {
          "char": "皀",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "亼",
          "description": "“亼”是一个象形字，它的样子就像扣在器物上的盖子。这个字的本义就是“扣合的器盖”。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "皀",
          "description": "“皀”是一个象形字，它的字形就像一碗热腾腾的米饭，下面像盛饭的食器，上面是米粒，旁边的小点表示飘出的香气。它的本义就是散发着香味的米饭。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f11-715e-90fe-5b60a72480f0",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“食”的本义是？",
          "options": [
            {
              "id": "019f310c-3f11-715e-90fe-5b60a72480f0-0",
              "text": "张口吃饭",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-5b60a72480f0-1",
              "text": "按着、凭借",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-5b60a72480f0-2",
              "text": "山体倒塌",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f11-715e-90fe-5fdd8b01db91",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“食”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f11-715e-90fe-5fdd8b01db91-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-5fdd8b01db91-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-5fdd8b01db91-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-5fdd8b01db91-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“食”字的结构吧。"
        },
        {
          "id": "019f310c-3f11-715e-90fe-62af3366c2ec",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“食”字呢？",
          "options": [
            {
              "id": "019f310c-3f11-715e-90fe-62af3366c2ec-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-62af3366c2ec-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-62af3366c2ec-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“食”的本义是张口吃饭哟。"
        },
        {
          "id": "019f310c-3f11-715e-90fe-67e8f42d45fd",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“食”的部件。",
          "options": [
            {
              "id": "019f310c-3f11-715e-90fe-67e8f42d45fd-0",
              "text": "父",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f310c-3f11-715e-90fe-67e8f42d45fd-1",
              "text": "亼",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-3f11-715e-90fe-67e8f42d45fd-2",
              "text": "畺",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f11-715e-90fe-67e8f42d45fd-3",
              "text": "皀",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f11-715e-90fe-685fa26de6d6",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“食”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-407b-711c-86be-351a9351a58f",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“食”的部件。",
          "options": [
            {
              "id": "019f310c-407b-711c-86be-351a9351a58f-0",
              "text": "厃",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f310c-407b-711c-86be-351a9351a58f-1",
              "text": "北",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f310c-407b-711c-86be-351a9351a58f-2",
              "text": "皀",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-407b-711c-86be-351a9351a58f-3",
              "text": "亼",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-407b-711c-86be-38efa1a5ab68",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“食”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e0-75c9-a876-b6a5c3c13fe8",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“食”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e0-75c9-a876-b6a5c3c13fe8-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-b6a5c3c13fe8-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-b6a5c3c13fe8-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-b6a5c3c13fe8-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa7-7549-b1a4-2569d5d9beed",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“食”的部件。",
          "options": [
            {
              "id": "019f1455-aaa7-7549-b1a4-2569d5d9beed-0",
              "text": "石",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-2569d5d9beed-1",
              "text": "皀",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-2569d5d9beed-2",
              "text": "王",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-2569d5d9beed-3",
              "text": "亼",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-ebda64f057b8",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "吩咐",
      "wordPosition": 3,
      "hanzi": "吩",
      "primary": true,
      "ready": true,
      "pinyin": "fēn",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "（在“吩咐”中）用嘴巴发出命令",
      "description": "“吩”，形声字，左右结构，本义是（在“吩咐”中）用嘴巴发出命令。“吩”字本身没有独立含义，只和“咐”组合成“吩咐”这个词。左边的“口”本义是嘴巴，表示“吩”跟人的嘴部动作相关；右边的“分”本义是分开、分割，在这里提示读音。我们可以这样联想记忆：妈妈用刀切开西瓜，“分”好了瓜，再用“口”吩咐孩子，把瓜端给爷爷奶奶吃。",
      "originalText": "母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。",
      "parts": [
        {
          "char": "口",
          "radical": true
        },
        {
          "char": "分",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "口",
          "description": "口是象形字，字形像张开的嘴巴，本义就是人的嘴。嘴用来吃东西和说话，所以现代也常用来表示说话、人口或像口一样的东西。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "分",
          "description": "“分”是会意字，上面是“八”，下面是“刀”。“八”是两笔向两边分开的样子，“刀”是刀具，合起来就是用刀把东西切开，本义是分开、分割，现在还常表示分开、分配。",
          "charType": "会意字",
          "children": [
            "八",
            "刀"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f3890-3a23-750a-b089-1fc884f0c0c1",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“吩”的本义是？",
          "options": [
            {
              "id": "019f3890-3a23-750a-b089-1fc884f0c0c1-0",
              "text": "干活、做事",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a23-750a-b089-1fc884f0c0c1-1",
              "text": "（在“吩咐”中）用嘴巴发出命令",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a23-750a-b089-1fc884f0c0c1-2",
              "text": "母亲",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a24-742c-8210-c075534f6837",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“吩”是什么结构?",
          "options": [
            {
              "id": "019f3890-3a24-742c-8210-c075534f6837-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-c075534f6837-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-c075534f6837-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-c075534f6837-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“吩”字的结构吧。"
        },
        {
          "id": "019f3890-3a24-742c-8210-c719a9d55d5a",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“吩”字呢？",
          "options": [
            {
              "id": "019f3890-3a24-742c-8210-c719a9d55d5a-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-c719a9d55d5a-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-c719a9d55d5a-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“吩”的本义是（在“吩咐”中）用嘴巴发出命令哟。"
        },
        {
          "id": "019f3890-3a24-742c-8210-cbc6f49ceac7",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“吩”的部件。",
          "options": [
            {
              "id": "019f3890-3a24-742c-8210-cbc6f49ceac7-0",
              "text": "乍",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-cbc6f49ceac7-1",
              "text": "分",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a24-742c-8210-cbc6f49ceac7-2",
              "text": "入",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f3890-3a24-742c-8210-cbc6f49ceac7-3",
              "text": "口",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a24-742c-8210-ccbaead4ad2b",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“吩”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f3890-3a30-76f6-9c37-d0040163d76a",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“吩”的部件。",
          "options": [
            {
              "id": "019f3890-3a30-76f6-9c37-d0040163d76a-0",
              "text": "口",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f3890-3a30-76f6-9c37-d0040163d76a-1",
              "text": "分",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a30-76f6-9c37-d0040163d76a-2",
              "text": "手",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a30-76f6-9c37-d0040163d76a-3",
              "text": "先",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a31-714d-a5e8-2fe6256b338d",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“吩”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00de-702f-8567-81364f0a553a",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“吩”是什么结构?",
          "options": [
            {
              "id": "019f1453-00de-702f-8567-81364f0a553a-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-81364f0a553a-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-81364f0a553a-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-81364f0a553a-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa5-76df-a98c-374d0d39d2ce",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“吩”的部件。",
          "options": [
            {
              "id": "019f1455-aaa5-76df-a98c-374d0d39d2ce-0",
              "text": "口",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa5-76df-a98c-374d0d39d2ce-1",
              "text": "主",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-374d0d39d2ce-2",
              "text": "业",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-374d0d39d2ce-3",
              "text": "分",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-ef1ad97fda3a",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "吩咐",
      "wordPosition": 3,
      "hanzi": "咐",
      "primary": true,
      "ready": true,
      "pinyin": "fù",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "嘘气",
      "description": "“咐”，形声字，左右结构，本义是嘘气，就是从嘴里慢慢地吐气。左边的“口”本义是人的嘴巴，表示“咐”的含义跟人的嘴部动作相关；右边的“付”由“人”和“寸”组成，“寸”就是“手”，“人”和“寸”合起来表示用手拿东西交给别人，“付”在这里提示读音。在“吩咐”里，“咐”不再指嘘气，而是用“口”把命令交付给另一个人。",
      "originalText": "母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。",
      "parts": [
        {
          "char": "口",
          "radical": true
        },
        {
          "char": "付",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "口",
          "description": "口是象形字，字形像张开的嘴巴，本义就是人的嘴。嘴用来吃东西和说话，所以现代也常用来表示说话、人口或像口一样的东西。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "付",
          "description": "“付”是会意字，金文左边是“人”，右边是“寸”，“寸”表示手。合起来就像一个人用手把东西递给别人，本义是交给。今天的“付钱”“付出”，用的还是这个意思。",
          "charType": "会意字",
          "children": [
            "亻",
            "寸"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f3890-3a27-72e9-a963-3de7bdc4e23e",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“咐”的本义是？",
          "options": [
            {
              "id": "019f3890-3a27-72e9-a963-3de7bdc4e23e-0",
              "text": "获得",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-3de7bdc4e23e-1",
              "text": "用来让出行的人临时休息的地方",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-3de7bdc4e23e-2",
              "text": "嘘气",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a27-72e9-a963-4327346131f0",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“咐”是什么结构?",
          "options": [
            {
              "id": "019f3890-3a27-72e9-a963-4327346131f0-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-4327346131f0-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-4327346131f0-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-4327346131f0-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“咐”字的结构吧。"
        },
        {
          "id": "019f3890-3a27-72e9-a963-44922c338324",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“咐”字呢？",
          "options": [
            {
              "id": "019f3890-3a27-72e9-a963-44922c338324-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-44922c338324-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-44922c338324-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“咐”的本义是嘘气哟。"
        },
        {
          "id": "019f3890-3a27-72e9-a963-4aa9a22627a1",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“咐”的部件。",
          "options": [
            {
              "id": "019f3890-3a27-72e9-a963-4aa9a22627a1-0",
              "text": "子",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-4aa9a22627a1-1",
              "text": "付",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a27-72e9-a963-4aa9a22627a1-2",
              "text": "口",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f3890-3a27-72e9-a963-4aa9a22627a1-3",
              "text": "每",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a27-72e9-a963-4f3df725a724",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“咐”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f3890-3a31-714d-a5e8-3342726a7554",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“咐”的部件。",
          "options": [
            {
              "id": "019f3890-3a31-714d-a5e8-3342726a7554-0",
              "text": "办",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a31-714d-a5e8-3342726a7554-1",
              "text": "付",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a31-714d-a5e8-3342726a7554-2",
              "text": "兄",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a31-714d-a5e8-3342726a7554-3",
              "text": "口",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a31-714d-a5e8-349e0450c7c0",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“咐”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00df-7407-8dda-43ab7920c0f6",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“咐”是什么结构?",
          "options": [
            {
              "id": "019f1453-00df-7407-8dda-43ab7920c0f6-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-43ab7920c0f6-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-43ab7920c0f6-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-43ab7920c0f6-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa5-76df-a98c-382d95ea4746",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“咐”的部件。",
          "options": [
            {
              "id": "019f1455-aaa5-76df-a98c-382d95ea4746-0",
              "text": "口",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa5-76df-a98c-382d95ea4746-1",
              "text": "非",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-382d95ea4746-2",
              "text": "付",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-382d95ea4746-3",
              "text": "矢",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-f64404abe271",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "茅亭",
      "wordPosition": 4,
      "hanzi": "茅",
      "primary": true,
      "ready": true,
      "pinyin": "máo",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "茅草",
      "description": "形声字，上下结构，本义是茅草。上面的“艹”是“艸”（草）的偏旁变体，本义为草，说明“茅”的含义与植物有关；下面的“矛”本义是长矛，在这里提示读音。结合两个部件我们可以这样联想：一种长得又高又茂盛的草，就连长长的矛都能被它遮住，这就是“茅草”。课文中的“茅亭”是用茅草覆盖屋顶的亭子。",
      "originalText": "母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。",
      "parts": [
        {
          "char": "艹",
          "radical": true
        },
        {
          "char": "矛",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "艹",
          "description": "艹是艸的偏旁变体。“艸”是象形字，独体字，本义是草。作偏旁写在字的上面就写成“艹”（草字头），带“艹”的字大多和草、植物有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "矛",
          "description": "“矛”是象形字，独体字。古人照着长矛的样子画出了它，上面是尖尖的矛头，中间是长长的矛杆，下面是安木柄的地方。它的本义就是古代用来直刺敌人的长柄兵器，也就是长矛。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f0d-7549-8585-79afd7716756",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“茅”的本义是？",
          "options": [
            {
              "id": "019f310c-3f0d-7549-8585-79afd7716756-0",
              "text": "原始狩猎工具",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-79afd7716756-1",
              "text": "茅草",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-79afd7716756-2",
              "text": "事物初生柔弱的样子",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0d-7549-8585-7f500fa495de",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“茅”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f0d-7549-8585-7f500fa495de-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-7f500fa495de-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-7f500fa495de-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-7f500fa495de-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“茅”字的结构吧。"
        },
        {
          "id": "019f310c-3f0d-7549-8585-83edccaebd16",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“茅”字呢？",
          "options": [
            {
              "id": "019f310c-3f0d-7549-8585-83edccaebd16-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-83edccaebd16-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-83edccaebd16-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“茅”的本义是茅草哟。"
        },
        {
          "id": "019f310c-3f0d-7549-8585-874a3f3f3af1",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“茅”的部件。",
          "options": [
            {
              "id": "019f310c-3f0d-7549-8585-874a3f3f3af1-0",
              "text": "夬",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-874a3f3f3af1-1",
              "text": "矛",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-874a3f3f3af1-2",
              "text": "光",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0d-7549-8585-874a3f3f3af1-3",
              "text": "艹",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0d-7549-8585-8a60b2989acf",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“茅”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4079-71d9-a605-96b83d6f17d0",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“茅”的部件。",
          "options": [
            {
              "id": "019f310c-4079-71d9-a605-96b83d6f17d0-0",
              "text": "矛",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-4079-71d9-a605-96b83d6f17d0-1",
              "text": "韦",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-4079-71d9-a605-96b83d6f17d0-2",
              "text": "艹",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-4079-71d9-a605-96b83d6f17d0-3",
              "text": "车",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-4079-71d9-a605-9b36a84aa495",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“茅”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e0-75c9-a876-a9862b422b24",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“茅”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e0-75c9-a876-a9862b422b24-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-a9862b422b24-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-a9862b422b24-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-a9862b422b24-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa6-77bd-88ba-cdd6f3756042",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“茅”的部件。",
          "options": [
            {
              "id": "019f1455-aaa6-77bd-88ba-cdd6f3756042-0",
              "text": "小",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-cdd6f3756042-1",
              "text": "勺",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-cdd6f3756042-2",
              "text": "矛",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-cdd6f3756042-3",
              "text": "艹",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966b-fb7629001a7c",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "茅亭",
      "wordPosition": 4,
      "hanzi": "亭",
      "primary": true,
      "ready": true,
      "pinyin": "tíng",
      "charType": "形声字，会意字",
      "decomposition": "上下结构",
      "originalMeaning": "用来让出行的人临时休息的地方",
      "description": "形声字，会意字，上下结构，是用来让出行的人临时休息的地方。上面是“高”的省写，描摹了高大的有顶的亭子形状，“高”就有“高大”的意思。下面的“丁”是象形字，字形像一颗钉子，又细又长地竖着。它的本义就是钉子。亭子用“丁”，在这里提示读音、也表意，让人想到亭子中间的柱子非常修长，远看像钉子。古时候出行不方便，为了让赶路的人安心停下休息，就修了这种建筑。后来人们就把山林、路边、园子里供人临时休息的建筑叫作亭。在这里指后园中用茅草盖顶的休息的地方。",
      "originalText": "母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。",
      "parts": [
        {
          "char": "高",
          "radical": true
        },
        {
          "char": "丁",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "高",
          "description": "“高”是象形字，字形画的就是一座高耸的楼台，上面尖、下面是台基，远远就能望见。它的本义是上下距离大，跟“矮”相反。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "丁",
          "description": "“丁”是象形字，字形像一颗钉子，又细又长地竖着。它的本义就是钉子。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f01-74d6-beb4-7144b87ff51d",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“亭”的本义是？",
          "options": [
            {
              "id": "019f310c-3f01-74d6-beb4-7144b87ff51d-0",
              "text": "用来让出行的人临时休息的地方",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f01-74d6-beb4-7144b87ff51d-1",
              "text": "张口吃饭",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f01-74d6-beb4-7144b87ff51d-2",
              "text": "从事耕种的劳作",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f02-77c6-a420-1fad1ad349d1",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“亭”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f02-77c6-a420-1fad1ad349d1-0",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-1fad1ad349d1-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-1fad1ad349d1-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-1fad1ad349d1-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“亭”字的结构吧。"
        },
        {
          "id": "019f310c-3f02-77c6-a420-20f6925f5f4d",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“亭”字呢？",
          "options": [
            {
              "id": "019f310c-3f02-77c6-a420-20f6925f5f4d-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-20f6925f5f4d-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-20f6925f5f4d-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“亭”的本义是用来让出行的人临时休息的地方哟。"
        },
        {
          "id": "019f310c-3f02-77c6-a420-24fef35946e7",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“亭”的部件。",
          "options": [
            {
              "id": "019f310c-3f02-77c6-a420-24fef35946e7-0",
              "text": "丁",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-24fef35946e7-1",
              "text": "高",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-3f02-77c6-a420-24fef35946e7-2",
              "text": "舀",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f02-77c6-a420-24fef35946e7-3",
              "text": "而",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f02-77c6-a420-2bba73090d3a",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“亭”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4073-7777-8b77-b3da3079f979",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“亭”的部件。",
          "options": [
            {
              "id": "019f310c-4073-7777-8b77-b3da3079f979-0",
              "text": "昔",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-4073-7777-8b77-b3da3079f979-1",
              "text": "丁",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-4073-7777-8b77-b3da3079f979-2",
              "text": "高",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-4073-7777-8b77-b3da3079f979-3",
              "text": "斥",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-4073-7777-8b77-b599520fd042",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“亭”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00de-702f-8567-76ca56042597",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“亭”是什么结构?",
          "options": [
            {
              "id": "019f1453-00de-702f-8567-76ca56042597-0",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-76ca56042597-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-76ca56042597-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-76ca56042597-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa4-706e-8bfe-5dd914912a2c",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“亭”的部件。",
          "options": [
            {
              "id": "019f1455-aaa4-706e-8bfe-5dd914912a2c-0",
              "text": "丁",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa4-706e-8bfe-5dd914912a2c-1",
              "text": "采",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa4-706e-8bfe-5dd914912a2c-2",
              "text": "从",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa4-706e-8bfe-5dd914912a2c-3",
              "text": "高",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-045f1238cfda",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "可贵",
      "wordPosition": 5,
      "hanzi": "贵",
      "primary": true,
      "ready": true,
      "pinyin": "guì",
      "charType": "会意字，形声字",
      "decomposition": "上下结构",
      "originalMeaning": "价格高",
      "description": "会意字，形声字，上下结构，本义是价格高。上面的“臾”像两只手捧着东西的样子，在这里提示读音、也表意；下面的“贝”，本义是贝壳，在古代当钱用，表示钱财。为了方便记忆，我们可以把上半部分的“臾”想象成手捧土地的样子，在古代土地是很珍贵的东西，需要花费很多钱来买地。花很多钱买的东西自然要珍惜，“贵”就由价格高的意思发展出了“珍惜”“珍贵”的意思。在这里是说花生的好处最可贵，就是指它这一点最值得我们珍惜。",
      "originalText": "父亲说：“花生的好处很多，有一样最可贵。",
      "parts": [
        {
          "char": "臾",
          "radical": true
        },
        {
          "char": "贝",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "臾",
          "description": "“臾”是会意字，字形像两只手捧着东西的样子。",
          "charType": "会意字",
          "children": []
        },
        {
          "char": "贝",
          "description": "“贝”是象形字，独体字，本义是海贝。甲骨文的字形像海贝形，上古时贝壳曾被用作货币。凡是带“贝”的字，往往跟财货有关，如财、货。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f0e-73fc-b4c9-a4f50fcd0a02",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“贵”的本义是？",
          "options": [
            {
              "id": "019f310c-3f0e-73fc-b4c9-a4f50fcd0a02-0",
              "text": "价格高",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-a4f50fcd0a02-1",
              "text": "色彩分布适当",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-a4f50fcd0a02-2",
              "text": "有三排尖齿的武器",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0e-73fc-b4c9-ab5909e41b89",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“贵”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f0e-73fc-b4c9-ab5909e41b89-0",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-ab5909e41b89-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-ab5909e41b89-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-ab5909e41b89-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“贵”字的结构吧。"
        },
        {
          "id": "019f310c-3f0e-73fc-b4c9-acad83f92f18",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“贵”字呢？",
          "options": [
            {
              "id": "019f310c-3f0e-73fc-b4c9-acad83f92f18-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-acad83f92f18-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-acad83f92f18-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“贵”的本义是价格高哟。"
        },
        {
          "id": "019f310c-3f0e-73fc-b4c9-b0ace954f88d",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“贵”的部件。",
          "options": [
            {
              "id": "019f310c-3f0e-73fc-b4c9-b0ace954f88d-0",
              "text": "皮",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-b0ace954f88d-1",
              "text": "奏",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-b0ace954f88d-2",
              "text": "贝",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0e-73fc-b4c9-b0ace954f88d-3",
              "text": "臾",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0e-73fc-b4c9-b4acaa1bb709",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“贵”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-407a-767a-8d9e-fec45caa0b79",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“贵”的部件。",
          "options": [
            {
              "id": "019f310c-407a-767a-8d9e-fec45caa0b79-0",
              "text": "臾",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-407a-767a-8d9e-fec45caa0b79-1",
              "text": "区",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-407a-767a-8d9e-fec45caa0b79-2",
              "text": "贝",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-407a-767a-8d9e-fec45caa0b79-3",
              "text": "止",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-407a-767a-8d9f-036f780982f9",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“贵”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e0-75c9-a876-ad9bdd0c9b6b",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“贵”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e0-75c9-a876-ad9bdd0c9b6b-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-ad9bdd0c9b6b-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-ad9bdd0c9b6b-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-ad9bdd0c9b6b-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa7-7549-b1a4-1c800560f1bf",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“贵”的部件。",
          "options": [
            {
              "id": "019f1455-aaa7-7549-b1a4-1c800560f1bf-0",
              "text": "臾",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-1c800560f1bf-1",
              "text": "小",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-1c800560f1bf-2",
              "text": "贝",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-1c800560f1bf-3",
              "text": "用",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-00c686953731",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "可贵",
      "wordPosition": 5,
      "hanzi": "可",
      "primary": true,
      "ready": true,
      "pinyin": "kě",
      "charType": "会意兼形声字",
      "decomposition": "半包围结构",
      "originalMeaning": "劳作时加油鼓劲儿的歌声",
      "description": "会意兼形声字，半包围结构，本义是劳作时加油鼓劲儿的歌声。左下角是“口”，是在强调歌声是人从口中发出的。“丁”在古文字里本写作“丂”，是劳动用的工具，在这里也提示读音。古时候干活儿劳作非常枯燥，人们在劳作时就会聊天唱歌，一问一答，一唱一和，缓解劳作的枯燥，所以“可”就有“应和”“应许”的意思。人们都应许的事物就值得去做的事情，“可”就有了“值得”的意思。这里的“可贵”就是值得人们珍视。",
      "originalText": "父亲说：“花生的好处很多，有一样最可贵。",
      "parts": [
        {
          "char": "丂",
          "radical": true
        },
        {
          "char": "口",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "口",
          "description": "“口”是象形字，半包围结构，甲骨文像人嘴张开的样子，本义是人的嘴巴。带“口”的字大多和嘴有关，像叫、吃、唱。嘴是东西出入的地方，“口”又引申指出入、通过的地方，像“门口”“路口”。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "丂",
          "description": "“丂”是象形字，样子像一把斧头的手柄，本义是支撑重物的工具，古人叫它“斧柯”。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f07-71c3-87a2-3ac462815c22",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“可”的本义是？",
          "options": [
            {
              "id": "019f310c-3f07-71c3-87a2-3ac462815c22-0",
              "text": "事物初生柔弱的样子",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-3ac462815c22-1",
              "text": "赘疣",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-3ac462815c22-2",
              "text": "劳作时加油鼓劲儿的歌声",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f07-71c3-87a2-3d02230b6b83",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“可”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f07-71c3-87a2-3d02230b6b83-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-3d02230b6b83-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-3d02230b6b83-2",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-3d02230b6b83-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“可”字的结构吧。"
        },
        {
          "id": "019f310c-3f07-71c3-87a2-4046cb0bd7a5",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“可”字呢？",
          "options": [
            {
              "id": "019f310c-3f07-71c3-87a2-4046cb0bd7a5-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-4046cb0bd7a5-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-4046cb0bd7a5-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“可”的本义是劳作时加油鼓劲儿的歌声哟。"
        },
        {
          "id": "019f310c-3f07-71c3-87a2-47cfb51ec6fd",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“可”的部件。",
          "options": [
            {
              "id": "019f310c-3f07-71c3-87a2-47cfb51ec6fd-0",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-47cfb51ec6fd-1",
              "text": "包",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f07-71c3-87a2-47cfb51ec6fd-2",
              "text": "丂",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-3f07-71c3-87a2-47cfb51ec6fd-3",
              "text": "人彡",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f07-71c3-87a2-4962dcd2fc40",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“可”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4076-72ec-9251-ae8d81b7db21",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“可”的部件。",
          "options": [
            {
              "id": "019f310c-4076-72ec-9251-ae8d81b7db21-0",
              "text": "区",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-4076-72ec-9251-ae8d81b7db21-1",
              "text": "旦",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f310c-4076-72ec-9251-ae8d81b7db21-2",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-4076-72ec-9251-ae8d81b7db21-3",
              "text": "丂",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-4076-72ec-9251-b1768767a941",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“可”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00de-702f-8567-7f97ad8bbd49",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“可”是什么结构?",
          "options": [
            {
              "id": "019f1453-00de-702f-8567-7f97ad8bbd49-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-7f97ad8bbd49-1",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-7f97ad8bbd49-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-7f97ad8bbd49-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa5-76df-a98c-32af5aff3aef",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“可”的部件。",
          "options": [
            {
              "id": "019f1455-aaa5-76df-a98c-32af5aff3aef-0",
              "text": "丂",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa5-76df-a98c-32af5aff3aef-1",
              "text": "犭",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa5-76df-a98c-32af5aff3aef-2",
              "text": "口",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa5-76df-a98c-32af5aff3aef-3",
              "text": "仓",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-107a74abbe03",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "嫩绿",
      "wordPosition": 6,
      "hanzi": "绿",
      "primary": true,
      "ready": true,
      "pinyin": "lǜ",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "绿色",
      "description": "“绿”，形声字，左右结构，本义是绿色。“纟”本义是细丝，是制作布帛的材料；古人调好颜料后，会把布帛泡进染料里染色，所以很多和颜色有关的字都用“纟”旁，比如“绿”“红”。右边的“录”，甲骨文画的是用辘轳（lù）在水井上打水的样子，本义就是“辘”这种打水的工具，在这里提示读音。为了方便记忆，我们可以这样联想：要把丝做的布料染成绿色，就要打水调制颜料，再把布匹挂在架子上晾干。",
      "originalText": "它的果实埋在地里，不像桃子、石榴、苹果那样，把鲜红嫩绿的果实高高地挂在枝上，使人一见就生爱慕之心。",
      "parts": [
        {
          "char": "纟",
          "radical": true
        },
        {
          "char": "录",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "纟",
          "description": "“纟”的原形是“系”，作偏旁时写成绞丝旁“纟”。“系”最早是一束丝的样子，是个象形字，本义是细细的丝线。“系”很少出现在别的字里，而是作为偏旁“纟”出现在很多字里，如“丝”“线”“纺”，这些字的意思大多和丝线、纺织有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "录",
          "description": "录是一个象形字，描摹了用辘轳（lù lu）在水井上打水的样子，本来指打水用的“辘”，现在被使用的“记录”的“录”，属于假借用法。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f3890-3a2b-71f9-86d2-d2cd198e8f9c",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“绿”的本义是？",
          "options": [
            {
              "id": "019f3890-3a2b-71f9-86d2-d2cd198e8f9c-0",
              "text": "背诵、朗读",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-d2cd198e8f9c-1",
              "text": "錾凿一类的工具",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-d2cd198e8f9c-2",
              "text": "绿色",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a2b-71f9-86d2-d7804250af22",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“绿”是什么结构?",
          "options": [
            {
              "id": "019f3890-3a2b-71f9-86d2-d7804250af22-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-d7804250af22-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-d7804250af22-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-d7804250af22-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“绿”字的结构吧。"
        },
        {
          "id": "019f3890-3a2b-71f9-86d2-db74937e5b84",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“绿”字呢？",
          "options": [
            {
              "id": "019f3890-3a2b-71f9-86d2-db74937e5b84-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-db74937e5b84-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-db74937e5b84-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“绿”的本义是绿色哟。"
        },
        {
          "id": "019f3890-3a2b-71f9-86d2-dd0a045e5ebd",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“绿”的部件。",
          "options": [
            {
              "id": "019f3890-3a2b-71f9-86d2-dd0a045e5ebd-0",
              "text": "纟",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-dd0a045e5ebd-1",
              "text": "尸",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-dd0a045e5ebd-2",
              "text": "录",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a2b-71f9-86d2-dd0a045e5ebd-3",
              "text": "用",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a2b-71f9-86d2-e3d767bedaf9",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“绿”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f3890-3a32-729b-9c74-ddc2a67326e4",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“绿”的部件。",
          "options": [
            {
              "id": "019f3890-3a32-729b-9c74-ddc2a67326e4-0",
              "text": "周",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f3890-3a32-729b-9c74-ddc2a67326e4-1",
              "text": "录",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f3890-3a32-729b-9c74-ddc2a67326e4-2",
              "text": "屮",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f3890-3a32-729b-9c74-ddc2a67326e4-3",
              "text": "纟",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f3890-3a32-729b-9c74-e0c945f7bc5f",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“绿”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00df-7407-8dda-57bbe290bc0f",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“绿”是什么结构?",
          "options": [
            {
              "id": "019f1453-00df-7407-8dda-57bbe290bc0f-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-57bbe290bc0f-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-57bbe290bc0f-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-57bbe290bc0f-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa6-77bd-88ba-cb29e83031c1",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“绿”的部件。",
          "options": [
            {
              "id": "019f1455-aaa6-77bd-88ba-cb29e83031c1-0",
              "text": "录",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-cb29e83031c1-1",
              "text": "竹",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-cb29e83031c1-2",
              "text": "纟",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-cb29e83031c1-3",
              "text": "世",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-0e550b46e532",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "嫩绿",
      "wordPosition": 6,
      "hanzi": "嫩",
      "primary": true,
      "ready": true,
      "pinyin": "nèn",
      "charType": "形声兼会意字",
      "decomposition": "左右结构",
      "originalMeaning": "事物初生柔弱的样子",
      "description": "“嫩”是形声兼会意字，左右结构，本义是事物初生柔弱的样子。左边的“女”，本义是女子，表示这个字和女子的样子有关；右边的“敕”本来写作“軟”，后来变化为“敕”，“敕”在这里也提示读音。不过我们可以这样联想：瓜藤长出来时一位女子用手拿着木棍把藤蔓捆扎上，来让瓜蔓更好结果。女子身姿柔美，而瓜藤刚长出来时枝条也是柔美，于是“嫩”引申指草木初生稚嫩；初生的叶子颜色浅淡。在这里就指像新叶那样又浅又新鲜的绿。",
      "originalText": "它的果实埋在地里，不像桃子、石榴、苹果那样，把鲜红嫩绿的果实高高地挂在枝上，使人一见就生爱慕之心。",
      "parts": [
        {
          "char": "女",
          "radical": true
        },
        {
          "char": "敕",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "女",
          "description": "女是象形字，甲骨文画的是一个女子两手交叉在胸前、跪坐的样子，本义是未出嫁的女子，后来泛指女性。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "敕",
          "description": "“敕”是会意兼形声字，左边“束”是用绳子把木柴捆好，本义是捆、缚；右边“攵”是手拿棍棒。两件合起来，就像手拿棍棒把东西整理捆好，本义是整治使严整。现在多指皇帝下达的命令。",
          "charType": "会意字，形声字",
          "children": [
            "束",
            "攵"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f0b-733e-8a13-c3f52a4a7c57",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“嫩”的本义是？",
          "options": [
            {
              "id": "019f310c-3f0b-733e-8a13-c3f52a4a7c57-0",
              "text": "事物初生柔弱的样子",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c3f52a4a7c57-1",
              "text": "古人居住的半地下土窖。地室",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c3f52a4a7c57-2",
              "text": "空气中降落的白色冰晶体",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0b-733e-8a13-c45f31cfec8f",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“嫩”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f0b-733e-8a13-c45f31cfec8f-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c45f31cfec8f-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c45f31cfec8f-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c45f31cfec8f-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“嫩”字的结构吧。"
        },
        {
          "id": "019f310c-3f0b-733e-8a13-c8fca51d3df7",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“嫩”字呢？",
          "options": [
            {
              "id": "019f310c-3f0b-733e-8a13-c8fca51d3df7-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c8fca51d3df7-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-c8fca51d3df7-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“嫩”的本义是事物初生柔弱的样子哟。"
        },
        {
          "id": "019f310c-3f0b-733e-8a13-ce9f20c8bb58",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“嫩”的部件。",
          "options": [
            {
              "id": "019f310c-3f0b-733e-8a13-ce9f20c8bb58-0",
              "text": "句",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0b-733e-8a13-ce9f20c8bb58-1",
              "text": "弱",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f310c-3f0b-733e-8a13-ce9f20c8bb58-2",
              "text": "女",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-3f0b-733e-8a13-ce9f20c8bb58-3",
              "text": "敕",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0b-733e-8a13-d3b7da1df5f6",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“嫩”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4078-743d-8ce9-55428e7969e5",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“嫩”的部件。",
          "options": [
            {
              "id": "019f310c-4078-743d-8ce9-55428e7969e5-0",
              "text": "巳",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-4078-743d-8ce9-55428e7969e5-1",
              "text": "女",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-4078-743d-8ce9-55428e7969e5-2",
              "text": "敕",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-4078-743d-8ce9-55428e7969e5-3",
              "text": "佥",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-4078-743d-8ce9-5aa91f3afa83",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“嫩”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00df-7407-8dda-4831977123f8",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“嫩”是什么结构?",
          "options": [
            {
              "id": "019f1453-00df-7407-8dda-4831977123f8-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-4831977123f8-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-4831977123f8-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00df-7407-8dda-4831977123f8-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa6-77bd-88ba-bd7c3f2cc76e",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“嫩”的部件。",
          "options": [
            {
              "id": "019f1455-aaa6-77bd-88ba-bd7c3f2cc76e-0",
              "text": "敕",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-bd7c3f2cc76e-1",
              "text": "阝",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-bd7c3f2cc76e-2",
              "text": "玉",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa6-77bd-88ba-bd7c3f2cc76e-3",
              "text": "女",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-1c2b90eef3c3",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "体面",
      "wordPosition": 7,
      "hanzi": "面",
      "primary": true,
      "ready": true,
      "pinyin": "miàn",
      "charType": "象形字",
      "decomposition": "独体字",
      "originalMeaning": "脸",
      "description": "象形字，独体字，本义是脸。甲骨文外面画一圈脸的轮廓，里面只画一只眼睛，眼睛是一张脸上最传神的地方，画上它就能一眼看出这是脸。脸是人最在意、最爱给别人看的部位，所以由脸引申出脸面、情面、名誉的意思（面子）；在这里指一个人在人前的脸面和光彩，体面就是外表好看、有面子。",
      "originalText": "我说：“那么，人要做有用的人，不要做只讲体面，而对别人没有好处的人。”",
      "parts": [
        {
          "char": "面",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f310c-3f0f-7239-acbe-4fe087904c43",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“面”的本义是？",
          "options": [
            {
              "id": "019f310c-3f0f-7239-acbe-4fe087904c43-0",
              "text": "古代计时的漏壶",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-4fe087904c43-1",
              "text": "山脊",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-4fe087904c43-2",
              "text": "脸",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f0f-7239-acbe-5399e16513f7",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“面”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f0f-7239-acbe-5399e16513f7-0",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-5399e16513f7-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-5399e16513f7-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-5399e16513f7-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“面”字的结构吧。"
        },
        {
          "id": "019f310c-3f0f-7239-acbe-5528514fcb09",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“面”字呢？",
          "options": [
            {
              "id": "019f310c-3f0f-7239-acbe-5528514fcb09-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-5528514fcb09-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f0f-7239-acbe-5528514fcb09-2",
              "text": "选项 3",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "“面”的本义是脸哟。"
        },
        {
          "id": "019f310c-3f0f-7239-acbe-5a6d24fdea67",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“面”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-407b-711c-86be-30907f5f452c",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“面”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e0-75c9-a876-b1f56e8994b0",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“面”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e0-75c9-a876-b1f56e8994b0-0",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-b1f56e8994b0-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-b1f56e8994b0-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-b1f56e8994b0-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa7-7549-b1a4-216bc6cde641",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“面”的部件。",
          "options": [
            {
              "id": "019f1455-aaa7-7549-b1a4-216bc6cde641-0",
              "text": "甬",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-216bc6cde641-1",
              "text": "面",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-216bc6cde641-2",
              "text": "同",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaa7-7549-b1a4-216bc6cde641-3",
              "text": "娄",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-1a01682b33c7",
      "lessonId": "019f0523-819f-7702-89a2-7b176be276e5",
      "lessonTitle": "落花生",
      "lessonPosition": 2,
      "word": "体面",
      "wordPosition": 7,
      "hanzi": "体",
      "primary": true,
      "ready": true,
      "pinyin": "tǐ",
      "charType": "会意字",
      "decomposition": "左右结构",
      "originalMeaning": "身体",
      "description": "“体”是会意字，左右结构，本义是身体。从字形上看，左边的“亻”代表“人”，右边的“本”指代树根。一棵树苗想要长成大树，最重要的是依靠树根吸收营养；同样的道理，一个人想要成才，最根本的就是拥有健康的身体。一棵茁壮生长的大树，枝繁叶茂，给人挺拔、美观的印象。人也和树木一样，只有身体健康、汲取了充足的养分，才能向外界展现出良好的精神风貌。因此，“体”字便由“身体”引申出了“体面”的含义，指在别人面前显得有光彩、有面子。",
      "originalText": "我说：“那么，人要做有用的人，不要做只讲体面，而对别人没有好处的人。”",
      "parts": [
        {
          "char": "亻",
          "radical": true
        },
        {
          "char": "本",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "亻",
          "description": "亻，“人”的偏旁变体。“人”是象形字，独体字，甲骨文像一个侧身站立的人，本义指人。凡是带“人”（亻）的字往往跟人有关，如众、信。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "本",
          "description": "“本”是指事字，在“木”（树）的下边树根处加一个点，专门点出树根的位置，本义就是树根。后来也指事物的根基，比如“根本”。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f310c-3f05-77fe-b934-84a8a2c3321c",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“体”的本义是？",
          "options": [
            {
              "id": "019f310c-3f05-77fe-b934-84a8a2c3321c-0",
              "text": "身体",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-84a8a2c3321c-1",
              "text": "能容纳众多河流的广阔水域",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-84a8a2c3321c-2",
              "text": "警告，规劝",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f05-77fe-b934-8a92121c987c",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“体”是什么结构?",
          "options": [
            {
              "id": "019f310c-3f05-77fe-b934-8a92121c987c-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-8a92121c987c-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-8a92121c987c-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-8a92121c987c-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“体”字的结构吧。"
        },
        {
          "id": "019f310c-3f05-77fe-b934-8f8aec4e9538",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“体”字呢？",
          "options": [
            {
              "id": "019f310c-3f05-77fe-b934-8f8aec4e9538-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-8f8aec4e9538-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-8f8aec4e9538-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“体”的本义是身体哟。"
        },
        {
          "id": "019f310c-3f05-77fe-b934-93447cb7fc49",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“体”的部件。",
          "options": [
            {
              "id": "019f310c-3f05-77fe-b934-93447cb7fc49-0",
              "text": "欠",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-93447cb7fc49-1",
              "text": "本",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-93447cb7fc49-2",
              "text": "一口",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-3f05-77fe-b934-93447cb7fc49-3",
              "text": "亻",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-3f05-77fe-b934-978b65197bd5",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“体”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f310c-4075-7382-bdf3-344f279b8d5e",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“体”的部件。",
          "options": [
            {
              "id": "019f310c-4075-7382-bdf3-344f279b8d5e-0",
              "text": "夆",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f310c-4075-7382-bdf3-344f279b8d5e-1",
              "text": "本",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f310c-4075-7382-bdf3-344f279b8d5e-2",
              "text": "亻",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f310c-4075-7382-bdf3-344f279b8d5e-3",
              "text": "正",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f310c-4075-7382-bdf3-3abf94fa05da",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“体”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00de-702f-8567-7bc8e361c76c",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“体”是什么结构?",
          "options": [
            {
              "id": "019f1453-00de-702f-8567-7bc8e361c76c-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-7bc8e361c76c-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-7bc8e361c76c-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00de-702f-8567-7bc8e361c76c-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaa4-706e-8bfe-636bf80abc05",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“体”的部件。",
          "options": [
            {
              "id": "019f1455-aaa4-706e-8bfe-636bf80abc05-0",
              "text": "鸟",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaa4-706e-8bfe-636bf80abc05-1",
              "text": "亻",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaa4-706e-8bfe-636bf80abc05-2",
              "text": "本",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaa4-706e-8bfe-636bf80abc05-3",
              "text": "弓",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-26177aed95a6",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "平原",
      "wordPosition": 1,
      "hanzi": "平",
      "primary": true,
      "ready": true,
      "pinyin": "píng",
      "charType": "会意字",
      "decomposition": "独体字",
      "originalMeaning": "语气平和舒顺",
      "description": "独体字。从小篆字形来看，此字由“亏”和“八”组成，“亏”就是“于”，是气受阻碍而能越过的意思，“八”是分的意思，气越过而能分散，语气自然平和舒顺，所以本义是语气平和舒顺。简体字“平”的字形象古代的天平，我们可以将字形联想成一根中间拴着绳子的直杆，两头各挂一个小盘的天平，直观象征平衡均等。天平是不歪不晃的，也可以联想到“平”有平稳的意思。在这里就是这个含义。",
      "originalText": "",
      "parts": [
        {
          "char": "平",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f5658-69c7-7019-a8d5-62983081eafe",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“平”的本义是？",
          "options": [
            {
              "id": "019f5658-69c7-7019-a8d5-62983081eafe-0",
              "text": "说个没完没了",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-62983081eafe-1",
              "text": "语气平和舒顺",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-62983081eafe-2",
              "text": "言语、话语",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69c7-7019-a8d5-67dae0173651",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“平”是什么结构?",
          "options": [
            {
              "id": "019f5658-69c7-7019-a8d5-67dae0173651-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-67dae0173651-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-67dae0173651-2",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-67dae0173651-3",
              "text": "上下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“平”字的结构吧。"
        },
        {
          "id": "019f5658-69c7-7019-a8d5-6b463b575640",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“平”字呢？",
          "options": [
            {
              "id": "019f5658-69c7-7019-a8d5-6b463b575640-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-6b463b575640-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69c7-7019-a8d5-6b463b575640-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“平”的本义是语气平和舒顺哟。"
        },
        {
          "id": "019f5658-69c7-7019-a8d5-6f3368201f39",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“平”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f5658-69d2-7005-8cd0-e9e28b93b3e3",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“平”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e3-766e-ad65-64e19b977eb7",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“平”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e3-766e-ad65-64e19b977eb7-0",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-64e19b977eb7-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-64e19b977eb7-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-64e19b977eb7-3",
              "text": "上下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaad-724a-a0b5-ce50d65618f4",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“平”的部件。",
          "options": [
            {
              "id": "019f1455-aaad-724a-a0b5-ce50d65618f4-0",
              "text": "不",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaad-724a-a0b5-ce50d65618f4-1",
              "text": "平",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaad-724a-a0b5-ce50d65618f4-2",
              "text": "寺",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-ce50d65618f4-3",
              "text": "内",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-2b9faa8e8de1",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "平原",
      "wordPosition": 1,
      "hanzi": "原",
      "primary": true,
      "ready": false,
      "pinyin": "yuán",
      "charType": "会意字",
      "decomposition": "左上包围结构",
      "originalMeaning": "水流源头",
      "description": "会意字，左上包围结构，本义是水流源头。“厂”本义是山崖，“泉”本义是泉水；山崖下面有泉水从洞里流出来，正是江河的源头，所以“厂”和“泉”合起来就表示水流的源头。也指宽广平坦的大片土地。这层意思是古人借用“原”字来表示的，和水源的本义关系不大；平原就是地势平坦、一望无际的大片原野。",
      "originalText": "1942到1944那几年，日本侵略军在冀中平原上“大扫荡”，还修筑了封锁沟和封锁墙，十里一碉，八里一堡，想搞垮我们的人民武装。",
      "parts": [
        {
          "char": "厂",
          "radical": true
        },
        {
          "char": "泉",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "厂",
          "description": "“厂”最早的样子像一块突出来的山崖，本义是山崖；后来也表示一种没有墙壁或只有一面墙的简易房屋、棚子，如牲口棚。现在“厂”也指生产加工的地方，如工厂。带“厂”的字常常和山石或像山崖、棚屋这样的高敞建筑有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "泉",
          "description": "“泉”是一个象形字，它的字形就像水从泉眼里涌出来的样子。外面一圈表示泉口，中间是流出的水。所以“泉”的本义就是泉水，也就是从地下冒出来的水。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e1-731a-a12d-7ebe9d1546c7",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“原”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e1-731a-a12d-7ebe9d1546c7-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7ebe9d1546c7-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7ebe9d1546c7-2",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7ebe9d1546c7-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaab-70a3-bc5f-ce4600f61ce6",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“原”的部件。",
          "options": [
            {
              "id": "019f1455-aaab-70a3-bc5f-ce4600f61ce6-0",
              "text": "厂",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-ce4600f61ce6-1",
              "text": "丸",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-ce4600f61ce6-2",
              "text": "泉",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-ce4600f61ce6-3",
              "text": "几",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-32d678fd6bf6",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "封锁",
      "wordPosition": 2,
      "hanzi": "封",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "堆土植树为界",
      "description": "象形，会意，左右结构，本义是堆土植树为界。左边的“圭”是两个“土”叠在一起，像一座高高堆起的土堆；右边的“寸”是一只手。合起来就像用手在土堆上栽种树木——古人正是用堆土、植树的办法划出田地和封国的边界，这就是“封”的本义。也指封闭、堵住。堆土成界、聚土筑坟都是用土把里面的东西围起来封紧，因此引申为封闭、封住；封锁就是把交通、地方严密地封住堵死，使敌人无法往来。",
      "originalText": "1942到1944那几年，日本侵略军在冀中平原上“大扫荡”，还修筑了封锁沟和封锁墙，十里一碉，八里一堡，想搞垮我们的人民武装。",
      "parts": [
        {
          "char": "圭",
          "radical": true
        },
        {
          "char": "寸",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "圭",
          "description": "“圭”是两个“土”上下叠成的会意字，本义是古代帝王诸侯举行典礼时手持的玉制礼器，上圆下方。古代用圭作分封土地的凭证，所以字形用两个“土”来表示。",
          "charType": "会意字",
          "children": [
            "土",
            "土"
          ]
        },
        {
          "char": "寸",
          "description": "“寸”是指事字，独体字，本义是寸口、寸脉（位于手腕外侧、离手腕横纹约一拇指宽的动脉处）。甲骨文的字形是一只手，上面的“一”是指事符号，专门标出寸口所在。因为这里距离手腕横纹正好一寸，所以“寸”后来用作长度单位——十分为一寸。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e2-7739-af2a-173950c0f146",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“封”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e2-7739-af2a-173950c0f146-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-173950c0f146-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-173950c0f146-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-173950c0f146-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaac-7418-b6e6-fb56152ce1a1",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“封”的部件。",
          "options": [
            {
              "id": "019f1455-aaac-7418-b6e6-fb56152ce1a1-0",
              "text": "气",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-fb56152ce1a1-1",
              "text": "⺮",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-fb56152ce1a1-2",
              "text": "圭",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-fb56152ce1a1-3",
              "text": "寸",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-35da3e2ae594",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "封锁",
      "wordPosition": 2,
      "hanzi": "锁",
      "primary": true,
      "ready": false,
      "pinyin": "suǒ",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "可启闭的封缄器，需用钥匙等才能打开",
      "description": "会意兼形声字，左右结构，本义是可启闭的封缄器，需用钥匙等才能打开。繁体写作“鎖”。左边的“钅”来自“金”，表示锁是金属做的器具；右边的“𧴪”承接繁体“鎖”的声符“貧”，在这里提示读音，不是“肖”。金属器件装在门、箱子或链环上，用钥匙才能启闭，就是锁。也指像上锁一样把地方封住、卡死。锁装在门、箱上，一锁上就打不开、进不去，由这一特点引申为封住、隔绝；封锁就是把交通要道严密封住卡死，让人们无法往来。",
      "originalText": "1942到1944那几年，日本侵略军在冀中平原上“大扫荡”，还修筑了封锁沟和封锁墙，十里一碉，八里一堡，想搞垮我们的人民武装。",
      "parts": [
        {
          "char": "钅",
          "radical": true
        },
        {
          "char": "⺌贝",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "钅",
          "description": "钅是金的偏旁变体。“金”是象形兼会意兼形声字，上下结构，本义是铜，后来泛指金属。作偏旁写成“钅”（金字旁），带“钅”的字大多和金属有关。",
          "charType": "象形兼会意兼形声字",
          "children": []
        },
        {
          "char": "𧴪",
          "charType": "声符记号",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e7-75e9-bbfb-79f10963e2bd",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“锁”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e7-75e9-bbfb-79f10963e2bd-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-79f10963e2bd-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-79f10963e2bd-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-79f10963e2bd-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab3-75c3-b03d-486b40c17664",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“锁”的部件。",
          "options": [
            {
              "id": "019f1455-aab3-75c3-b03d-486b40c17664-0",
              "text": "夫",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab3-75c3-b03d-486b40c17664-1",
              "text": "钅",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab3-75c3-b03d-486b40c17664-2",
              "text": "讠",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab3-75c3-b03d-486b40c17664-3",
              "text": "⺌贝",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-3ffe5988d8e6",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "粉碎",
      "wordPosition": 3,
      "hanzi": "粉",
      "primary": true,
      "ready": false,
      "pinyin": "fěn",
      "charType": "会意字",
      "decomposition": "左右结构",
      "originalMeaning": "特制的供化妆用的细末",
      "description": "形声字，会意字，左右结构，本义是特制的供化妆用的细末。左边的“米”本义是小米，表示这种细末是用米等粮食磨成的；右边的“分”本义是分开、分割，在这里提示读音、也表意——把米粒一点点分碎、磨细，就成了又白又细的粉末。合起来，“粉”就指把米磨成的细末，特别是古人化妆用的白粉。也指使东西碎成粉末般的细屑。粉是把米磨得又白又细的末，细到极点也碎到极点，由这份又细又碎引申指把完整的东西弄成细碎的粉末；粉碎就是把东西砸得又碎又细，课文中用来比喻彻底打垮敌人的扫荡。",
      "originalText": "为了粉碎敌人的“扫荡”，冀中人民在中国共产党的领导下，创造了新的斗争方式，这就是地道战。",
      "parts": [
        {
          "char": "米",
          "radical": true
        },
        {
          "char": "分",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "米",
          "description": "“米”是象形字，画的是谷穗，中间一横像穗梗，上下的小点像脱壳后的米粒。本义是“小米”，也就是谷子去皮后的籽实，现在也泛指各种去壳的粮食，比如大米。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "分",
          "description": "“分”是会意字，上面是“八”，下面是“刀”。“八”是两笔向两边分开的样子，“刀”是刀具，合起来就是用刀把东西切开，本义是分开、分割，现在还常表示分开、分配。",
          "charType": "会意字",
          "children": [
            "八",
            "刀"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e6-71a2-ac7b-64be16d0fe94",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“粉”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e6-71a2-ac7b-64be16d0fe94-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-64be16d0fe94-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-64be16d0fe94-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-64be16d0fe94-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab2-722a-a2af-12211cae2ccb",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“粉”的部件。",
          "options": [
            {
              "id": "019f1455-aab2-722a-a2af-12211cae2ccb-0",
              "text": "并",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab2-722a-a2af-12211cae2ccb-1",
              "text": "占",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab2-722a-a2af-12211cae2ccb-2",
              "text": "分",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-12211cae2ccb-3",
              "text": "米",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-437a9227498f",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "粉碎",
      "wordPosition": 3,
      "hanzi": "碎",
      "primary": true,
      "ready": false,
      "pinyin": "suì",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "破碎",
      "description": "形声字，左右结构，本义是破碎，就是完整的东西裂成小块。左边的“石”本义是岩石，表示破碎跟石头有关——石头坚硬，一砸就能把东西打成小块，石头自己摔下来也会裂成碎块；右边的“卒”本义是穿着带记号衣服的奴隶，在这里提示读音。不过我们可以这样联想：“卒”是地位最低的小兵，一支大军拆开来就是无数个又小又不起眼的“卒”；一件完整的东西被砸“碎”，正是裂成又多又小的碎块，就像整支大军散成一个个小卒。",
      "originalText": "为了粉碎敌人的“扫荡”，冀中人民在中国共产党的领导下，创造了新的斗争方式，这就是地道战。",
      "parts": [
        {
          "char": "石",
          "radical": true
        },
        {
          "char": "卒",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "石",
          "description": "“石”是一个象形字，古人画了一座山崖，下面再画一块石头，用这个画面来表示“岩石”的意思。它的本义就是岩石，现在也常用来指各种各样的石头。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "卒",
          "description": "“卒”是会意字，在“衣”字上加一个“×”形标记。它的本义是穿着带有特殊记号衣服的奴隶。后来也用来指士兵。",
          "charType": "会意字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-362476108432",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“碎”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-362476108432-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-362476108432-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-362476108432-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-362476108432-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab1-7046-91e0-6ca5649b9bc4",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“碎”的部件。",
          "options": [
            {
              "id": "019f1455-aab1-7046-91e0-6ca5649b9bc4-0",
              "text": "卒",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab1-7046-91e0-6ca5649b9bc4-1",
              "text": "灬",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab1-7046-91e0-6ca5649b9bc4-2",
              "text": "石",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab1-7046-91e0-6ca5649b9bc4-3",
              "text": "覀",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-4b3e3c57c8c0",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "简直",
      "wordPosition": 4,
      "hanzi": "简",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "上下结构",
      "originalMeaning": "古代用以书写文字的狭长竹片",
      "description": "形声字，上下结构，本义是古代用以书写文字的狭长竹片。上边的“⺮”本义是竹子，表示简的材质是竹子；下边的“间”本义是空隙，在这里提示读音。不过我们可以这样联想：竹简是一片片狭长的竹片，用绳子编联成册后，简与简之间自然留下一道道空隙，正是“间”所指的空隙。也指简单、简略。竹简狭长，一片写不下几个字，写文章就得尽量简省，因此引申出简单、简略的意思；简直就是简单直捷地说，用来强调事情完全如此，课文说地道战简直是个奇迹，正是强调它太了不起了。",
      "originalText": "说起地道战，简直是个奇迹。",
      "parts": [
        {
          "char": "⺮",
          "radical": true
        },
        {
          "char": "间",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "⺮",
          "charType": "",
          "children": []
        },
        {
          "char": "间",
          "description": "“间”是一个会意字，由“门”和“日”组成。门里透进日光，表示门扇之间有缝隙，所以它的本义是“空隙”。现在也常用作“中间”的意思。",
          "charType": "会意字",
          "children": [
            "门",
            "日"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e6-71a2-ac7b-60c39e225027",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“简”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e6-71a2-ac7b-60c39e225027-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-60c39e225027-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-60c39e225027-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-60c39e225027-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab2-722a-a2af-0cf3fbe44375",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“简”的部件。",
          "options": [
            {
              "id": "019f1455-aab2-722a-a2af-0cf3fbe44375-0",
              "text": "二",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab2-722a-a2af-0cf3fbe44375-1",
              "text": "间",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-0cf3fbe44375-2",
              "text": "尧",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-0cf3fbe44375-3",
              "text": "⺮",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-4ef5eeb43215",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "简直",
      "wordPosition": 4,
      "hanzi": "直",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "上下结构",
      "originalMeaning": "正见",
      "description": "会意字，上下结构，本义是正见，就是用眼睛把东西看得端端正正、看它直不直。中间的“目”本义是眼睛；上面的“十”和下面的“一”，其实是古文字里一根竖直的标杆和一把测量用的曲尺变来的。古人用眼睛正对着这根竖直的标杆，看它端不端正、直不直，所以“直”就表示看得端正笔直，也就是正见。也指直接、径直，中间不绕弯。看得端正笔直，引出不弯曲、笔直的意思，而笔直的路最直接、不拐弯，于是引申为直接、径直；简直就是简单直捷地说，直截了当地断定事情完全就是这样。",
      "originalText": "说起地道战，简直是个奇迹。",
      "parts": [
        {
          "char": "直",
          "radical": true
        }
      ],
      "compositions": [
        {
          "char": "十",
          "description": "“十”是指事字，古人最早用一根竖棍表示数字十，后来在中间加一横，变成现在一横一竖的“十”。它的本义就是数字十，比九多一的整数。",
          "charType": "指事字",
          "children": []
        },
        {
          "char": "目",
          "description": "“目”是象形字，古文字像一只眼睛，外面是眼眶，里面是眼珠，本义就是人的眼睛。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "一",
          "description": "“一”是指事字，古人用简单的一横画来表示数目。它的本义就是数字“一”，是最小的正整数。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-2ae5e755b138",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“直”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-2ae5e755b138-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-2ae5e755b138-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-2ae5e755b138-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-2ae5e755b138-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab0-751a-bfbc-56074eb45d2f",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“直”的部件。",
          "options": [
            {
              "id": "019f1455-aab0-751a-bfbc-56074eb45d2f-0",
              "text": "同",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab0-751a-bfbc-56074eb45d2f-1",
              "text": "咅",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab0-751a-bfbc-56074eb45d2f-2",
              "text": "直",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab0-751a-bfbc-56074eb45d2f-3",
              "text": "矢",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-54108f5204ee",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "广阔",
      "wordPosition": 5,
      "hanzi": "广",
      "primary": true,
      "ready": false,
      "pinyin": "guǎng",
      "charType": "象形字",
      "decomposition": "独体字",
      "originalMeaning": "就着山崖建造的敞屋",
      "description": "象形字，独体字，本义是就着山崖建造的敞屋。古文字的“广”像靠着一面山崖搭起来的房子，有屋顶、有后壁，正面却完全敞开，就像古人依着山崖盖的披屋、牲口棚。这样一面敞开的大屋，就是“广”的本义。这种依山崖搭起的敞屋正面完全敞开、格外宽敞，因此引申为宽广、广阔，在“广阔平原”里就是形容平原一望无边、又宽又大。",
      "originalText": "在广阔平原的地底下，挖了不计其数的地道，横的、竖的、直的、弯的、家家相连，村村相通。",
      "parts": [
        {
          "char": "广",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e3-766e-ad65-6a564f932287",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“广”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e3-766e-ad65-6a564f932287-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6a564f932287-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6a564f932287-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6a564f932287-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaad-724a-a0b5-d19d8eb5b3c0",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“广”的部件。",
          "options": [
            {
              "id": "019f1455-aaad-724a-a0b5-d19d8eb5b3c0-0",
              "text": "糸",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-d19d8eb5b3c0-1",
              "text": "广",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaad-724a-a0b5-d19d8eb5b3c0-2",
              "text": "直",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-d19d8eb5b3c0-3",
              "text": "区",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-58aee8dc172b",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "广阔",
      "wordPosition": 5,
      "hanzi": "阔",
      "primary": true,
      "ready": true,
      "pinyin": "kuò",
      "charType": "形声字",
      "decomposition": "半包围结构",
      "originalMeaning": "开阔",
      "description": "形声字，半包围结构。外面的“门”表示字义与门相关，里面的“活”提示读音。结合各个部件的含义，“活”有活动、走动的意思，门表示家门口。在古代，穷人家门口只有一扇门；富人家门口有两扇门。越是有钱的人家，门就做得越大，门前的空地也特别宽敞，可以在那儿跑来跑去活动。所以“阔”的本义就是开阔。",
      "originalText": "在广阔平原的地底下，挖了不计其数的地道，横的、竖的、直的、弯的、家家相连，村村相通。",
      "parts": [
        {
          "char": "门",
          "radical": true
        },
        {
          "char": "活",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "门",
          "description": "“门”最早的样子就像一扇双开的门，是象形字，本义是房屋的门。后来引申出很多像门一样的东西，如炉门、闸门；也引申为重要的通道，如玉门关；还用来指家族或家庭，如门当户对。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "活",
          "description": "活是形声字。左边的“氵”（水）表示和水有关，右边的“舌”提示读音，“活”的本义是水流声。现代常用来表示生存、有生命、不固定等意思。",
          "charType": "形声字",
          "children": [
            "氵",
            "舌"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f5658-69cc-72cc-86ad-3f47fc9cce91",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“阔”的本义是？",
          "options": [
            {
              "id": "019f5658-69cc-72cc-86ad-3f47fc9cce91-0",
              "text": "开阔",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-3f47fc9cce91-1",
              "text": "讲述",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-3f47fc9cce91-2",
              "text": "举手挥动叫人来",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69cc-72cc-86ad-415d84f6dabe",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“阔”是什么结构?",
          "options": [
            {
              "id": "019f5658-69cc-72cc-86ad-415d84f6dabe-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-415d84f6dabe-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-415d84f6dabe-2",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-415d84f6dabe-3",
              "text": "上下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“阔”字的结构吧。"
        },
        {
          "id": "019f5658-69cc-72cc-86ad-456ae7821710",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“阔”字呢？",
          "options": [
            {
              "id": "019f5658-69cc-72cc-86ad-456ae7821710-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-456ae7821710-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-456ae7821710-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“阔”的本义是开阔哟。"
        },
        {
          "id": "019f5658-69cc-72cc-86ad-4b198f7cf8a1",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“阔”的部件。",
          "options": [
            {
              "id": "019f5658-69cc-72cc-86ad-4b198f7cf8a1-0",
              "text": "大",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f5658-69cc-72cc-86ad-4b198f7cf8a1-1",
              "text": "门",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f5658-69cc-72cc-86ad-4b198f7cf8a1-2",
              "text": "活",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cc-72cc-86ad-4b198f7cf8a1-3",
              "text": "矛",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69cc-72cc-86ad-4da1a01c8a3e",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“阔”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f5658-69d3-73fd-9bc2-9dee345d8666",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“阔”的部件。",
          "options": [
            {
              "id": "019f5658-69d3-73fd-9bc2-9dee345d8666-0",
              "text": "活",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69d3-73fd-9bc2-9dee345d8666-1",
              "text": "父",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f5658-69d3-73fd-9bc2-9dee345d8666-2",
              "text": "门",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f5658-69d3-73fd-9bc2-9dee345d8666-3",
              "text": "则",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69d3-73fd-9bc2-a0c0302f8d0e",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“阔”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e7-75e9-bbfb-7db37577cd4b",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“阔”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e7-75e9-bbfb-7db37577cd4b-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-7db37577cd4b-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-7db37577cd4b-2",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-7db37577cd4b-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab4-7551-89ef-153d3a5f0810",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“阔”的部件。",
          "options": [
            {
              "id": "019f1455-aab4-7551-89ef-153d3a5f0810-0",
              "text": "冖",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab4-7551-89ef-153d3a5f0810-1",
              "text": "活",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab4-7551-89ef-153d3a5f0810-2",
              "text": "门",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab4-7551-89ef-153d3a5f0810-3",
              "text": "石",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-648c839e834d",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "照常",
      "wordPosition": 6,
      "hanzi": "常",
      "primary": true,
      "ready": false,
      "pinyin": "cháng",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "下身穿的裙子",
      "description": "形声字，上下结构，本义是下身穿的裙子。上边的“尚”本义是酒器，在这里提示读音。不过我们可以这样联想：“尚”是敞口的酒器，是宴席上天天摆着、时时要用的东西；下身的裙裳也是古人天天要穿的寻常衣物，都是生活里离不开的常用之物。下边的“巾”本义是系在身上的小块布，表示裙子是用布做的，合起来就是裙子。所以“常”又有了平常、经常的意思，在“照常”里就指跟往常、平时一样。",
      "originalText": "敌人来了，我们就钻到地道里去，让他们扑个空；敌人走了，我们就从地道里出来，照常种地过日子，有时候还要打击敌人。",
      "parts": [
        {
          "char": "尚",
          "radical": true
        },
        {
          "char": "巾",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "尚",
          "description": "“尚”是一个象形字，它的古文字形就像一只盛酒的器具。它的本义是“酒器”。现在“尚”常用来表示“崇尚”“尊崇”的意思，和本义差别很大。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "巾",
          "description": "“巾”是一个象形字，画的就是一块系在身上的小布。外面弯弯的线条像布垂下来的样子，中间一竖是把它系起来的带子。它的本义就是用来擦手或佩戴的小块布，现在我们也叫它“手巾”或“头巾”。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e3-766e-ad65-6328601120c8",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“常”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e3-766e-ad65-6328601120c8-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6328601120c8-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6328601120c8-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6328601120c8-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaad-724a-a0b5-c95823a3f422",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“常”的部件。",
          "options": [
            {
              "id": "019f1455-aaad-724a-a0b5-c95823a3f422-0",
              "text": "开",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-c95823a3f422-1",
              "text": "尚",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaad-724a-a0b5-c95823a3f422-2",
              "text": "巾",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-c95823a3f422-3",
              "text": "小",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-61400fdba701",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "照常",
      "wordPosition": 6,
      "hanzi": "照",
      "primary": true,
      "ready": false,
      "pinyin": "zhào",
      "charType": "形声字，会意字",
      "decomposition": "上下结构",
      "originalMeaning": "光线射向物体",
      "description": "形声兼会意字，上下结构，本义是光线射向物体。上边的“昭”本义是日光明亮，在这里提示读音、也表意：太阳的光又亮又强，正和照射有关；下边的“灬”是“火”作偏旁时的写法，本义是火焰，表示照跟火光、光亮有关。上有明亮的日光、下有燃烧的火焰，这样的光射向物体，就是“照”。光射到物体上，能让人把东西看得清清楚楚；看清楚了就知道该照着什么去做，慢慢有了依照、按照的意思，在“照常”里就是依照往常，跟平时一个样。",
      "originalText": "敌人来了，我们就钻到地道里去，让他们扑个空；敌人走了，我们就从地道里出来，照常种地过日子，有时候还要打击敌人。",
      "parts": [
        {
          "char": "昭",
          "radical": true
        },
        {
          "char": "灬",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "昭",
          "description": "“昭”是形声字，左边是“日”，右边是“召”。它的字形就像太阳发出光芒，本义是“日光明亮”。现在也常用“昭”表示明显、清楚的意思。",
          "charType": "形声字",
          "children": [
            "日",
            "召"
          ]
        },
        {
          "char": "灬",
          "description": "灬是火的偏旁变体。“火”是象形字，独体字，本义是燃烧时的光焰。作偏旁写在字的下面就写成“灬”（四点底），带“灬”的字大多和火、加热、燃烧有关。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-277054d08b40",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“照”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-277054d08b40-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-277054d08b40-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-277054d08b40-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-277054d08b40-3",
              "text": "上下结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab0-751a-bfbc-523bd2b8ece5",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“照”的部件。",
          "options": [
            {
              "id": "019f1455-aab0-751a-bfbc-523bd2b8ece5-0",
              "text": "⺍",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab0-751a-bfbc-523bd2b8ece5-1",
              "text": "昭",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab0-751a-bfbc-523bd2b8ece5-2",
              "text": "灬",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab0-751a-bfbc-523bd2b8ece5-3",
              "text": "夌",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-728e3bdacf38",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "游击",
      "wordPosition": 7,
      "hanzi": "击",
      "primary": true,
      "ready": false,
      "pinyin": "jī",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "敲打，拍打",
      "description": "会意兼形声字，上下结构，本义是敲打，拍打。它的繁体写作“擊”，由“手”和“毄”组成，“毄”就是撞击的意思，用手去撞、去敲，所以本义是敲打、拍打。如今简化成“击”，是把繁体“擊”的偏旁轮廓保留下来写成的记号，笔画少了很多，意思还是用手用力敲打。敲打、拍打都是用力打在东西上，把这股力气对准敌人，就成了攻打、袭击，在“游击”里就指向敌人发动袭击。",
      "originalText": "靠着地道这种坚强的堡垒，冀中平原上的人民坚持了敌后游击战争。",
      "parts": [
        {
          "char": "击",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e1-731a-a12d-7709185b976a",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“击”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e1-731a-a12d-7709185b976a-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7709185b976a-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7709185b976a-2",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7709185b976a-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaa-730d-8f55-0307ed351e2e",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“击”的部件。",
          "options": [
            {
              "id": "019f1455-aaaa-730d-8f55-0307ed351e2e-0",
              "text": "击",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f55-0307ed351e2e-1",
              "text": "曾",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f55-0307ed351e2e-2",
              "text": "午",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f55-0307ed351e2e-3",
              "text": "厂",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-6f1312a8ab57",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "游击",
      "wordPosition": 7,
      "hanzi": "游",
      "primary": true,
      "ready": false,
      "pinyin": "yóu",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "古代缀于旗帜正幅下沿的垂饰",
      "description": "形声兼会意字，左右结构，本义是古代缀于旗帜正幅下沿的垂饰。左边的“氵”本义是流水，它是声符“汓”（也就是“泅”，指游水）简省来的，在这里提示读音、也表意：旗帜下沿的垂饰随风飘动，正像水流一样起伏摇曳。右边的“斿”本义就是旌旗正幅下沿的垂饰，表示这个字讲的正是旗上这种飘带。合起来，游就是随风飘动、像水流一样摆动的旗帜垂饰。旗上的垂饰随风飘荡、摆动不定，由这“飘忽不固定”的样子引申出流动、不固定的意思，在“游击”里就指行动灵活、打了就走的作战。",
      "originalText": "靠着地道这种坚强的堡垒，冀中平原上的人民坚持了敌后游击战争。",
      "parts": [
        {
          "char": "氵",
          "radical": true
        },
        {
          "char": "斿",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "氵",
          "description": "“氵”是“水”的偏旁形，象形字，独体字，本义是河流。甲骨文的字形像水流蜿蜒流动的形状，两侧的点像水滴。凡是带“氵”（水）的字，往往跟水流等义有关，如江、河。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "斿",
          "description": "“斿”是一个会意兼形声字，由左边的“㫃”和右边的“子”组成。“㫃”的古字形像一面旗子带着飘带，表示旗帜；“子”用来提示读音。它的本义是古代缀在旗帜正幅下沿的垂饰。",
          "charType": "会意兼形声字",
          "children": [
            "㫃",
            "子"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-231d036680a7",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“游”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-231d036680a7-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-231d036680a7-1",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-231d036680a7-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-231d036680a7-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab0-751a-bfbc-4d96d80ff8b4",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“游”的部件。",
          "options": [
            {
              "id": "019f1455-aab0-751a-bfbc-4d96d80ff8b4-0",
              "text": "斿",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab0-751a-bfbc-4d96d80ff8b4-1",
              "text": "巠",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab0-751a-bfbc-4d96d80ff8b4-2",
              "text": "卩",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab0-751a-bfbc-4d96d80ff8b4-3",
              "text": "氵",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-7ac68ada26e9",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "战争",
      "wordPosition": 8,
      "hanzi": "战",
      "primary": true,
      "ready": false,
      "pinyin": "zhàn",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "用戈搏击野兽",
      "description": "会意兼形声字，左右结构，本义是用戈搏击野兽。古人靠打猎来操练打仗，最早的“战”是“戈”加上“兽”，画的就是手持戈去搏击野兽。后来那个“兽”先讹变成“單”，简化时又换成了声符“占”。左边的“占”本义是占卜吉凶，在这里提示读音。不过我们可以这样联想：古人出兵打仗前，常先占卜这一仗的胜负吉凶，用“占”来记“战”也顺理成章。右边的“戈”本义是一种长柄横刃的兵器，表示搏击、打仗要用兵器。合起来，战就是手持戈这样的兵器去搏击、争斗。手持兵器搏击野兽本是古人操练打仗的方式，由这“持械厮杀”的特点引申为人与人拿着兵器交锋、作战，进而指军队之间的武装冲突，在“战争”里就指敌对双方的打仗、武装斗争。",
      "originalText": "靠着地道这种坚强的堡垒，冀中平原上的人民坚持了敌后游击战争。",
      "parts": [
        {
          "char": "占",
          "radical": true
        },
        {
          "char": "戈",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "占",
          "description": "“占”是一个会意字，上面是“卜”的变形，像龟甲被火烧出的裂纹，下面是“口”，表示嘴巴。合起来就是看着裂纹用嘴解说吉凶，本义是占卜。现在“占”也常用来表示占据、占有。",
          "charType": "会意字",
          "children": [
            "⺊",
            "口"
          ]
        },
        {
          "char": "戈",
          "description": "“戈”是象形字，独体字，本义是一种长柄横刃的兵器。甲骨文的字形像武器戈的样子。凡是带“戈”的字，往往跟兵器、杀伤等义有关，如战、武、伐。后来引申为战乱、战争，如干戈。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e3-766e-ad65-70ed23845c9f",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“战”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e3-766e-ad65-70ed23845c9f-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-70ed23845c9f-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-70ed23845c9f-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-70ed23845c9f-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaae-73c9-a3fa-c6de7680d280",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“战”的部件。",
          "options": [
            {
              "id": "019f1455-aaae-73c9-a3fa-c6de7680d280-0",
              "text": "丂",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-c6de7680d280-1",
              "text": "戈",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-c6de7680d280-2",
              "text": "古",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-c6de7680d280-3",
              "text": "占",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-7ed2f3d7f1f4",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "战争",
      "wordPosition": 8,
      "hanzi": "争",
      "primary": true,
      "ready": false,
      "pinyin": "zhēng",
      "charType": "会意字",
      "decomposition": "上下结构",
      "originalMeaning": "两手夺取一物",
      "description": "会意字，上下结构，本义是两手夺取一物。它的古文字上面是一只手（“爪”），下面是另一只手（“又”），中间那一竖弯笔是被抢的东西；上下两只手各自用力，都想把中间那件东西拉向自己这边，就像两个人拔河一样争来争去，所以“争”的本义就是两只手夺取同一件东西。",
      "originalText": "靠着地道这种坚强的堡垒，冀中平原上的人民坚持了敌后游击战争。",
      "parts": [
        {
          "char": "争",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e0-75c9-a876-bb55655d0875",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“争”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e0-75c9-a876-bb55655d0875-0",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-bb55655d0875-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-bb55655d0875-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-bb55655d0875-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaa-730d-8f54-f320129c8bf4",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“争”的部件。",
          "options": [
            {
              "id": "019f1455-aaaa-730d-8f54-f320129c8bf4-0",
              "text": "⺈",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f54-f320129c8bf4-1",
              "text": "彐亅",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f54-f320129c8bf4-2",
              "text": "戈",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f54-f320129c8bf4-3",
              "text": "宀",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-8afcad5537db",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "妨碍",
      "wordPosition": 9,
      "hanzi": "碍",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "阻止",
      "description": "形声兼会意字，左右结构，本义是阻止。它的繁体写作“礙”，左边“石”表示挡路的石头，右边“疑”有犹豫、停下不前的意思，一块石头挡在前面让人迟疑、停步，所以本义是阻止。如今简化成“碍”，左边的“石”本义是岩石，表示拦路的常是石头这类硬东西；右边的“㝵”是“得”的异体，本义是得到、到达，在这里提示读音。不过我们可以这样联想：一块大石头横在路当中，人想往前走却怎么也走不过去、到不了对面，这正是“碍”所说的阻挡、阻止。",
      "originalText": "地道有四尺多高，个儿高的人弯着腰可以通过；地道的顶离地面三四尺，不妨碍上面种庄稼。",
      "parts": [
        {
          "char": "石",
          "radical": true
        },
        {
          "char": "㝵",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "石",
          "description": "“石”是一个象形字，古人画了一座山崖，下面再画一块石头，用这个画面来表示“岩石”的意思。它的本义就是岩石，现在也常用来指各种各样的石头。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "㝵",
          "charType": "",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-333a09b772c0",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“碍”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-333a09b772c0-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-333a09b772c0-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-333a09b772c0-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-333a09b772c0-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab1-7046-91e0-681bbfa2140c",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“碍”的部件。",
          "options": [
            {
              "id": "019f1455-aab1-7046-91e0-681bbfa2140c-0",
              "text": "牛",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab1-7046-91e0-681bbfa2140c-1",
              "text": "石",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab1-7046-91e0-681bbfa2140c-2",
              "text": "⺮",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab1-7046-91e0-681bbfa2140c-3",
              "text": "㝵",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-8759e460059d",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "妨碍",
      "wordPosition": 9,
      "hanzi": "妨",
      "primary": true,
      "ready": false,
      "pinyin": "fáng",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "伤害，损害",
      "description": "形声字，左右结构，本义是伤害，损害。左边的“女”本义是女子，在这里表示“妨”讲的是人与人之间的伤害、妨害——古书里“妨”还曾指命相相克、彼此妨害。右边的“方”本义是古代翻土的农具，在这里提示读音。不过我们可以这样联想：“方”翻土时，会把地里的庄稼、草根一起翻断、翻乱，庄稼受了损伤，正对上“妨”伤害、损害的意思。损害一样东西，会让它不能正常发挥作用，由这个特点引申出干扰、阻碍的意思，在“不妨碍上面种庄稼”里就指地道不影响、不阻碍上面庄稼正常生长。",
      "originalText": "地道有四尺多高，个儿高的人弯着腰可以通过；地道的顶离地面三四尺，不妨碍上面种庄稼。",
      "parts": [
        {
          "char": "女",
          "radical": true
        },
        {
          "char": "方",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "女",
          "description": "女是象形字，甲骨文画的是一个女子两手交叉在胸前、跪坐的样子，本义是未出嫁的女子，后来泛指女性。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "方",
          "description": "“方”是象形字，最早画的是古代翻土用的农具，上面像把手，中间有横梁可以踩脚，下面有尖齿插进土里，本义就是这种翻土的农具。翻土会把土甩向远处，所以“方”引申出远方、方向的意思。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e2-7739-af2a-0c1e30378179",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“妨”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e2-7739-af2a-0c1e30378179-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-0c1e30378179-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-0c1e30378179-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-0c1e30378179-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaac-7418-b6e6-f3ce2d3fff15",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“妨”的部件。",
          "options": [
            {
              "id": "019f1455-aaac-7418-b6e6-f3ce2d3fff15-0",
              "text": "干",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaac-7418-b6e6-f3ce2d3fff15-1",
              "text": "方",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaac-7418-b6e6-f3ce2d3fff15-2",
              "text": "钅",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-f3ce2d3fff15-3",
              "text": "女",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-91164a91987a",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "距离",
      "wordPosition": 10,
      "hanzi": "距",
      "primary": true,
      "ready": true,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "两处相隔开的那段长度（距离）",
      "description": "形声字，左右结构。左边的“足”本义是包括膝盖和脚在内的整个小腿。右边的“巨”本义是画直角用的曲尺，在这里提示读音。不过我们可以这样联想：一个人拿着这把曲尺，去测量一个人迈了一步的距离，这就是“距”，指两处相隔开的那段长度。在“每隔一段距离”里，指一个大洞和下一个大洞之间相隔的远近。",
      "originalText": "地道里每隔一段距离就有一个大洞，洞顶用木料撑住，很牢靠。",
      "parts": [
        {
          "char": "足",
          "radical": true
        },
        {
          "char": "巨",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "足",
          "description": "“足”是象形字，独体字，本义是包括膝盖和脚在内的整个小腿。甲骨文上面画鼓鼓的膝盖，下面画一只脚。作偏旁时（也写作“⻊”）大多和腿脚、行动有关，比如“跑”“趴”。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "巨",
          "description": "“巨”是会意字，古文字形像一个人手里拿着画直角用的曲尺，本义就是这种曲尺，也就是“矩”字。后来“巨”被借去表示“巨大”的意思，一直用到今天。",
          "charType": "会意字，合体象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f5658-69cb-722b-be29-e1a9233fb0de",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“距”的本义是？",
          "options": [
            {
              "id": "019f5658-69cb-722b-be29-e1a9233fb0de-0",
              "text": "成年人一手持筑杵用力夯筑之意。矩（画直角用的曲尺）",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e1a9233fb0de-1",
              "text": "两处相隔开的那段长度（距离）",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e1a9233fb0de-2",
              "text": "疯狗",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69cb-722b-be29-e5bf8622371d",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“距”是什么结构?",
          "options": [
            {
              "id": "019f5658-69cb-722b-be29-e5bf8622371d-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e5bf8622371d-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e5bf8622371d-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e5bf8622371d-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“距”字的结构吧。"
        },
        {
          "id": "019f5658-69cb-722b-be29-e80a92442da0",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“距”字呢？",
          "options": [
            {
              "id": "019f5658-69cb-722b-be29-e80a92442da0-0",
              "text": "选项 1",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e80a92442da0-1",
              "text": "选项 2",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-e80a92442da0-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“距”的本义是两处相隔开的那段长度（距离）哟。"
        },
        {
          "id": "019f5658-69cb-722b-be29-ecf13ceac638",
          "origin": "识字小测",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“距”的部件。",
          "options": [
            {
              "id": "019f5658-69cb-722b-be29-ecf13ceac638-0",
              "text": "周",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-ecf13ceac638-1",
              "text": "七",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-ecf13ceac638-2",
              "text": "巨",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69cb-722b-be29-ecf13ceac638-3",
              "text": "足",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69cb-722b-be29-f34856737d72",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“距”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f5658-69d3-73fd-9bc2-964e7e38a66e",
          "origin": "拆一拆",
          "kind": "components",
          "questionType": "composition_select_to_text",
          "prompt": "选择“距”的部件。",
          "options": [
            {
              "id": "019f5658-69d3-73fd-9bc2-964e7e38a66e-0",
              "text": "若",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69d3-73fd-9bc2-964e7e38a66e-1",
              "text": "足",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f5658-69d3-73fd-9bc2-964e7e38a66e-2",
              "text": "巨",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69d3-73fd-9bc2-964e7e38a66e-3",
              "text": "曳",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69d3-73fd-9bc2-9b1209e6d758",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“距”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e6-71a2-ac7b-6c599661bdd7",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“距”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e6-71a2-ac7b-6c599661bdd7-0",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-6c599661bdd7-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-6c599661bdd7-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-6c599661bdd7-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab3-75c3-b03d-3fb268fd4ba3",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“距”的部件。",
          "options": [
            {
              "id": "019f1455-aab3-75c3-b03d-3fb268fd4ba3-0",
              "text": "斥",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab3-75c3-b03d-3fb268fd4ba3-1",
              "text": "足",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab3-75c3-b03d-3fb268fd4ba3-2",
              "text": "巨",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab3-75c3-b03d-3fb268fd4ba3-3",
              "text": "长",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-9641b1078ac1",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "距离",
      "wordPosition": 10,
      "hanzi": "离",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "上下结构",
      "originalMeaning": "鸟遭受捕获",
      "description": "会意兼形声字，上下结构，本义是鸟遭受捕获。上边的“鸟”本义是飞禽，这里指一只落网的黄鹂；下边的“网”本义是捕鱼捉鸟兽的网。一只鸟正落在张开的网里，被网捉住，所以“离”的本义是鸟遭受捕获。也指相隔、相距。鸟落网被捉后挣开飞走，就是离去、离开，由离开又引申出两地相隔的意思，在“距离”里“离”就指两处相隔开，和“距”合起来表示相隔的远近。",
      "originalText": "地道里每隔一段距离就有一个大洞，洞顶用木料撑住，很牢靠。",
      "parts": [
        {
          "char": "亠凶",
          "radical": true
        },
        {
          "char": "禸",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "鸟",
          "description": "“鸟”是一个象形字，古文字就像一只长尾巴的小鸟，有尖尖的嘴和羽毛。它的本义就是天上飞的“飞禽”，也就是我们现在说的各种鸟类。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "网",
          "description": "“网”是一个象形字，它的古文字形就像一张张开的渔网。它的本义是指用绳、线结成的、用来捕鱼或捉鸟兽的器具。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e6-71a2-ac7b-5987c9dc431a",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“离”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e6-71a2-ac7b-5987c9dc431a-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-5987c9dc431a-1",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-5987c9dc431a-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-5987c9dc431a-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab1-7046-91e0-712df7aa00c6",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“离”的部件。",
          "options": [
            {
              "id": "019f1455-aab1-7046-91e0-712df7aa00c6-0",
              "text": "艮",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab1-7046-91e0-712df7aa00c6-1",
              "text": "亠凶",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab1-7046-91e0-712df7aa00c6-2",
              "text": "戈",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab1-7046-91e0-712df7aa00c6-3",
              "text": "禸",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-9d71b6fe31c0",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "厕所",
      "wordPosition": 11,
      "hanzi": "厕",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左上包围结构",
      "originalMeaning": "厕所",
      "description": "形声字，左上包围结构，本义是厕所。左上的“厂”本义是山崖，后来也指靠崖搭成、只有一面墙的简易棚屋，这里表示厕所是这样一间遮身的小屋；里面的“则”本义是规则、法则，在这里提示读音。不过我们可以这样联想：厕所常盖在院子侧边、离住处不远又不显眼的角落，就是那么一间靠一面墙遮身的小屋，“则”和“厕”读音相近，就借它来标音。",
      "originalText": "大洞四壁又挖了许多小洞，有的住人，有的拴牲口，有的搁东西，有的作厕所。",
      "parts": [
        {
          "char": "厂",
          "radical": true
        },
        {
          "char": "则",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "厂",
          "description": "“厂”最早的样子像一块突出来的山崖，本义是山崖；后来也表示一种没有墙壁或只有一面墙的简易房屋、棚子，如牲口棚。现在“厂”也指生产加工的地方，如工厂。带“厂”的字常常和山石或像山崖、棚屋这样的高敞建筑有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "则",
          "description": "“则”是会意字，由“贝”和“刂”组成。古文字中它原本是“鼎”和“刀”，表示用刀在鼎上刻写法律条文，所以本义是“规则、法则”。后来“鼎”变成了“贝”，同样有在货币上刻写规范的意思。现在“则”也常用作连词，表示“就”或“却”。",
          "charType": "会意字",
          "children": [
            "贝",
            "刂"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e1-731a-a12d-7a36f617c94b",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“厕”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e1-731a-a12d-7a36f617c94b-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7a36f617c94b-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7a36f617c94b-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-7a36f617c94b-3",
              "text": "半包围结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaab-70a3-bc5f-c8910b409fce",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“厕”的部件。",
          "options": [
            {
              "id": "019f1455-aaab-70a3-bc5f-c8910b409fce-0",
              "text": "厂",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-c8910b409fce-1",
              "text": "勹",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-c8910b409fce-2",
              "text": "则",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-c8910b409fce-3",
              "text": "攵",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-a18181e54a0f",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "厕所",
      "wordPosition": 11,
      "hanzi": "所",
      "primary": true,
      "ready": false,
      "pinyin": "suǒ",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "伐木声",
      "description": "形声字，左右结构，本义是伐木声。左边的“户”本义是单扇门，在这里提示读音；右边的“斤”本义是砍木头的横刃锛斧，表示这个字和用斧头砍木有关。不过我们可以这样联想：用“斤”这把斧头一下下砍木头，会发出“所——所——”的声响，右边的“斤”点出砍木的动作，左边的“户”帮着标音，合起来就记下了这伐木声。也指处所、地方。“所”本义是伐木声，后来人们借用它的读音来表示住所、处所（这是借音，和伐木声的意思没有关系），在“厕所”里“所”就指那间专供人方便的地方。",
      "originalText": "大洞四壁又挖了许多小洞，有的住人，有的拴牲口，有的搁东西，有的作厕所。",
      "parts": [
        {
          "char": "户",
          "radical": true
        },
        {
          "char": "斤",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "户",
          "description": "“户”是象形字，本义是单扇门。字形像一扇单开的门。后来从“一扇门”引申指整个房子的出入口，即“门户”；又因一家人通常住在一个门里，“户”也指人家、家庭，如千家万户。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "斤",
          "description": "“斤”是象形字，独体字。甲骨文的字形像横刃锛斧形，本义是砍木头的横刃锛斧。凡是带“斤”的字，往往跟斧子或用斧子劈开等义有关，如折、斩、新等。后来，“斤”被借用作重量单位，如“一斤”。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e3-766e-ad65-761039c3f351",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“所”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e3-766e-ad65-761039c3f351-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-761039c3f351-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-761039c3f351-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-761039c3f351-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaae-73c9-a3fa-cbaba090603d",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“所”的部件。",
          "options": [
            {
              "id": "019f1455-aaae-73c9-a3fa-cbaba090603d-0",
              "text": "其",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-cbaba090603d-1",
              "text": "舌",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-cbaba090603d-2",
              "text": "斤",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-cbaba090603d-3",
              "text": "户",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-a994523efc60",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "光线",
      "wordPosition": 12,
      "hanzi": "光",
      "primary": true,
      "ready": false,
      "pinyin": "guāng",
      "charType": "会意字",
      "decomposition": "上下结构",
      "originalMeaning": "明亮",
      "description": "会意字，上下结构，本义是明亮。上面的“火”本义是火焰，表示光亮的来源；下面的“人”本义是人，指一个跪坐着的人。古人在人的头顶上方画一团火，就像一个人举着火把、火光照亮四周，所以“光”的本义就是明亮。也指让人能看见东西的那种光。明亮是光照出来的，人们就把能带来明亮、让人看清东西的那种东西也叫作光，在“光线”里指从气孔漏进地道来的光。",
      "originalText": "洞里有通到地面的气孔，从气孔里还能漏下光线来。",
      "parts": [
        {
          "char": "⺌",
          "radical": true
        },
        {
          "char": "兀",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "火",
          "description": "“火”是一个象形字，古人照着向上燃烧的火焰的样子画出来的。它的本义就是“火焰”，也就是东西燃烧时发出的光和热。今天我们说的“火”也还是这个意思。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "人",
          "description": "“人”是一个象形字，它的甲骨文就像一个人侧身站立的形状。它的本义就是指我们人类自己，是能制造工具、会劳动、会说话的高等动物。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e1-731a-a12d-6ef91e5c7f47",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“光”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e1-731a-a12d-6ef91e5c7f47-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-6ef91e5c7f47-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-6ef91e5c7f47-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-6ef91e5c7f47-3",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaa-730d-8f54-fad91b94c4f1",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“光”的部件。",
          "options": [
            {
              "id": "019f1455-aaaa-730d-8f54-fad91b94c4f1-0",
              "text": "⺌",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f54-fad91b94c4f1-1",
              "text": "目",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f54-fad91b94c4f1-2",
              "text": "兀",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f54-fad91b94c4f1-3",
              "text": "虍",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-ae5548b4c970",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "光线",
      "wordPosition": 12,
      "hanzi": "线",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "用丝、棉、麻等制成的细长的东西",
      "description": "形声字，左右结构，本义是用丝、棉、麻等制成的细长的东西。左边的“纟”本义是细丝，表示线是用丝、麻这类材料搓成的；右边的“戋”本义是互相砍杀，杀到最后所剩无几，于是有了细小的意思，在这里提示读音。不过我们可以这样联想：带“戋”的字大多含着“小”的意思，像“浅”是水小、“钱”是碎金、“盏”是小杯；“线”也一样，是又细又小的一根，用“戋”既标了音，又点出它“细”的特点。也指像线一样细长的东西。线本义是又细又长的一根丝物，正因它细长成条，人们就把一切细长如线的东西也叫作线，在“光线”里指从气孔漏下来、又细又长的一道道光。",
      "originalText": "洞里有通到地面的气孔，从气孔里还能漏下光线来。",
      "parts": [
        {
          "char": "纟",
          "radical": true
        },
        {
          "char": "戋",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "纟",
          "description": "“纟”的原形是“系”，作偏旁时写成绞丝旁“纟”。“系”最早是一束丝的样子，是个象形字，本义是细细的丝线。“系”很少出现在别的字里，而是作为偏旁“纟”出现在很多字里，如“丝”“线”“纺”，这些字的意思大多和丝线、纺织有关。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "戋",
          "description": "“戋”作部件，本义是残杀，由两个“戈”（古代长柄横刃的兵器）相向组成，表示互相砍杀；一番厮杀后所剩无几，所以又引申出残余、细小的意思。在“践”里，“戋”作声旁，提示读音。",
          "charType": "会意字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e6-71a2-ac7b-6a4c4ab9f2e4",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“线”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e6-71a2-ac7b-6a4c4ab9f2e4-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-6a4c4ab9f2e4-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-6a4c4ab9f2e4-2",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-6a4c4ab9f2e4-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab2-722a-a2af-14433cd9ad2f",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“线”的部件。",
          "options": [
            {
              "id": "019f1455-aab2-722a-a2af-14433cd9ad2f-0",
              "text": "于",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab2-722a-a2af-14433cd9ad2f-1",
              "text": "戋",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-14433cd9ad2f-2",
              "text": "糸",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-14433cd9ad2f-3",
              "text": "纟",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-bbb11166467a",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "陷坑",
      "wordPosition": 13,
      "hanzi": "坑",
      "primary": true,
      "ready": false,
      "pinyin": "kēng",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "沟壑，洼下去的地方",
      "description": "形声字，左右结构，本义是沟壑、洼下去的地方。左边的“土”本义是泥土、地面，表示坑是在地面泥土上形成的；右边的“亢”本义是撑开双脚的刑具，在这里提示读音。不过我们可以这样联想：挖坑时，铲出来的泥土在旁边堆得高高的（“亢”正有“高”的意思），中间就空出一处向下洼陷的坑，高高的土堆挨着深深的坑，帮我们记住“坑”是地上低下去的地方。",
      "originalText": "有的还在旁边挖一个陷坑，坑里插上尖刀或者埋上地雷，上面用木板虚盖着，板上铺些草，敌人一踏上去就翻下坑里送了命。",
      "parts": [
        {
          "char": "土",
          "radical": true
        },
        {
          "char": "亢",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "土",
          "description": "土是象形字，甲骨文像地上堆积的土块，后来泛指泥土、土地、大地。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "亢",
          "description": "“亢”是指事字，字形像一个人两腿之间被横着的刑具撑开。它的本义是古代一种撑开双脚的刑具，叫作“桎”。现在“亢”常表示高亢、过度等意思。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e2-7739-af2a-093089c8e35d",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“坑”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e2-7739-af2a-093089c8e35d-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-093089c8e35d-1",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-093089c8e35d-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-093089c8e35d-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaac-7418-b6e6-eec359d273b2",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“坑”的部件。",
          "options": [
            {
              "id": "019f1455-aaac-7418-b6e6-eec359d273b2-0",
              "text": "咅",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaac-7418-b6e6-eec359d273b2-1",
              "text": "土",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-eec359d273b2-2",
              "text": "亢",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaac-7418-b6e6-eec359d273b2-3",
              "text": "夌",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-b68b75784d2e",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "陷坑",
      "wordPosition": 13,
      "hanzi": "陷",
      "primary": true,
      "ready": false,
      "pinyin": "xiàn",
      "charType": "会意兼形声字",
      "decomposition": "左右结构",
      "originalMeaning": "掉进，落入，沉下",
      "description": "会意兼形声字，左右结构，本义是掉进、落入、沉下。左边的“阝”本义是高高的土山，表示从高处往下坠；右边的“臽”本义是小坑，字形就像一个人跌进坑里，在这里提示读音、也表意。合起来看，一个人从高处失足，直直跌进下面的深坑，就是“陷”——掉下去、落进去。",
      "originalText": "有的还在旁边挖一个陷坑，坑里插上尖刀或者埋上地雷，上面用木板虚盖着，板上铺些草，敌人一踏上去就翻下坑里送了命。",
      "parts": [
        {
          "char": "阝",
          "radical": true
        },
        {
          "char": "臽",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "阝",
          "description": "“阝”是一个象形字，它的样子就像一层一层高起来的土山。它的本义是“阜”，也就是土山、高地。现在它不单独使用，常作为偏旁出现在字的左边。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "臽",
          "description": "“臽”字上面是“人”，下面是“臼”（坑），像一个人掉进小坑里，本义是小坑。",
          "charType": "会意字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e7-75e9-bbfb-8044c986788d",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“陷”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e7-75e9-bbfb-8044c986788d-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-8044c986788d-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-8044c986788d-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-8044c986788d-3",
              "text": "独体字",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab4-7551-89ef-1b9231790daa",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“陷”的部件。",
          "options": [
            {
              "id": "019f1455-aab4-7551-89ef-1b9231790daa-0",
              "text": "莫",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab4-7551-89ef-1b9231790daa-1",
              "text": "令",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab4-7551-89ef-1b9231790daa-2",
              "text": "阝",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab4-7551-89ef-1b9231790daa-3",
              "text": "臽",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-c55f0d86d613",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "民兵",
      "wordPosition": 14,
      "hanzi": "兵",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "上下结构",
      "originalMeaning": "武器",
      "description": "会意字，上下结构，本义是武器。上面的“斤”本义是砍木头的横刃锛斧，这里代表斧头这类砍杀的工具；下面的“廾”本义是两手捧物，这里就是两只手。两只手举着斧头，正是手持武器的样子，所以“兵”的本义就是武器。楷书里两只手慢慢变成了“八”、斧头变成了“丘”的样子，不过它最初画的确实是双手举斧。也指拿着武器的人，即士兵。武器要有人拿着才能打仗，于是拿武器作战的人就被叫做“兵”；在这里“民兵”指拿着武器保卫家乡的普通百姓，也就是不脱离生产的士兵。",
      "originalText": "在地道里，离出口不远的地方挖几个特别坚固的洞，民兵拿着武器在洞里警戒；拐弯的地方挖一些岔道，叫“迷惑洞”，敌人万一进来了，分不清哪条是死道，哪条是活道。",
      "parts": [
        {
          "char": "丘",
          "radical": true
        },
        {
          "char": "八",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "斤",
          "description": "“斤”是象形字，独体字。甲骨文的字形像横刃锛斧形，本义是砍木头的横刃锛斧。凡是带“斤”的字，往往跟斧子或用斧子劈开等义有关，如折、斩、新等。后来，“斤”被借用作重量单位，如“一斤”。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "廾",
          "description": "“廾”（gǒng）是会意字，像两手相拱，本义为双手捧物。凡是从“廾”取义的字，大多与双手的动作行为有关，如具、奂、弄等。",
          "charType": "会意字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e1-731a-a12d-702a68512e60",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“兵”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e1-731a-a12d-702a68512e60-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-702a68512e60-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-702a68512e60-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e1-731a-a12d-702a68512e60-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaa-730d-8f54-fc675ff55fea",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“兵”的部件。",
          "options": [
            {
              "id": "019f1455-aaaa-730d-8f54-fc675ff55fea-0",
              "text": "丘",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f54-fc675ff55fea-1",
              "text": "头",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f54-fc675ff55fea-2",
              "text": "八",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f54-fc675ff55fea-3",
              "text": "由",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-c23c4186d00d",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "民兵",
      "wordPosition": 14,
      "hanzi": "民",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "独体字",
      "originalMeaning": "奴隶",
      "description": "象形字，独体字，本义是奴隶。金文的“民”画的是一只眼睛被尖锐的东西刺中的样子。古代打仗抓到俘虏，常把他一只眼睛刺瞎，留下来当奴隶干活，所以“民”最初指的就是奴隶。也指百姓。奴隶是社会最底层、受人管束的一群人，后来把所有受管束的普通人都叫做“民”，也就是百姓；在这里“民兵”指由普通百姓组成、拿起武器保卫家乡的人。",
      "originalText": "在地道里，离出口不远的地方挖几个特别坚固的洞，民兵拿着武器在洞里警戒；拐弯的地方挖一些岔道，叫“迷惑洞”，敌人万一进来了，分不清哪条是死道，哪条是活道。",
      "parts": [
        {
          "char": "民",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-1ebf30a7e36d",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“民”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-1ebf30a7e36d-0",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-1ebf30a7e36d-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-1ebf30a7e36d-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-1ebf30a7e36d-3",
              "text": "上下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab0-751a-bfbc-4bb97ca1e6a8",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“民”的部件。",
          "options": [
            {
              "id": "019f1455-aab0-751a-bfbc-4bb97ca1e6a8-0",
              "text": "民",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab0-751a-bfbc-4bb97ca1e6a8-1",
              "text": "穴",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab0-751a-bfbc-4bb97ca1e6a8-2",
              "text": "见",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab0-751a-bfbc-4bb97ca1e6a8-3",
              "text": "卒",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-cd205d47bd00",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "拐弯",
      "wordPosition": 15,
      "hanzi": "拐",
      "primary": true,
      "ready": false,
      "pinyin": "guǎi",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "拐棍",
      "description": "形声字，左右结构，本义是拐棍。左边的“扌”本义是手，表示拐棍是拿在手里、拄着走路的；右边的“另”本义是剔治卜骨，在这里提示读音。不过我们可以这样联想：人上了年纪、腿脚不便，两条腿不够用，就另外拿一根棍子当“第三条腿”拄着走路，这根另加的棍子就是拐棍。也指转变方向、转过弯。拐棍上端多弯折成一个角，由这“折出一个角”的样子引申出改变方向、转过一个角的意思；在这里“拐弯”就是在地道里转过弯、改变前进的方向。",
      "originalText": "在地道里，离出口不远的地方挖几个特别坚固的洞，民兵拿着武器在洞里警戒；拐弯的地方挖一些岔道，叫“迷惑洞”，敌人万一进来了，分不清哪条是死道，哪条是活道。",
      "parts": [
        {
          "char": "扌",
          "radical": true
        },
        {
          "char": "另",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "扌",
          "description": "“扌”就是“手”字做偏旁时的写法（提手旁）。古文字的“手”像画了一只张开五指的手掌。当“扌”出现在字的左边时，通常表示这个字的意思和手或手的动作有关，如打、抓、抱。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "另",
          "description": "“另”是一个象形字，字形像一块被切去一角的牛肩胛骨。它的本义是“剔治卜骨”，也就是整治占卜用的骨头。现在“另”主要表示“另外”的意思。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e4-70da-a1f1-307a894e395e",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“拐”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-307a894e395e-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-307a894e395e-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-307a894e395e-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-307a894e395e-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaae-73c9-a3fa-d327462dcf08",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“拐”的部件。",
          "options": [
            {
              "id": "019f1455-aaae-73c9-a3fa-d327462dcf08-0",
              "text": "另",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-d327462dcf08-1",
              "text": "虫",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-d327462dcf08-2",
              "text": "丬",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-d327462dcf08-3",
              "text": "扌",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-d0e0bd57a9cc",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "拐弯",
      "wordPosition": 15,
      "hanzi": "弯",
      "primary": true,
      "ready": false,
      "pinyin": "wān",
      "charType": "会意兼形声字",
      "decomposition": "上下结构",
      "originalMeaning": "拉开弓",
      "description": "形声字，上下结构，本义是拉开弓。弯的繁体写作“彎”，下面的“弓”本义是射箭的弓，表示弯和弓有关；上面的“䜌”在这里提示读音。合起来就是手持弓、拉开弦搭上箭，所以本义是拉开弓。简化成“弯”以后，繁体的上半部分写成了记号“亦”，下面仍旧是“弓”。不过我们可以这样联想：“亦”本义是腋窝，胳膊往里一收，腋下就折拢弯起，腋窝正是身上很容易弯折的地方，帮我们记住“弯”就是弯曲不直。也指弯折、转弯。拉开弓时弓身被拉成弯弧，由这弓身弯曲的特征引申出弯折、转弯；在这里“拐弯”指地道不是直的、要转过弯的地方。",
      "originalText": "在地道里，离出口不远的地方挖几个特别坚固的洞，民兵拿着武器在洞里警戒；拐弯的地方挖一些岔道，叫“迷惑洞”，敌人万一进来了，分不清哪条是死道，哪条是活道。",
      "parts": [
        {
          "char": "亦",
          "radical": true
        },
        {
          "char": "弓",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "亦",
          "description": "亦是指事字，甲骨文在正面站立的人（大）的腋窝位置加了两点，指出腋窝的所在，本义是腋窝。现代常用来表示“也”的意思。",
          "charType": "指事字",
          "children": []
        },
        {
          "char": "弓",
          "description": "“弓”是象形字，字形就像一把弯曲的弓，本义就是射箭或发射弹丸的工具。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e3-766e-ad65-6da5a82cd107",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“弯”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e3-766e-ad65-6da5a82cd107-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6da5a82cd107-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6da5a82cd107-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e3-766e-ad65-6da5a82cd107-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaad-724a-a0b5-d71f07264915",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“弯”的部件。",
          "options": [
            {
              "id": "019f1455-aaad-724a-a0b5-d71f07264915-0",
              "text": "吉",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-d71f07264915-1",
              "text": "弓",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-d71f07264915-2",
              "text": "韦",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-d71f07264915-3",
              "text": "亦",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-df6209bfc900",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "木棒",
      "wordPosition": 16,
      "hanzi": "棒",
      "primary": true,
      "ready": false,
      "pinyin": "bàng",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "棍子",
      "description": "形声字，左右结构，本义是棍子。左边的“木”本义是树，表示棍子是用木头做的；右边的“奉”本义是双手捧着东西祭献，在这里提示读音。不过我们可以这样联想：舂米、捣药用的木杵就是一根粗木棒，要双手捧握着一下一下地舂捣，正像“奉”两手捧持的样子，捧在手里干活的这根木头就是棒。",
      "originalText": "只要一个人拿一根木棒，就可以把“孑口”守住，真是“一夫当关，万夫莫开”。",
      "parts": [
        {
          "char": "木",
          "radical": true
        },
        {
          "char": "奉",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "木",
          "description": "“木”是象形字，字形就像一棵有枝干、有树根的大树，本义就是树。现在也常用来指木头。",
          "charType": "象形",
          "children": []
        },
        {
          "char": "奉",
          "description": "“奉”是一个会意字，字形像两只手捧着禾苗献给祖先，本义是“捧禾祭献神祖”。它最初就是“捧”字，表示双手恭敬地捧着东西。",
          "charType": "会意字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e4-70da-a1f1-403232100db7",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“棒”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-403232100db7-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-403232100db7-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-403232100db7-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-403232100db7-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaf-71b4-bc87-c7a654afa0d1",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“棒”的部件。",
          "options": [
            {
              "id": "019f1455-aaaf-71b4-bc87-c7a654afa0d1-0",
              "text": "子",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-c7a654afa0d1-1",
              "text": "奉",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-c7a654afa0d1-2",
              "text": "果",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-c7a654afa0d1-3",
              "text": "木",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-daf4204fc6b4",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "木棒",
      "wordPosition": 16,
      "hanzi": "木",
      "primary": true,
      "ready": true,
      "pinyin": "mù",
      "charType": "象形",
      "decomposition": "独体字",
      "originalMeaning": "树",
      "description": "象形字，独体字，本义是树。甲骨文就是画出一棵树的轮廓，上面伸出的是枝叶，中间一竖是树干，下面分开的是树根，所以“木”指的就是树木。也指木头、木料。树砍倒后去掉枝叶、锯成材料，就成了木头；在这里“木棒”就是用木头做成的棒子。",
      "originalText": "只要一个人拿一根木棒，就可以把“孑口”守住，真是“一夫当关，万夫莫开”。",
      "parts": [
        {
          "char": "木",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f5658-69ca-717d-8e76-f035a5e2de1e",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "“木”的本义是？",
          "options": [
            {
              "id": "019f5658-69ca-717d-8e76-f035a5e2de1e-0",
              "text": "兽蹄印",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f035a5e2de1e-1",
              "text": "用泥土修筑、高而平坦的建筑，也就是高台",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f035a5e2de1e-2",
              "text": "树",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f5658-69ca-717d-8e76-f421cfd9e92f",
          "origin": "识字小测",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“木”是什么结构?",
          "options": [
            {
              "id": "019f5658-69ca-717d-8e76-f421cfd9e92f-0",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f421cfd9e92f-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f421cfd9e92f-2",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f421cfd9e92f-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "让我们来看看“木”字的结构吧。"
        },
        {
          "id": "019f5658-69ca-717d-8e76-f8a3f1e51568",
          "origin": "识字小测",
          "kind": "single",
          "questionType": "image_single_select",
          "prompt": "下面哪个图片最能代表“木”字呢？",
          "options": [
            {
              "id": "019f5658-69ca-717d-8e76-f8a3f1e51568-0",
              "text": "选项 1",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f8a3f1e51568-1",
              "text": "选项 2",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f5658-69ca-717d-8e76-f8a3f1e51568-2",
              "text": "选项 3",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": "“木”的本义是树哟。"
        },
        {
          "id": "019f5658-69ca-717d-8e76-ffe3b18edd54",
          "origin": "识字小测",
          "kind": "write",
          "questionType": "write_full_word",
          "prompt": "让我们来写写“木”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f5658-69d2-7005-8cd0-ec881ed203e7",
          "origin": "拆一拆",
          "kind": "write",
          "questionType": "write_full_word_empty",
          "prompt": "让我们来写写“木”字吧。",
          "options": [],
          "explanation": ""
        },
        {
          "id": "019f1453-00e4-70da-a1f1-3f48ad5c9387",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“木”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-3f48ad5c9387-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-3f48ad5c9387-1",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-3f48ad5c9387-2",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-3f48ad5c9387-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaf-71b4-bc87-c195c6f9ebf3",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“木”的部件。",
          "options": [
            {
              "id": "019f1455-aaaf-71b4-bc87-c195c6f9ebf3-0",
              "text": "厶",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-c195c6f9ebf3-1",
              "text": "木",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-c195c6f9ebf3-2",
              "text": "采",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-c195c6f9ebf3-3",
              "text": "亢",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-e9594325cd7d",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "破坏",
      "wordPosition": 17,
      "hanzi": "坏",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "只有一重的山丘，也指没有烧过的砖瓦、陶器",
      "description": "形声字，左右结构，本义是只有一重的山丘，也指没有烧过的砖瓦、陶器。左边的“土”表示这个字跟泥土有关；右边的“不”本义是花萼之柎，在这里提示读音。不过我们可以这样联想：“不”现在常用来表示否定，没烧过的砖瓦、陶器还“不”是成品、“不”能盛水装物，只是刚用泥捏好、还没进窑火烧的坯子，用“不”帮我们记住这是尚未烧成的坯。（“坏”今天当“不好、破坏”讲，是借去当“壤”的简化字，和它本来的意思无关。）在 破坏 里，坏 用的是它借作“壤”简化字后的毁坏义，指把地道毁掉、使它无法再用。",
      "originalText": "敌人尝到了地道的厉害，想方设法来破坏，什么火攻啊，水攻啊，毒气攻啊，都用遍了。",
      "parts": [
        {
          "char": "土",
          "radical": true
        },
        {
          "char": "不",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "土",
          "description": "土是象形字，甲骨文像地上堆积的土块，后来泛指泥土、土地、大地。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "不",
          "description": "“不”最早的样子像一朵花倒过来的花托，这是它的本义。后来人们主要用它表示“没有”或“不是”这样的否定意思，如不好、不要。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e2-7739-af2a-07545c018de3",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“坏”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e2-7739-af2a-07545c018de3-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-07545c018de3-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-07545c018de3-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-07545c018de3-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaab-70a3-bc5f-d0057bcdede4",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“坏”的部件。",
          "options": [
            {
              "id": "019f1455-aaab-70a3-bc5f-d0057bcdede4-0",
              "text": "不",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-d0057bcdede4-1",
              "text": "土",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-d0057bcdede4-2",
              "text": "雨",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaab-70a3-bc5f-d0057bcdede4-3",
              "text": "林",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-e6c76bcae511",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "破坏",
      "wordPosition": 17,
      "hanzi": "破",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "石头碎裂，不完整",
      "description": "形声兼会意字，左右结构，本义是石头碎裂、不完整。左边的“石”本义是岩石，表示破跟石头有关；右边的“皮”本义是剥取兽皮，在这里提示读音、也表意——剥皮就是把皮从兽身上撕扯下来，带着撕裂的意思。石头被撕扯、砸开而裂成一块块，就是碎裂、不完整，所以“破”的本义是石头碎裂。也指使东西损坏、残破。完整的石头被砸裂成一块块就残缺不全，“破”于是泛指把完整的东西弄坏、损毁，在 破坏 里指敌人千方百计地损毁地道。",
      "originalText": "敌人尝到了地道的厉害，想方设法来破坏，什么火攻啊，水攻啊，毒气攻啊，都用遍了。",
      "parts": [
        {
          "char": "石",
          "radical": true
        },
        {
          "char": "皮",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "石",
          "description": "“石”是一个象形字，古人画了一座山崖，下面再画一块石头，用这个画面来表示“岩石”的意思。它的本义就是岩石，现在也常用来指各种各样的石头。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "皮",
          "description": "皮是象形字，字形像一只手拿着工具剥取兽皮，本义就是剥取兽皮。后来引申指物体的表面，就像兽皮是动物的表面一样。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e5-7269-b6ed-2c5da0251412",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“破”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e5-7269-b6ed-2c5da0251412-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-2c5da0251412-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-2c5da0251412-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e5-7269-b6ed-2c5da0251412-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab1-7046-91e0-6783c8c2d277",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“破”的部件。",
          "options": [
            {
              "id": "019f1455-aab1-7046-91e0-6783c8c2d277-0",
              "text": "风",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab1-7046-91e0-6783c8c2d277-1",
              "text": "石",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab1-7046-91e0-6783c8c2d277-2",
              "text": "比",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab1-7046-91e0-6783c8c2d277-3",
              "text": "皮",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-f16720ed784f",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "对付",
      "wordPosition": 18,
      "hanzi": "对",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "高举显扬",
      "description": "会意字，左右结构，本义是高举显扬。繁体写作“對”，左边像一种带齿的仪仗，右边的“寸”是手，合起来就是用手把仪仗高高举起，用来显扬、夸耀功劳。简体“对”由“又”和“寸”组成，“又”是右手、“寸”也和手有关，两只手一左一右相向摆开，可以联想到彼此相对、一一对应，所以“对”后来常用来表示相对、正确、回答等意思。也指抵抗、对付。相对、面对面本就带着彼此相抗的意味，于是“对”又指面对并抵挡对方，即抵抗、对付，在这里 对付 指人们想方设法去应付、抵挡敌人的水攻。",
      "originalText": "对付水攻的法子更妙了，把地道跟枯井暗沟连接起来，敌人放水的时候，水从洞口进来，就流到枯井暗沟里去了。",
      "parts": [
        {
          "char": "又",
          "radical": true
        },
        {
          "char": "寸",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "又",
          "description": "又是象形字，样子像一只右手，本义就是右手。后来常用来表示重复、再次的意思，比如又来了、又大又圆。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "寸",
          "description": "“寸”是指事字，独体字，本义是寸口、寸脉（位于手腕外侧、离手腕横纹约一拇指宽的动脉处）。甲骨文的字形是一只手，上面的“一”是指事符号，专门标出寸口所在。因为这里距离手腕横纹正好一寸，所以“寸”后来用作长度单位——十分为一寸。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e2-7739-af2a-117f8a79cd71",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“对”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e2-7739-af2a-117f8a79cd71-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-117f8a79cd71-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-117f8a79cd71-2",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-117f8a79cd71-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaac-7418-b6e6-f67da2574b66",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“对”的部件。",
          "options": [
            {
              "id": "019f1455-aaac-7418-b6e6-f67da2574b66-0",
              "text": "寸",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaac-7418-b6e6-f67da2574b66-1",
              "text": "又",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-f67da2574b66-2",
              "text": "辛",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaac-7418-b6e6-f67da2574b66-3",
              "text": "北",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-f75a091eff54",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "对付",
      "wordPosition": 18,
      "hanzi": "付",
      "primary": true,
      "ready": false,
      "pinyin": "fù",
      "charType": "会意字",
      "decomposition": "左右结构",
      "originalMeaning": "交给",
      "description": "会意字，左右结构，本义是交给。左边的“亻”本义是人，表示交给的对象是人；右边的“寸”本义是寸口，古文字里“寸”由“手”加一个指事符号变来，在这里表示手。人用手拿东西交给别人，所以“付”是交给的意思。交给是主动拿东西送到对方手里，由“拿东西给对方”引申出“拿出办法去应对、招架”，在这里“对付”就指人们想法子应付、抵挡敌人。",
      "originalText": "对付水攻的法子更妙了，把地道跟枯井暗沟连接起来，敌人放水的时候，水从洞口进来，就流到枯井暗沟里去了。",
      "parts": [
        {
          "char": "亻",
          "radical": true
        },
        {
          "char": "寸",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "亻",
          "description": "亻，“人”的偏旁变体。“人”是象形字，独体字，甲骨文像一个侧身站立的人，本义指人。凡是带“人”（亻）的字往往跟人有关，如众、信。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "寸",
          "description": "“寸”是指事字，独体字，本义是寸口、寸脉（位于手腕外侧、离手腕横纹约一拇指宽的动脉处）。甲骨文的字形是一只手，上面的“一”是指事符号，专门标出寸口所在。因为这里距离手腕横纹正好一寸，所以“寸”后来用作长度单位——十分为一寸。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e0-75c9-a876-bdbb6478d338",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“付”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e0-75c9-a876-bdbb6478d338-0",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-bdbb6478d338-1",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-bdbb6478d338-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e0-75c9-a876-bdbb6478d338-3",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaa-730d-8f54-f42829eadcdd",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“付”的部件。",
          "options": [
            {
              "id": "019f1455-aaaa-730d-8f54-f42829eadcdd-0",
              "text": "亻",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f54-f42829eadcdd-1",
              "text": "巾",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaa-730d-8f54-f42829eadcdd-2",
              "text": "乂",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaa-730d-8f54-f42829eadcdd-3",
              "text": "寸",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-002d84e37553",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "铜铃",
      "wordPosition": 19,
      "hanzi": "铃",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "铃铛",
      "description": "会意兼形声字，左右结构，本义是铃铛。左边的“钅”本义是铜、也泛指金属，表示铃铛是用金属做的；右边的“令”本义是上级向下发出指示，在这里提示读音、也表意：古人常摇铃来发号令、提醒众人，铃声就像在传令，所以“令”点出了铃能让人听到、传递信号的用处。合起来就是一种金属做的、摇动能发声提醒人的小响器，也就是铃铛。",
      "originalText": "地道里面可就用“有线电”了，一根铁丝牵住一个小铜铃，这儿一拉，那儿就响，拉几下表示什么意思是早就约好了的。",
      "parts": [
        {
          "char": "钅",
          "radical": true
        },
        {
          "char": "令",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "钅",
          "description": "钅是金的偏旁变体。“金”是象形兼会意兼形声字，上下结构，本义是铜，后来泛指金属。作偏旁写成“钅”（金字旁），带“钅”的字大多和金属有关。",
          "charType": "象形字，会意字，形声字",
          "children": []
        },
        {
          "char": "令",
          "description": "“令”是会意字，上面是“亼”，像扣合的盖子，代表发令的人；下面是“卩”，像跪坐的人，代表听令的人。合起来表示上级向下发出指示，本义是“命令”。",
          "charType": "会意字",
          "children": [
            "亼",
            "卩"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e7-75e9-bbfb-716dc9645c5e",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“铃”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e7-75e9-bbfb-716dc9645c5e-0",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-716dc9645c5e-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-716dc9645c5e-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-716dc9645c5e-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab3-75c3-b03d-425aa0754d2f",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“铃”的部件。",
          "options": [
            {
              "id": "019f1455-aab3-75c3-b03d-425aa0754d2f-0",
              "text": "斥",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab3-75c3-b03d-425aa0754d2f-1",
              "text": "生",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aab3-75c3-b03d-425aa0754d2f-2",
              "text": "令",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab3-75c3-b03d-425aa0754d2f-3",
              "text": "钅",
              "correct": true,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966c-ff53436cf547",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "铜铃",
      "wordPosition": 19,
      "hanzi": "铜",
      "primary": true,
      "ready": false,
      "pinyin": "",
      "charType": "",
      "decomposition": "左右结构",
      "originalMeaning": "赤金",
      "description": "形声字，左右结构，本义是赤金，也就是铜这种金属。左边的“钅”本义是铜、也泛指金属，表示铜是一种金属；右边的“同”本义是聚合众人之力，在这里提示读音。不过我们可以这样联想：古人把铜和锡一同放进熔炉，合到一处熔铸成青铜器，“同”正是把东西合到一处的意思，让人想到铜常和别的金属合在一起。",
      "originalText": "地道里面可就用“有线电”了，一根铁丝牵住一个小铜铃，这儿一拉，那儿就响，拉几下表示什么意思是早就约好了的。",
      "parts": [
        {
          "char": "钅",
          "radical": true
        },
        {
          "char": "同",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "钅",
          "description": "钅是金的偏旁变体。“金”是象形兼会意兼形声字，上下结构，本义是铜，后来泛指金属。作偏旁写成“钅”（金字旁），带“钅”的字大多和金属有关。",
          "charType": "象形字，会意字，形声字",
          "children": []
        },
        {
          "char": "同",
          "description": "“同”是一个会意字，由“凡”和“口”组成。“凡”的古字形像盘子，这里表示要抬的重物，“口”像嘴巴，表示喊出的号子。它的本义是聚合众人之力，就像大家一起抬东西时喊号子把力气合到一处。现在“同”常用来表示“相同”或“一起”。",
          "charType": "会意字",
          "children": [
            "凡",
            "口"
          ]
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e7-75e9-bbfb-7471f78d8e62",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“铜”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e7-75e9-bbfb-7471f78d8e62-0",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-7471f78d8e62-1",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-7471f78d8e62-2",
              "text": "左右结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e7-75e9-bbfb-7471f78d8e62-3",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab3-75c3-b03d-466de9828508",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“铜”的部件。",
          "options": [
            {
              "id": "019f1455-aab3-75c3-b03d-466de9828508-0",
              "text": "玉",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab3-75c3-b03d-466de9828508-1",
              "text": "同",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab3-75c3-b03d-466de9828508-2",
              "text": "钅",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab3-75c3-b03d-466de9828508-3",
              "text": "各",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-15d9bb6f7bbb",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "无穷无尽",
      "wordPosition": 20,
      "hanzi": "尽",
      "primary": true,
      "ready": false,
      "pinyin": "jǐn",
      "charType": "会意字",
      "decomposition": "上下结构",
      "originalMeaning": "器皿中空",
      "description": "象形字，会意字，形声字，上下结构，本义是器皿中空。尽的繁体写作“盡”，下面是“皿”，也就是盛东西的器皿，上面像一只手拿着刷子在刷洗器皿，表示里面的饭菜已经吃光、正在涤洗，器皿空了。简体“尽”上面是“尺”、下面是两点“⺀”，我们可以这样联想：“尺”是量长度的工具，量东西时一直量到最末端，下面的两点就像量到头的终点记号，量到这里就到头了，所以“尽”表示完毕、到尽头。在“无穷无尽”里，“尽”指穷尽、用完。",
      "originalText": "为了打击敌人，什么办法都想出来了，人民的智慧是无穷无尽的。",
      "parts": [
        {
          "char": "尺",
          "radical": true
        },
        {
          "char": "⺀",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "尺",
          "description": "“尺”是一个指事字，它的本义是“尺子”，也就是古代用来量长度的工具。古人用身体当尺子，在“人”字的小臂或小腿旁加上一个点，指出从那里到手腕或脚踝大约就是“一尺”。后来字形慢慢变成了“尸”和“乙”，但意思还是指这个长度单位。",
          "charType": "指事字",
          "children": []
        },
        {
          "char": "⺀",
          "charType": "",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e2-7739-af2a-18aeeda7dbce",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“尽”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e2-7739-af2a-18aeeda7dbce-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-18aeeda7dbce-1",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-18aeeda7dbce-2",
              "text": "独体字",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e2-7739-af2a-18aeeda7dbce-3",
              "text": "左右结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaad-724a-a0b5-c5c472f0260f",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“尽”的部件。",
          "options": [
            {
              "id": "019f1455-aaad-724a-a0b5-c5c472f0260f-0",
              "text": "尺",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaad-724a-a0b5-c5c472f0260f-1",
              "text": "⺀",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaad-724a-a0b5-c5c472f0260f-2",
              "text": "士",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaad-724a-a0b5-c5c472f0260f-3",
              "text": "吉",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-0fdf6f782463",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "无穷无尽",
      "wordPosition": 20,
      "hanzi": "穷",
      "primary": true,
      "ready": false,
      "pinyin": "qióng",
      "charType": "形声字",
      "decomposition": "上下结构",
      "originalMeaning": "达到尽头",
      "description": "会意兼形声字，上下结构，本义是达到尽头。穷的繁体写作“窮”，由“穴”和“躬”组成，“穴”是洞穴，“躬”是弯着的身体，合起来就是人弯身钻进洞穴，一直钻到最深、再也走不动的尽头。简体“穷”由“穴”和“力”组成，“穴”是洞穴，“力”是力气，我们可以这样联想：一个人钻进洞穴，一直往深处使劲，力气用到头、洞也到了尽头，再也走不动，所以“穷”本义是达到尽头，又引申出走投无路、贫困、困窘的意思。",
      "originalText": "为了打击敌人，什么办法都想出来了，人民的智慧是无穷无尽的。",
      "parts": [
        {
          "char": "穴",
          "radical": true
        },
        {
          "char": "力",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "穴",
          "description": "“穴”是象形字，上下结构。甲骨文的字形像挖地建造的供居住用的洞穴，本义是地室。带“穴”的字往往跟洞窟有关，如究、穷。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "力",
          "description": "力是象形字，最早画的是耕地用的农具耒的样子，因为用农具干活要使劲，后来就引申出力气、力量的意思。",
          "charType": "象形字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e6-71a2-ac7b-5d89cb04359f",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“穷”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e6-71a2-ac7b-5d89cb04359f-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-5d89cb04359f-1",
              "text": "半包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-5d89cb04359f-2",
              "text": "上下结构",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e6-71a2-ac7b-5d89cb04359f-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aab2-722a-a2af-09490ac20f24",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“穷”的部件。",
          "options": [
            {
              "id": "019f1455-aab2-722a-a2af-09490ac20f24-0",
              "text": "力",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-09490ac20f24-1",
              "text": "冗",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aab2-722a-a2af-09490ac20f24-2",
              "text": "穴",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aab2-722a-a2af-09490ac20f24-3",
              "text": "石",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-0882757b1f54",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "无穷无尽",
      "wordPosition": 20,
      "hanzi": "无",
      "primary": true,
      "ready": false,
      "pinyin": "wú",
      "charType": "象形字",
      "decomposition": "上下结构",
      "originalMeaning": "舞蹈",
      "description": "象形字，上下结构，本义是舞蹈。甲骨文像一个人两手拿着舞具、举手投足跳舞的样子，字就照着这个样子画出来。后来“无”被借去写“没有”，这个借来的意思用得最多，就成了今天的常用义。在“无穷无尽”里，“无”用的是借来的“没有”义，与“有”相对，指没有穷尽。",
      "originalText": "为了打击敌人，什么办法都想出来了，人民的智慧是无穷无尽的。",
      "parts": [
        {
          "char": "无",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e4-70da-a1f1-342586ce996b",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“无”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaf-71b4-bc87-bb03790696cc",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“无”的部件。",
          "options": [
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-0",
              "text": "亦",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-1",
              "text": "无",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-2",
              "text": "米",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-3",
              "text": "斤",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-100abc0d94fb",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "无穷无尽",
      "wordPosition": 20,
      "hanzi": "无",
      "primary": false,
      "ready": false,
      "pinyin": "wú",
      "charType": "象形字",
      "decomposition": "上下结构",
      "originalMeaning": "舞蹈",
      "description": "象形字，上下结构，本义是舞蹈。甲骨文像一个人两手拿着舞具、举手投足跳舞的样子，字就照着这个样子画出来。后来“无”被借去写“没有”，这个借来的意思用得最多，就成了今天的常用义。在“无穷无尽”里，“无”用的是借来的“没有”义，与“有”相对，指没有穷尽。",
      "originalText": "为了打击敌人，什么办法都想出来了，人民的智慧是无穷无尽的。",
      "parts": [
        {
          "char": "无",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e4-70da-a1f1-342586ce996b",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“无”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-0",
              "text": "上下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-2",
              "text": "左右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-342586ce996b-3",
              "text": "独体字",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaf-71b4-bc87-bb03790696cc",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“无”的部件。",
          "options": [
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-0",
              "text": "亦",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-1",
              "text": "无",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-2",
              "text": "米",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bb03790696cc-3",
              "text": "斤",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-1cbd3a593fc0",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "抗日",
      "wordPosition": 21,
      "hanzi": "抗",
      "primary": true,
      "ready": false,
      "pinyin": "kàng",
      "charType": "形声字",
      "decomposition": "左右结构",
      "originalMeaning": "抵御，抵挡",
      "description": "会意字，形声字，左右结构，本义是抵御，抵挡。左边的“扌”本义是手掌，表示抵御、抵挡要用手去做；右边的“亢”本义是撑在两脚之间的刑具，能把两脚牢牢撑开，有撑住、抗拒的意思，在这里提示读音、也表意。两个部件合起来，就是用手撑住、顶住外来的力量，也就是抵御、抵挡。",
      "originalText": "冀中平原上的人民不但坚持了生产，还有力地打击了敌人，在我国抗日战争史上留下了惊人的奇迹。",
      "parts": [
        {
          "char": "扌",
          "radical": true
        },
        {
          "char": "亢",
          "radical": false
        }
      ],
      "compositions": [
        {
          "char": "扌",
          "description": "“扌”就是“手”字做偏旁时的写法（提手旁）。古文字的“手”像画了一只张开五指的手掌。当“扌”出现在字的左边时，通常表示这个字的意思和手或手的动作有关，如打、抓、抱。",
          "charType": "象形字",
          "children": []
        },
        {
          "char": "亢",
          "description": "“亢”是指事字，字形像一个人两腿之间被横着的刑具撑开。它的本义是古代一种撑开双脚的刑具，叫作“桎”。现在“亢”常表示高亢、过度等意思。",
          "charType": "指事字",
          "children": []
        }
      ],
      "exercises": [
        {
          "id": "019f1453-00e4-70da-a1f1-2eeffdf13103",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“抗”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-2eeffdf13103-0",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-2eeffdf13103-1",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-2eeffdf13103-2",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-2eeffdf13103-3",
              "text": "左右结构",
              "correct": true,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaae-73c9-a3fa-cca1580e2004",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“抗”的部件。",
          "options": [
            {
              "id": "019f1455-aaae-73c9-a3fa-cca1580e2004-0",
              "text": "亢",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-cca1580e2004-1",
              "text": "上",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-cca1580e2004-2",
              "text": "扌",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaae-73c9-a3fa-cca1580e2004-3",
              "text": "寺",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        }
      ]
    },
    {
      "id": "019f0554-ea22-762e-966d-21e44861f3a8",
      "lessonId": "019f0523-819f-7702-89a2-7cf5002b615d",
      "lessonTitle": "冀中的地道战",
      "lessonPosition": 4,
      "word": "抗日",
      "wordPosition": 21,
      "hanzi": "日",
      "primary": true,
      "ready": false,
      "pinyin": "rì",
      "charType": "象形字",
      "decomposition": "独体字",
      "originalMeaning": "太阳",
      "description": "象形字，独体字，本义是太阳。古人照着太阳的样子画了一个圆圈，又怕它和普通的圆圈混淆，就在中间加了一点或一横，表示太阳饱满、充满光芒。后来为了书写方便，圆圆的轮廓慢慢变成了方形，就成了今天的“日”字。在这里“日”指日本。日本在东方，是太阳升起的地方，国名有“日出之国”的意思，所以简称“日”，抗日就是抵抗日本侵略者。",
      "originalText": "冀中平原上的人民不但坚持了生产，还有力地打击了敌人，在我国抗日战争史上留下了惊人的奇迹。",
      "parts": [
        {
          "char": "日",
          "radical": true
        }
      ],
      "compositions": [],
      "exercises": [
        {
          "id": "019f1453-00e4-70da-a1f1-38ec588bc4c4",
          "origin": "间架结构",
          "kind": "structure",
          "questionType": "character_structure_select",
          "prompt": "“日”是什么结构?",
          "options": [
            {
              "id": "019f1453-00e4-70da-a1f1-38ec588bc4c4-0",
              "text": "左中右结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-38ec588bc4c4-1",
              "text": "上中下结构",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-38ec588bc4c4-2",
              "text": "独体字",
              "correct": true,
              "radical": false
            },
            {
              "id": "019f1453-00e4-70da-a1f1-38ec588bc4c4-3",
              "text": "全包围结构",
              "correct": false,
              "radical": false
            }
          ],
          "explanation": ""
        },
        {
          "id": "019f1455-aaaf-71b4-bc87-bcfd9146d21b",
          "origin": "红蓝字",
          "kind": "components",
          "questionType": "honglan_select_to_text",
          "prompt": "选择“日”的部件。",
          "options": [
            {
              "id": "019f1455-aaaf-71b4-bc87-bcfd9146d21b-0",
              "text": "龙",
              "correct": false,
              "radical": false
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bcfd9146d21b-1",
              "text": "日",
              "correct": true,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bcfd9146d21b-2",
              "text": "兰",
              "correct": false,
              "radical": true
            },
            {
              "id": "019f1455-aaaf-71b4-bc87-bcfd9146d21b-3",
              "text": "矢",
              "correct": false,
              "radical": true
            }
          ],
          "explanation": ""
        }
      ]
    }
  ],
  "components": [
    {
      "id": "019f1c14-f83b-725a-823a-06ea5c814758",
      "title": "宝盖",
      "glyph": "宀",
      "examples": [
        "安",
        "牢",
        "蓉",
        "蛇"
      ],
      "description": "“宀”是象形字，古时候的“宀”字就像一间房屋的样子。“宀”的本义就是房屋。",
      "characterSet": [],
      "group": 12,
      "sequence": 13
    },
    {
      "id": "019f1c14-f83b-725a-823a-0d4b8b47d5e0",
      "title": "贝",
      "glyph": "贝",
      "examples": [
        "坝",
        "员",
        "婴",
        "贏"
      ],
      "description": "“贝”是象形字，甲骨文的字形像贝壳。“贝”的本义就是有硬壳的软体动物（像蛤蜊、海螺）的总称，古人还曾经用贝壳当钱用。",
      "characterSet": [
        "贵",
        "赏"
      ],
      "group": 14,
      "sequence": 15
    },
    {
      "id": "019f1c14-f83b-725a-823a-3ffab92fa255",
      "title": "卜",
      "glyph": "卜",
      "examples": [
        "卦",
        "处",
        "盐"
      ],
      "description": "“卜”是象形字。商朝人信鬼神，遇到大事都要占卜，甲骨文就像占卜时龟甲被火烧后裂开的纹路。“卜”的本义就是占卜。",
      "characterSet": [],
      "group": 25,
      "sequence": 27
    },
    {
      "id": "019f1c14-f83b-725a-823a-52280035a1b6",
      "title": "草字头",
      "glyph": "艹",
      "examples": [
        "草",
        "满",
        "塔",
        "警"
      ],
      "description": "“艹”是“艸（草）”做偏旁时的写法。“艸”是象形字，古时候的字形就像两棵小草。“艸”的本义就是草。",
      "characterSet": [
        "花",
        "茅",
        "茶"
      ],
      "group": 29,
      "sequence": 32
    },
    {
      "id": "019f1c14-f83b-725a-823a-7058e812d35e",
      "title": "厂",
      "glyph": "厂",
      "examples": [
        "雁",
        "岸",
        "雳",
        "脆"
      ],
      "description": "“厂”（hǎn）是象形字，最早画的是向外突出的山崖的样子，所以本义就是山崖边上的岩洞、石棚。",
      "characterSet": [
        "厕",
        "原"
      ],
      "group": 35,
      "sequence": 40
    },
    {
      "id": "019f1c14-f83b-725a-823a-7702a055c78c",
      "title": "车",
      "glyph": "车",
      "examples": [
        "辆",
        "㹃",
        "惭",
        "浑"
      ],
      "description": "“车”是象形字，古时候的“车”（車）字就像一辆轮子、车轴、车辕、车轭都齐全的车。“车”的本义就是陆地上有轮子的交通工具。",
      "characterSet": [],
      "group": 36,
      "sequence": 41
    },
    {
      "id": "019f1c14-f83b-725a-823a-988491e4b1ee",
      "title": "虫",
      "glyph": "虫",
      "examples": [
        "虾",
        "独",
        "蚕",
        "闽"
      ],
      "description": "“虫”是象形字，古时候的“虫”字就像一条弯曲的蛇。“虫”的本义就是蛇，读作 huǐ。",
      "characterSet": [],
      "group": 44,
      "sequence": 50
    },
    {
      "id": "019f1c14-f83b-725a-823a-c89a69ddc181",
      "title": "寸",
      "glyph": "寸",
      "examples": [
        "村",
        "封",
        "寻",
        "将"
      ],
      "description": "“寸”是指事字，古时候的“寸”字由“又”（手）和“一”组成，“一”指着手往后一寸的地方。“寸”的本义就是寸口（中医把脉的部位）。",
      "characterSet": [
        "付",
        "对",
        "封"
      ],
      "group": 54,
      "sequence": 62
    },
    {
      "id": "019f1c14-f83b-725a-823a-ccd9f8eb985f",
      "title": "大",
      "glyph": "大",
      "examples": [
        "驮",
        "夸",
        "头",
        "因"
      ],
      "description": "“大”是象形字，古时候的“大”字就像一个张开双臂双腿、正面站着的大人，用来表示人大、物大。“大”的本义就是体积、面积、容积等超过一般比较对象，跟“小”相对。",
      "characterSet": [],
      "group": 55,
      "sequence": 63
    },
    {
      "id": "019f1c14-f83b-725a-823a-f08f8eb8b448",
      "title": "立刀",
      "glyph": "刂",
      "examples": [
        "别",
        "箭",
        "偷",
        "罚"
      ],
      "description": "“刂”是“刀”做偏旁时的写法。“刀”是象形字，甲骨文就像一把刀的样子。“刀”的本义就是有锋刃、能砍能切的工具，也指古代的一种兵器。",
      "characterSet": [],
      "group": 60,
      "sequence": 72
    },
    {
      "id": "019f1c14-f83b-725a-823b-32443e014187",
      "title": "而",
      "glyph": "而",
      "examples": [
        "耐",
        "耍",
        "需",
        "端"
      ],
      "description": "“而”是象形字，古时候的“而”字就像男子下巴上的胡须。“而”的本义就是胡须。",
      "characterSet": [],
      "group": 75,
      "sequence": 88
    },
    {
      "id": "019f1c14-f83b-725a-823b-3a92e640ca1b",
      "title": "耳",
      "glyph": "耳",
      "examples": [
        "聪",
        "饵",
        "聋",
        "摄"
      ],
      "description": "“耳”是象形字，古时候的“耳”字就像人的耳朵。“耳”的本义就是人的耳朵。",
      "characterSet": [],
      "group": 77,
      "sequence": 90
    },
    {
      "id": "019f1c14-f83b-725a-823b-5f75589c35d8",
      "title": "非",
      "glyph": "非",
      "examples": [
        "排",
        "悲",
        "罪",
        "匪"
      ],
      "description": "“非”是象形兼会意字，古时候的“非”字就像一对鸟翅膀朝相反方向张开，表示相背。“非”的本义就是违背。",
      "characterSet": [],
      "group": 85,
      "sequence": 99
    },
    {
      "id": "019f1c14-f83b-725a-823b-9519989286fc",
      "title": "甘",
      "glyph": "甘",
      "examples": [
        "甜",
        "某",
        "嵌"
      ],
      "description": "“甘”是指事字，古时候的“甘”字从“口”，口里的一横指出这是好吃的东西。“甘”的本义就是嘴里食物的味道甜美。",
      "characterSet": [],
      "group": 97,
      "sequence": 113
    },
    {
      "id": "019f1c14-f83b-725a-823b-9f68a9c0d3af",
      "title": "戈",
      "glyph": "戈",
      "examples": [
        "划",
        "战",
        "或",
        "裁"
      ],
      "description": "“戈”是象形字，甲骨文就像一件长柄横刃的兵器。“戈”的本义就是古代一种长柄横刃的兵器。",
      "characterSet": [
        "战"
      ],
      "group": 99,
      "sequence": 115
    },
    {
      "id": "019f1c14-f83b-725a-823b-b99111252c71",
      "title": "弓",
      "glyph": "弓",
      "examples": [
        "引",
        "躬",
        "弱",
        "粥"
      ],
      "description": "“弓”是象形字，古时候的“弓”字就像一张弓。“弓”的本义就是射箭或打弹的工具。",
      "characterSet": [
        "弯"
      ],
      "group": 106,
      "sequence": 122
    },
    {
      "id": "019f1c14-f83b-725a-823b-d16773761602",
      "title": "广",
      "glyph": "广",
      "examples": [
        "扩",
        "康",
        "俯",
        "遮"
      ],
      "description": "“广”（yǎn）是象形字，古时候的“广”字就像依着山崖盖起来、没有前墙的房子。“广”的本义就是靠着山崖建造的房屋。",
      "characterSet": [],
      "group": 112,
      "sequence": 128
    },
    {
      "id": "019f1c14-f83b-725a-823b-ec73d17a3f53",
      "title": "禾",
      "glyph": "禾",
      "examples": [
        "种",
        "秃",
        "秦",
        "乘"
      ],
      "description": "“禾”是象形字，古时候的“禾”字就像成熟的谷子，沉甸甸的穗子低垂着。“禾”的本义就是谷子（庄稼）。",
      "characterSet": [],
      "group": 119,
      "sequence": 135
    },
    {
      "id": "019f1c14-f83b-725a-823c-1fe9ddc7c33a",
      "title": "户",
      "glyph": "户",
      "examples": [
        "炉",
        "所",
        "房",
        "编"
      ],
      "description": "“户”是象形字，古时候的“户”字就像一扇小门。单扇的叫“户”，双扇的叫“门”。“户”的本义就是单扇的门。",
      "characterSet": [
        "所"
      ],
      "group": 128,
      "sequence": 147
    },
    {
      "id": "019f1c14-f83b-725a-823c-3199145f480f",
      "title": "火",
      "glyph": "火",
      "examples": [
        "炒",
        "秋",
        "焚",
        "毯"
      ],
      "description": "“火”是象形字，甲骨文就像一团燃烧的火焰。“火”的本义就是物体燃烧时发出的光焰。",
      "characterSet": [],
      "group": 133,
      "sequence": 152
    },
    {
      "id": "019f1c14-f83b-725a-823c-37f6aa600556",
      "title": "横四点",
      "glyph": "灬",
      "examples": [
        "点",
        "羔",
        "煮",
        "杰"
      ],
      "description": "“灬”是“火”做偏旁时的写法。“火”是象形字，甲骨文就像一团燃烧的火焰。“火”的本义就是物体燃烧时发出的光焰。",
      "characterSet": [
        "照"
      ],
      "group": 133,
      "sequence": 153
    },
    {
      "id": "019f1c14-f83b-725a-823c-3ce9d3112322",
      "title": "及",
      "glyph": "及",
      "examples": [
        "级",
        "吸"
      ],
      "description": "“及”是会意字，古时候的“及”字上面是一个人，后面是一只手（又），表示一只手从后面抓住、追上前面的人。“及”的本义就是追上、赶上。",
      "characterSet": [],
      "group": 135,
      "sequence": 155
    },
    {
      "id": "019f1c14-f83b-725a-823c-7fc57c6b9315",
      "title": "绞丝旁",
      "glyph": "纟",
      "examples": [
        "红",
        "绑",
        "辫",
        "蕴"
      ],
      "description": "“纟”是“糸”做偏旁时的写法。“糸”是象形字，古时候的“糸”字就像一束丝。“糸”的本义就是蚕丝，后来泛指丝线。",
      "characterSet": [
        "线",
        "绿"
      ],
      "group": 147,
      "sequence": 171
    },
    {
      "id": "019f1c14-f83b-725a-823c-9b146d0a4348",
      "title": "巾",
      "glyph": "巾",
      "examples": [
        "帕",
        "帅",
        "帚",
        "闹"
      ],
      "description": "“巾”是象形字，字形就像一块下垂的佩巾。《玉篇》说：“巾，佩巾也。”“巾”的本义就是佩巾（系在身上、原本用来擦东西的布），后来泛指头巾、汗巾、毛巾等布制品。",
      "characterSet": [
        "常"
      ],
      "group": 152,
      "sequence": 178
    },
    {
      "id": "019f1c14-f83b-725a-823c-f267379bc484",
      "title": "口",
      "glyph": "口",
      "examples": [
        "吧",
        "扣",
        "舍",
        "哀"
      ],
      "description": "“口”是象形字，字形就像张开的嘴巴。《说文解字》说：“口，人所以言食也。”“口”的本义就是人的嘴。",
      "characterSet": [
        "可",
        "台",
        "叶",
        "吩",
        "咐",
        "品"
      ],
      "group": 172,
      "sequence": 200
    },
    {
      "id": "019f1c14-f83b-725a-823d-1344ad910a6c",
      "title": "力",
      "glyph": "力",
      "examples": [
        "动",
        "男",
        "伤",
        "荔"
      ],
      "description": "“力”是象形字，古时候的“力”字就像一件耕地的农具“耒”，上面是把手，下面是坚硬的齿刃。“力”的本义就是松土耕田的农具。",
      "characterSet": [
        "劲",
        "穷"
      ],
      "group": 179,
      "sequence": 208
    },
    {
      "id": "019f1c14-f83b-725a-823d-16227997504f",
      "title": "立",
      "glyph": "立",
      "examples": [
        "站",
        "亲",
        "竖",
        "霎"
      ],
      "description": "“立”是会意字，古时候的“立”字下面一横表示平地，画的是一个人正面站在地上。“立”的本义就是站立不动。",
      "characterSet": [],
      "group": 180,
      "sequence": 209
    },
    {
      "id": "019f1c14-f83b-725a-823d-64b091f78980",
      "title": "罗字头",
      "glyph": "罒",
      "examples": [
        "罗",
        "罢",
        "受",
        "曙"
      ],
      "description": "“罒”是“网”做偏旁时常用的写法。“网”是象形字，字形就像一张网。“网”的本义就是捕鱼捕鸟的网具。",
      "characterSet": [],
      "group": 199,
      "sequence": 229
    },
    {
      "id": "019f1c14-f83b-725a-823d-6bb372303b54",
      "title": "马",
      "glyph": "马",
      "examples": [
        "驴",
        "冯",
        "驾",
        "腾"
      ],
      "description": "“马”是象形字，古时候的“马”（馬）字画出了马的头、身子、腿和尾巴。“马”的本义就是马——古人最早驯养的，能拉车、驮东西、耕田、打仗的大牲口。",
      "characterSet": [],
      "group": 200,
      "sequence": 230
    },
    {
      "id": "019f1c14-f83b-725a-823d-883b57bb0074",
      "title": "门",
      "glyph": "门",
      "examples": [
        "们",
        "闻",
        "搁",
        "躏"
      ],
      "description": "“门”是象形字，古时候的“门”（門）字就像两扇门。“门”的本义就是可以开关的院子或房屋的出入口。",
      "characterSet": [
        "简",
        "阔"
      ],
      "group": 207,
      "sequence": 238
    },
    {
      "id": "019f1c14-f83b-725a-823d-9dcb59ff942f",
      "title": "皿",
      "glyph": "皿",
      "examples": [
        "孟",
        "盘",
        "隘",
        "蕴"
      ],
      "description": "“皿”是象形字，古时候的“皿”字就像一个有底座、口很大的容器。“皿”的本义就是吃饭喝水用的器皿。",
      "characterSet": [],
      "group": 212,
      "sequence": 243
    },
    {
      "id": "019f1c14-f83b-725a-823d-a8ef9d5b3d70",
      "title": "木",
      "glyph": "木",
      "examples": [
        "柏",
        "沐",
        "案",
        "闲"
      ],
      "description": "“木”是象形字，古时候的“木”字就像一棵枝、干、根都齐全的大树。“木”的本义就是树。",
      "characterSet": [
        "桂",
        "棒"
      ],
      "group": 215,
      "sequence": 246
    },
    {
      "id": "019f1c14-f83b-725a-823d-af101ee16490",
      "title": "目",
      "glyph": "目",
      "examples": [
        "睛",
        "相",
        "看",
        "循"
      ],
      "description": "“目”是象形字，古时候的“目”字就像一只眼睛。“目”的本义就是眼睛。",
      "characterSet": [],
      "group": 216,
      "sequence": 247
    },
    {
      "id": "019f1c14-f83b-725a-823d-d386bf569f36",
      "title": "鸟",
      "glyph": "鸟",
      "examples": [
        "鸵",
        "鸡",
        "莺",
        "鹰"
      ],
      "description": "“鸟”是象形字，古时候的“鸟”字就像一只有头、眼睛、羽毛、尾巴和爪子的鸟。“鸟”的本义原指长尾巴的飞禽，后来泛指各种鸟类。",
      "characterSet": [],
      "group": 225,
      "sequence": 256
    },
    {
      "id": "019f1c14-f83b-725a-823d-da3802e1c5cb",
      "title": "牛",
      "glyph": "牛",
      "examples": [
        "件",
        "牲",
        "犁",
        "蟹"
      ],
      "description": "“牛”是象形字，古时候的“牛”字特别突出了牛头上那一对弯弯的角。“牛”的本义就是头上有角、力气大、性子温顺、能耕田拉车的大牲口。",
      "characterSet": [],
      "group": 226,
      "sequence": 258
    },
    {
      "id": "019f1c14-f83b-725a-823e-2d3f8289284f",
      "title": "欠",
      "glyph": "欠",
      "examples": [
        "吹",
        "软",
        "掀",
        "资"
      ],
      "description": "“欠”是象形字，甲骨文就像一个人张着嘴打哈欠。“欠”的本义就是打哈欠。",
      "characterSet": [
        "欣"
      ],
      "group": 243,
      "sequence": 279
    },
    {
      "id": "019f1c14-f83b-725a-823e-59946f34c290",
      "title": "反犬旁",
      "glyph": "犭",
      "examples": [
        "狗",
        "狮",
        "逛"
      ],
      "description": "“犭”是“犬”做偏旁时的写法。“犬”是象形字，古时候的“犬”字就像一条狗。“犬”的本义就是大狗。",
      "characterSet": [],
      "group": 253,
      "sequence": 290
    },
    {
      "id": "019f1c14-f83b-725a-823e-609e6f86d67f",
      "title": "人",
      "glyph": "人",
      "examples": [
        "从",
        "合",
        "囚",
        "坐"
      ],
      "description": "“人”是象形字，古时候的“人”字就像一个侧着身子站立的人。“人”的本义就是指会制造、会使用工具劳动的高等动物，也就是我们人类。",
      "characterSet": [
        "食"
      ],
      "group": 255,
      "sequence": 292
    },
    {
      "id": "019f1c14-f83b-725a-823e-67f7d21400e7",
      "title": "单立人",
      "glyph": "亻",
      "examples": [
        "体",
        "堡",
        "夜",
        "鞭"
      ],
      "description": "“亻”是“人”做偏旁时的写法。“人”是象形字，古时候的“人”字就像一个侧身站立的人。“人”的本义就是会制造、会使用工具劳动的高等动物，也就是我们人类。",
      "characterSet": [
        "付",
        "体",
        "使"
      ],
      "group": 255,
      "sequence": 293
    },
    {
      "id": "019f1c14-f83b-725a-823e-98821990d1be",
      "title": "山",
      "glyph": "山",
      "examples": [
        "岭",
        "仙",
        "岁",
        "岔"
      ],
      "description": "“山”是象形字，古时候的“山”字就像一座座连绵起伏的山峰。“山”的本义就是地面上高高耸起的山峰。",
      "characterSet": [],
      "group": 264,
      "sequence": 306
    },
    {
      "id": "019f1c14-f83b-725a-823e-b1734689b24e",
      "title": "舌",
      "glyph": "舌",
      "examples": [
        "乱",
        "话",
        "适",
        "阔"
      ],
      "description": "“舌”是象形字，古时候的“舌”字就像张着嘴、舌头向外伸出来的样子。“舌”的本义就是舌头——口中能尝味道、帮助咀嚼、辅助发音的器官。",
      "characterSet": [],
      "group": 270,
      "sequence": 312
    },
    {
      "id": "019f1c14-f83b-725a-823e-c379d8c537a3",
      "title": "生",
      "glyph": "生",
      "examples": [
        "甥",
        "性",
        "星",
        "窿"
      ],
      "description": "“生”是会意字，古时候的“生”字上面像刚长出来的草木，下面一横表示土地，合起来就是“屮（草）”长在“一（地）”上。“生”的本义就是草木破土长出、生长。",
      "characterSet": [],
      "group": 274,
      "sequence": 316
    },
    {
      "id": "019f1c14-f83b-725a-823e-c497c01cb796",
      "title": "尸",
      "glyph": "尸",
      "examples": [
        "居",
        "卢",
        "殿",
        "霹"
      ],
      "description": "“尸”是象形字，古时候的“尸”字就像一个屈膝而坐的人。古代祭祀久逝祖先时，会由晚辈或臣子化妆成祖先的模样端坐，充当被祭拜对象，“尸”描绘的就是这种坐姿形象。",
      "characterSet": [],
      "group": 275,
      "sequence": 317
    },
    {
      "id": "019f1c14-f83b-725a-823e-d36360b915b8",
      "title": "石",
      "glyph": "石",
      "examples": [
        "砖",
        "拓",
        "泵",
        "岩"
      ],
      "description": "“石”是象形字，古时候的“石”字就像山崖下的一块大石头。“石”的本义就是岩石，后来泛指各种石头、石料。",
      "characterSet": [
        "破",
        "碍",
        "碎"
      ],
      "group": 278,
      "sequence": 320
    },
    {
      "id": "019f1c14-f83b-725a-823e-d4e0f9bedc92",
      "title": "食",
      "glyph": "食",
      "examples": [
        "食",
        "餐"
      ],
      "description": "“食”是象形字，古时候的“食”字就像一个上面有盖、下面有底座的食器，里面装着食物。“食”的本义就是食物。",
      "characterSet": [],
      "group": 279,
      "sequence": 321
    },
    {
      "id": "019f1c14-f83b-725a-823e-d90eb89c345d",
      "title": "食旁",
      "glyph": "饣",
      "examples": [
        "饱",
        "饿"
      ],
      "description": "“饣”是“食”做偏旁时的写法。“食”是象形字，古时候的“食”字就像一个上面有盖、下面有底座的食器，里面装着食物。“食”的本义就是食物。",
      "characterSet": [
        "饼"
      ],
      "group": 279,
      "sequence": 322
    },
    {
      "id": "019f1c14-f83b-725a-823e-e4685f75923f",
      "title": "豕",
      "glyph": "豕",
      "examples": [
        "家",
        "逐",
        "檬",
        "隧"
      ],
      "description": "“豕”是象形字，甲骨文就像一头头、肚子、脚、尾巴都齐全的猪。“豕”的本义就是猪。",
      "characterSet": [],
      "group": 282,
      "sequence": 325
    },
    {
      "id": "019f1c14-f83b-725a-823e-faad9355e5e0",
      "title": "示旁",
      "glyph": "礻",
      "examples": [
        "礼",
        "视"
      ],
      "description": "“礻”是“示”做偏旁时的写法。“示”是象形字，甲骨文就像神主（祭祀的对象），也有人认为像摆放祭品拜神祭祖的供台。“示”的本义就是祭祀的神主或供台，后来引申为上天显示出的某种征象，向人预示吉凶祸福。",
      "characterSet": [],
      "group": 285,
      "sequence": 330
    },
    {
      "id": "019f1c14-f83b-725a-823f-057b78111426",
      "title": "手",
      "glyph": "手",
      "examples": [
        "掰",
        "拿",
        "攀",
        "撑"
      ],
      "description": "“手”是象形字，古时候的“手”字就像一只正面的手，上面像张开的五根手指，下面像手腕。“手”的本义就是手掌。",
      "characterSet": [],
      "group": 288,
      "sequence": 333
    },
    {
      "id": "019f1c14-f83b-725a-823f-08227f1ea8d9",
      "title": "提手",
      "glyph": "扌",
      "examples": [
        "打",
        "拗",
        "哲",
        "箍"
      ],
      "description": "“扌”是“手”放在字左侧做偏旁时的写法。“手”是象形字，古时候的“手”字上面像张开的五根手指，下面像手腕。“手”的本义就是手掌。",
      "characterSet": [
        "抗",
        "拐"
      ],
      "group": 288,
      "sequence": 334
    },
    {
      "id": "019f1c14-f83b-725a-823f-3f106164def1",
      "title": "双耳",
      "glyph": "阝",
      "examples": [
        "队",
        "邦",
        "椭",
        "坠"
      ],
      "description": "“阝”（左耳旁）是“阜”做偏旁时的写法。“阜”是象形字，甲骨文既像一座座并立的山，又像供人一级级往上走的山阶。“阜”的本义就是土山。",
      "characterSet": [
        "陷"
      ],
      "group": 300,
      "sequence": 347
    },
    {
      "id": "019f1c14-f83b-725a-823f-492a568fef89",
      "title": "三点水",
      "glyph": "氵",
      "examples": [
        "河",
        "衍",
        "阔",
        "粱"
      ],
      "description": "“氵”是“水”做偏旁时的写法。“水”是象形字，古时候的“水”字就像一条弯弯曲曲流动的水。“水”的本义就是河流，也泛指像水一样的液体。",
      "characterSet": [
        "浇",
        "游"
      ],
      "group": 302,
      "sequence": 350
    },
    {
      "id": "019f1c14-f83b-725a-823f-4ec26a33dce6",
      "title": "水底",
      "glyph": "氺",
      "examples": [
        "暴",
        "录",
        "泰",
        "膝"
      ],
      "description": "“氺”是“水”做偏旁时的写法。“水”是象形字，古时候的“水”字就像一条弯弯曲曲流动的水。“水”的本义就是河流，也泛指像水一样的液体。",
      "characterSet": [],
      "group": 302,
      "sequence": 351
    },
    {
      "id": "019f1c14-f83b-725a-823f-7cbb09b6e8bc",
      "title": "田",
      "glyph": "田",
      "examples": [
        "佃",
        "奋",
        "画",
        "衡"
      ],
      "description": "“田”是象形字，古时候的“田”字就像方块的田地，外面的方框像田界，中间的十字像田里的小路。“田”的本义就是种庄稼的土地。",
      "characterSet": [],
      "group": 313,
      "sequence": 363
    },
    {
      "id": "019f1c14-f83b-725a-823f-9363ba637cd7",
      "title": "土",
      "glyph": "土",
      "examples": [
        "地",
        "社",
        "幸",
        "庄"
      ],
      "description": "“土”是象形字，古时候的“土”字就像地面上凸起的一块土疙瘩。“土”的本义就是土壤、土地。",
      "characterSet": [
        "坏",
        "坑"
      ],
      "group": 318,
      "sequence": 368
    },
    {
      "id": "019f1c14-f83b-725a-823f-ac52b8e91193",
      "title": "王",
      "glyph": "王",
      "examples": [
        "柾",
        "望",
        "琴",
        "噩"
      ],
      "description": "“王”作偏旁时是“玉”的写法（少一点）。“玉”是象形字，古时候的“玉”字就像用绳子串起来的一串玉石；隶书特意加了一点，用来跟“王”字区别。“玉”的本义就是温润有光泽的美石。",
      "characterSet": [],
      "group": 325,
      "sequence": 375
    },
    {
      "id": "019f1c14-f83b-725a-823f-b8d8fe4e70c3",
      "title": "韦",
      "glyph": "韦",
      "examples": [
        "韧",
        "伟",
        "苇",
        "围"
      ],
      "description": "“韦”是会意字，古时候的“韦”（韋）字中间是“口”（表示城），上下是两只脚，表示人绕着城走。“韦”的本义就是环绕。",
      "characterSet": [],
      "group": 327,
      "sequence": 377
    },
    {
      "id": "019f1c14-f83b-725a-8240-1cdcfecb4775",
      "title": "象",
      "glyph": "象",
      "examples": [
        "像",
        "豫"
      ],
      "description": "“象”是象形字，古时候的“象”字就像一头大象，特别突出了长长的鼻子。“象”的本义就是大象。",
      "characterSet": [],
      "group": 350,
      "sequence": 402
    },
    {
      "id": "019f1c14-f83b-725a-8240-2cf0e5d2ea8e",
      "title": "心",
      "glyph": "心",
      "examples": [
        "悲",
        "闷",
        "媳",
        "瘾"
      ],
      "description": "“心”是象形字，古时候的“心”字就像一颗心的样子。“心”的本义就是心脏。",
      "characterSet": [],
      "group": 353,
      "sequence": 406
    },
    {
      "id": "019f1c14-f83b-725a-8240-31c120baecd8",
      "title": "恭字底",
      "glyph": "㣺",
      "examples": [
        "恭",
        "慕",
        "添"
      ],
      "description": "“⺗”是“心”做偏旁放在字下方时的一种写法。“心”是象形字，古时候的“心”字就像一颗心脏的样子。“心”的本义就是心脏。",
      "characterSet": [],
      "group": 353,
      "sequence": 407
    },
    {
      "id": "019f1c14-f83b-725a-8240-36b8c6fcfe34",
      "title": "竖心",
      "glyph": "忄",
      "examples": [
        "惭",
        "懂",
        "性"
      ],
      "description": "“忄”是“心”放在字左侧做偏旁时的写法。“心”是象形字，古时候的“心”字就像一颗心脏的样子。“心”的本义就是心脏。",
      "characterSet": [],
      "group": 353,
      "sequence": 408
    },
    {
      "id": "019f1c14-f83b-725a-8240-8f288829c019",
      "title": "羊",
      "glyph": "羊",
      "examples": [
        "群",
        "羚",
        "氧",
        "癣"
      ],
      "description": "“羊”是象形字，甲骨文就像羊头和羊角的样子。“羊”的本义就是羊——一种吃草的哺乳动物。",
      "characterSet": [],
      "group": 373,
      "sequence": 430
    },
    {
      "id": "019f1c14-f83b-725a-8240-addb279564f2",
      "title": "页",
      "glyph": "页",
      "examples": [
        "项",
        "濒",
        "嚣"
      ],
      "description": "“页”是象形字，古音读 xié，甲骨文就像一个跪坐的人，特别突出了头部。“页”的本义就是头。",
      "characterSet": [],
      "group": 379,
      "sequence": 438
    },
    {
      "id": "019f1c14-f83b-725a-8240-b42cabd9b7b0",
      "title": "衣",
      "glyph": "衣",
      "examples": [
        "依",
        "哀",
        "嚷",
        "裁"
      ],
      "description": "“衣”是象形字，古时候的“衣”字就像一件有领子、有袖子、有衣襟的上装。“衣”的本义就是上衣（古时候下身穿的叫“裳”），后来成了上衣、下衣的统称。",
      "characterSet": [],
      "group": 381,
      "sequence": 440
    },
    {
      "id": "019f1c14-f83b-725a-8240-bd5556f029a4",
      "title": "衣旁",
      "glyph": "衤",
      "examples": [
        "被",
        "襟",
        "褪"
      ],
      "description": "“衤”是“衣”做偏旁时的写法。“衣”是象形字，古时候的“衣”字就像一件有领子、有袖子、有衣襟的上装。“衣”的本义就是上衣（古时候下身穿的叫“裳”），后来成了上衣、下衣的统称。",
      "characterSet": [],
      "group": 381,
      "sequence": 442
    },
    {
      "id": "019f1c14-f83b-725a-8240-d994f4b00cf9",
      "title": "亦",
      "glyph": "亦",
      "examples": [
        "变",
        "奕",
        "迹"
      ],
      "description": "“亦”是指事字，古时候的“亦”字是在“大”（一个正面站立的人）的两个胳肢窝处各点一点，指出腋窝的位置。“亦”的本义就是腋窝（胳肢窝），这个意思后来写作“腋”。",
      "characterSet": [
        "弯"
      ],
      "group": 388,
      "sequence": 449
    },
    {
      "id": "019f1c14-f83b-725a-8241-0367d1f9c407",
      "title": "酉",
      "glyph": "酉",
      "examples": [
        "醒",
        "酒",
        "酱",
        "尊"
      ],
      "description": "“酉”是象形字，古时候的“酉”字就像一个盛酒的坛子。“酉”的本义就是盛酒的器皿。",
      "characterSet": [],
      "group": 398,
      "sequence": 459
    },
    {
      "id": "019f1c14-f83b-725a-8241-046ca4539ef4",
      "title": "又",
      "glyph": "又",
      "examples": [
        "邓",
        "叹",
        "受",
        "怪"
      ],
      "description": "“又”是象形字，古时候的“又”字就像一只右手，向下伸出的那一笔就像小臂。“又”的本义就是右手。",
      "characterSet": [
        "对"
      ],
      "group": 399,
      "sequence": 460
    },
    {
      "id": "019f1c14-f83b-725a-8241-1ff276759fbe",
      "title": "雨",
      "glyph": "雨",
      "examples": [
        "需",
        "霜",
        "蟜"
      ],
      "description": "“雨”是象形字，甲骨文就像天上落下雨点的样子。“雨”的本义就是从云层里降到地面的水。",
      "characterSet": [],
      "group": 405,
      "sequence": 466
    },
    {
      "id": "019f1c14-f83b-725a-8241-330df5a03dc7",
      "title": "月",
      "glyph": "月",
      "examples": [
        "期",
        "明"
      ],
      "description": "“月”是象形字，古时候的“月”字就像一弯月亮。“月”的本义就是月亮。",
      "characterSet": [],
      "group": 409,
      "sequence": 471
    },
    {
      "id": "019f1c14-f83b-725a-8241-37e8289e4847",
      "title": "肉月",
      "glyph": "月",
      "examples": [
        "胆",
        "脸",
        "脚"
      ],
      "description": "“月（肉）”：是“肉”字的偏旁形，古时候的“肉”字像一块切好的肉或肉的纹理。“月（肉）”的本义就是肉、肉体，作为偏旁时表示与身体部位、器官、肉有关。",
      "characterSet": [],
      "group": 409,
      "sequence": 471
    },
    {
      "id": "019f1c14-f83b-725a-8241-3d0eb32a03c6",
      "title": "肉",
      "glyph": "肉",
      "examples": [
        "腐",
        "瘸"
      ],
      "description": "“肉”是象形字，古时候的“肉”字就像切成大块的肉。“肉”的本义就是可以吃的禽兽的肉。",
      "characterSet": [],
      "group": 409,
      "sequence": 472
    },
    {
      "id": "019f1c14-f83b-725a-8241-7df1fe8b9f40",
      "title": "止",
      "glyph": "止",
      "examples": [
        "址",
        "步",
        "企",
        "斌"
      ],
      "description": "“止”是象形字，古时候的“止”字就像一只有脚趾、有脚跟的脚。“止”的本义就是脚。",
      "characterSet": [],
      "group": 421,
      "sequence": 488
    },
    {
      "id": "019f1c14-f83b-725a-8241-8f14965033e0",
      "title": "至",
      "glyph": "至",
      "examples": [
        "致",
        "侄",
        "室"
      ],
      "description": "“至”是会意字，古时候的“至”字上面像一支箭，下面一横表示地面，画的是箭射落到眼前地上的样子。“至”的本义就是到、到达。",
      "characterSet": [],
      "group": 422,
      "sequence": 492
    },
    {
      "id": "019f1c14-f83b-725a-8241-a5f1159c420b",
      "title": "舟",
      "glyph": "舟",
      "examples": [
        "船",
        "盘",
        "搬"
      ],
      "description": "“舟”是象形字，古时候的“舟”字就像一条小船的样子。“舟”的本义就是小木船。",
      "characterSet": [],
      "group": 428,
      "sequence": 498
    },
    {
      "id": "019f1c14-f83b-725a-8241-b616ecd642e9",
      "title": "竹头",
      "glyph": "𥫗",
      "examples": [
        "笔",
        "等",
        "笑",
        "筑"
      ],
      "description": "“⺮”是“竹”做偏旁时的写法。“竹”是象形字，古时候的“竹”字就像两片下垂的竹叶。“竹”的本义就是竹子——一种有竹节、茎是空心、常年翠绿的多年生植物。",
      "characterSet": [],
      "group": 431,
      "sequence": 502
    },
    {
      "id": "019f1c14-f83b-725a-8241-cfb3c6df69b5",
      "title": "锥字边",
      "glyph": "隹",
      "examples": [
        "凗",
        "集",
        "雀",
        "罐"
      ],
      "description": "“隹”是象形字，古时候的“隹”字就像一只头、身、翅膀、脚都齐全的短尾巴鸟。“隹”的本义就是短尾巴鸟的总称。",
      "characterSet": [],
      "group": 435,
      "sequence": 508
    },
    {
      "id": "019f1c14-f83b-725a-8241-d79da2183568",
      "title": "子",
      "glyph": "子",
      "examples": [
        "孔",
        "籽",
        "字",
        "郭"
      ],
      "description": "“子”是象形字，古时候的“子”字就像一个裹在襁褓里的婴儿。“子”的本义就是婴儿，后来引申指子女，又特指儿子。",
      "characterSet": [],
      "group": 437,
      "sequence": 510
    },
    {
      "id": "019f1c14-f83b-725a-8241-dfe21eec651e",
      "title": "自",
      "glyph": "自",
      "examples": [
        "咱",
        "息",
        "瘪"
      ],
      "description": "“自”是象形字，古时候的“自”字就像人的鼻子。“自”的本义就是鼻子。",
      "characterSet": [],
      "group": 439,
      "sequence": 512
    }
  ]
} as const;

export const { course, lessons, characters, components } = catalog;

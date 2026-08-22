export type AudioMark = {
  index: number;
  char: string;
  start: number;
  end: number;
  alignment_group?: string | number;
  alignment_group_text?: string;
};

export type HeritageAsset = {
  stages: { label: string; src: string }[];
  redBlue?: string;
};

export const heritageAssets: Record<string, HeritageAsset> = {
  "019f0554-ea21-740f-af56-8f5393f25abc": {
    "stages": [
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-8f5393f25abc/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-8f5393f25abc/stage-2.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-8f5393f25abc/stage-3.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-8f5393f25abc/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-8f5393f25abc/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-8f5393f25abc/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-91a530f5a84a": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-91a530f5a84a/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-91a530f5a84a/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-98e4990b31e9": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-98e4990b31e9/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-9f077aee3190": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-9f077aee3190/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-9f077aee3190/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-9f077aee3190/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-9f077aee3190/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-9f077aee3190/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-9f077aee3190/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-a597cc432bfa": {
    "stages": [
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-a597cc432bfa/stage-1.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-a597cc432bfa/stage-2.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-a597cc432bfa/stage-3.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-a597cc432bfa/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-a849ce35f999": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-a849ce35f999/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-a849ce35f999/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-a849ce35f999/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-a849ce35f999/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-a849ce35f999/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-a849ce35f999/red-blue.svg"
  },
  "019f0554-ea21-740f-af56-b2be37c57c6f": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-b2be37c57c6f/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-b5a49431c08a": {
    "stages": [
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-b5a49431c08a/stage-1.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-b5a49431c08a/stage-2.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-b5a49431c08a/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-bbfbd3faf147": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-bbfbd3faf147/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-bbfbd3faf147/red-blue.svg"
  },
  "019f0554-ea21-740f-af56-c30d06561eab": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-c30d06561eab/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-c69fa0ab0a63": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-c69fa0ab0a63/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-c69fa0ab0a63/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-c69fa0ab0a63/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-c69fa0ab0a63/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-c69fa0ab0a63/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-c69fa0ab0a63/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-cee56e724f90": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-cee56e724f90/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-d0a1e8088ef3": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-d0a1e8088ef3/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-d0a1e8088ef3/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-d596ba1ac69d": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-d596ba1ac69d/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-d596ba1ac69d/red-blue.svg"
  },
  "019f0554-ea21-740f-af56-df19f47aff27": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-df19f47aff27/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-df19f47aff27/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-e20f48f7369d": {
    "stages": [
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-e20f48f7369d/stage-1.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-e20f48f7369d/stage-2.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-e20f48f7369d/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-eb8a1342988b": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-eb8a1342988b/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-eb8a1342988b/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-eb8a1342988b/stage-3.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-eb8a1342988b/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-eb8a1342988b/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-eb8a1342988b/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-ec702611da9c": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-ec702611da9c/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-f733d22bc224": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-f733d22bc224/red-blue.svg",
  },
  "019f0554-ea21-740f-af56-fbb5f4ff5346": {
    "stages": [
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea21-740f-af56-fbb5f4ff5346/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af56-fbb5f4ff5346/stage-2.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af56-fbb5f4ff5346/stage-3.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af56-fbb5f4ff5346/red-blue.svg",
  },
  "019f0554-ea21-740f-af57-0073c73d6737": {
    "stages": [
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af57-0073c73d6737/stage-1.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af57-0073c73d6737/stage-2.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af57-0073c73d6737/red-blue.svg",
  },
  "019f0554-ea21-740f-af57-040b5e6e761b": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea21-740f-af57-040b5e6e761b/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea21-740f-af57-040b5e6e761b/stage-2.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea21-740f-af57-040b5e6e761b/stage-3.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea21-740f-af57-040b5e6e761b/stage-4.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea21-740f-af57-040b5e6e761b/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-d3fa2de611be": {
    "stages": [
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-d3fa2de611be/stage-1.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-d3fa2de611be/stage-2.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-d3fa2de611be/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-d4bb77fae57f": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-d4bb77fae57f/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-dd82ee494384": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-dd82ee494384/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-e1631ffd2c46": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966b-e1631ffd2c46/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966b-e1631ffd2c46/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-e1631ffd2c46/stage-3.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966b-e1631ffd2c46/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-e1631ffd2c46/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-e1631ffd2c46/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-ebda64f057b8": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-ebda64f057b8/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-ebda64f057b8/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-ef1ad97fda3a": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966b-ef1ad97fda3a/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966b-ef1ad97fda3a/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-ef1ad97fda3a/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966b-ef1ad97fda3a/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-ef1ad97fda3a/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-ef1ad97fda3a/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-f64404abe271": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966b-f64404abe271/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966b-f64404abe271/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-f64404abe271/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966b-f64404abe271/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966b-f64404abe271/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-f64404abe271/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-f64404abe271/red-blue.svg",
  },
  "019f0554-ea22-762e-966b-fb7629001a7c": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966b-fb7629001a7c/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966b-fb7629001a7c/stage-2.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966b-fb7629001a7c/stage-3.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966b-fb7629001a7c/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966b-fb7629001a7c/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966b-fb7629001a7c/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-00c686953731": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-00c686953731/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-00c686953731/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-045f1238cfda": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-045f1238cfda/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-045f1238cfda/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-045f1238cfda/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-045f1238cfda/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-045f1238cfda/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-045f1238cfda/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-0e550b46e532": {
    "stages": [
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-0e550b46e532/stage-1.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-0e550b46e532/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-107a74abbe03": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-107a74abbe03/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-107a74abbe03/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-107a74abbe03/stage-3.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-107a74abbe03/stage-4.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-107a74abbe03/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-1a01682b33c7": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-1a01682b33c7/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-1a01682b33c7/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-1a01682b33c7/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-1a01682b33c7/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-1a01682b33c7/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-1a01682b33c7/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-1c2b90eef3c3": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-1c2b90eef3c3/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-26177aed95a6": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-26177aed95a6/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-32d678fd6bf6": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-32d678fd6bf6/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-58aee8dc172b": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-58aee8dc172b/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-58aee8dc172b/stage-2.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-58aee8dc172b/stage-3.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-58aee8dc172b/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-648c839e834d": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-648c839e834d/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-648c839e834d/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-648c839e834d/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-648c839e834d/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-648c839e834d/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-648c839e834d/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-648c839e834d/red-blue.svg"
  },
  "019f0554-ea22-762e-966c-6f1312a8ab57": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-6f1312a8ab57/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-7ac68ada26e9": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-7ac68ada26e9/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-7ac68ada26e9/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-7ac68ada26e9/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-7ac68ada26e9/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-7ac68ada26e9/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-7ac68ada26e9/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-7ed2f3d7f1f4": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-7ed2f3d7f1f4/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-7ed2f3d7f1f4/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-7ed2f3d7f1f4/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-7ed2f3d7f1f4/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-7ed2f3d7f1f4/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-7ed2f3d7f1f4/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-91164a91987a": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-91164a91987a/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-91164a91987a/stage-2.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-91164a91987a/stage-3.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-91164a91987a/stage-4.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-91164a91987a/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-9641b1078ac1": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-9641b1078ac1/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-9641b1078ac1/stage-2.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-9641b1078ac1/stage-3.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-9641b1078ac1/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-9641b1078ac1/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-9641b1078ac1/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-a994523efc60": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-a994523efc60/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-a994523efc60/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-b68b75784d2e": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-b68b75784d2e/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-b68b75784d2e/stage-2.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-b68b75784d2e/stage-3.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-b68b75784d2e/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-b68b75784d2e/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-b68b75784d2e/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-c23c4186d00d": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-c23c4186d00d/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-c55f0d86d613": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-c55f0d86d613/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-daf4204fc6b4": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-daf4204fc6b4/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-e9594325cd7d": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-e9594325cd7d/stage-1.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-e9594325cd7d/stage-2.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-e9594325cd7d/stage-3.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-e9594325cd7d/stage-4.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-e9594325cd7d/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-f16720ed784f": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966c-f16720ed784f/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-f16720ed784f/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-f16720ed784f/stage-3.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-f16720ed784f/stage-4.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-f16720ed784f/red-blue.svg",
  },
  "019f0554-ea22-762e-966c-f75a091eff54": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966c-f75a091eff54/red-blue.svg",
  },
  "019f0554-ea22-762e-966d-0882757b1f54": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966d-0882757b1f54/red-blue.svg",
  },
  "019f0554-ea22-762e-966d-100abc0d94fb": {
    "stages": [
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/stage-1.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/stage-4.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/stage-5.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/stage-6.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966d-100abc0d94fb/red-blue.svg"
  },
  "019f0554-ea22-762e-966d-15d9bb6f7bbb": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966d-15d9bb6f7bbb/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966d-15d9bb6f7bbb/stage-2.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966d-15d9bb6f7bbb/stage-3.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966d-15d9bb6f7bbb/stage-4.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966d-15d9bb6f7bbb/stage-5.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966d-15d9bb6f7bbb/red-blue.svg",
  },
  "019f0554-ea22-762e-966d-1cbd3a593fc0": {
    "stages": [
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966d-1cbd3a593fc0/stage-1.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966d-1cbd3a593fc0/stage-2.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966d-1cbd3a593fc0/stage-3.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966d-1cbd3a593fc0/red-blue.svg",
  },
  "019f0554-ea22-762e-966d-21e44861f3a8": {
    "stages": [
      {
        "label": "甲骨文",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-1.svg"
      },
      {
        "label": "金文",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-2.svg"
      },
      {
        "label": "楚系简帛",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-3.svg"
      },
      {
        "label": "说文小篆",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-4.svg"
      },
      {
        "label": "秦系简牍",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-5.svg"
      },
      {
        "label": "隶书",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-6.svg"
      },
      {
        "label": "楷书",
        "src": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/stage-7.svg"
      }
    ],
    "redBlue": "/heritage/019f0554-ea22-762e-966d-21e44861f3a8/red-blue.svg",
  }
};

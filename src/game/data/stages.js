/**
 * 基本ステージ定義です。
 * 各ステージはREMIX、難易度拡張、色ライト追加の元データとして使われます。
 */
export const STAGES = [
  {
    "id": "moon-hall",
    "name": "月あかりホール",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 3,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 3
    },
    "mirrors": [
      {
        "x": 2,
        "y": 3,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 1,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 1,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 3,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "walls": [
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "portals": []
  },
  {
    "id": "crystal-bend",
    "name": "きらめき階段",
    "mission": "少ない回転でクリア",
    "missionType": "lowRotate",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 6,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 0
    },
    "mirrors": [
      {
        "x": 1,
        "y": 6,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 1,
        "y": 4,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 4,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 0,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "ghosts": [
      {
        "x": 7,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "walls": [
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 6,
        "y": 4
      }
    ],
    "portals": []
  },
  {
    "id": "ghost-line",
    "name": "おばけ回廊",
    "mission": "おばけに当てずにクリア",
    "missionType": "noGhost",
    "par": 6,
    "emitter": {
      "x": 0,
      "y": 2,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 5
    },
    "mirrors": [
      {
        "x": 1,
        "y": 2,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 5,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 4,
        "y": 5,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 4,
        "y": 6,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 5,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "ghosts": [
      {
        "x": 6,
        "y": 7
      },
      {
        "x": 7,
        "y": 7
      }
    ],
    "walls": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 1,
        "y": 0
      }
    ],
    "portals": []
  },
  {
    "id": "portal-foyer",
    "name": "ワープ玄関",
    "mission": "ポータルを使ってクリア",
    "missionType": "portal",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 5,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 1
    },
    "mirrors": [
      {
        "x": 6,
        "y": 2,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 1,
        "type": "\\",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 6,
        "y": 2
      },
      {
        "x": 6,
        "y": 1
      },
      {
        "x": 7,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "walls": [
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 1
      }
    ],
    "portals": [
      {
        "id": "a",
        "x": 2,
        "y": 5,
        "to": {
          "x": 5,
          "y": 2
        }
      },
      {
        "id": "a",
        "x": 5,
        "y": 2,
        "to": {
          "x": 2,
          "y": 5
        }
      }
    ]
  },
  {
    "id": "perfect-orbit",
    "name": "完全反射の間",
    "mission": "パーフェクトを狙え",
    "missionType": "perfect",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 4,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 2
    },
    "mirrors": [
      {
        "x": 2,
        "y": 4,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 0,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 0,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 2,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 6,
        "y": 0
      }
    ],
    "ghosts": [
      {
        "x": 0,
        "y": 6
      }
    ],
    "walls": [
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "portals": []
  },
  {
    "id": "lamp-lane",
    "name": "ランプ横丁",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 3,
    "emitter": {
      "x": 0,
      "y": 1,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 6
    },
    "mirrors": [
      {
        "x": 3,
        "y": 1,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 3,
        "y": 4,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 4,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 6,
        "y": 4
      }
    ],
    "ghosts": [
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      }
    ],
    "walls": [
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "portals": []
  },
  {
    "id": "star-corridor",
    "name": "星くず廊下",
    "mission": "少ない回転でクリア",
    "missionType": "lowRotate",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 5,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 0
    },
    "mirrors": [
      {
        "x": 2,
        "y": 5,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 2,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 0,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "ghosts": [
      {
        "x": 7,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "walls": [
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "portals": []
  },
  {
    "id": "soft-zigzag",
    "name": "ふわふわジグザグ",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 6,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 1
    },
    "mirrors": [
      {
        "x": 3,
        "y": 6,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 3,
        "y": 3,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 3,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 1,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 3,
        "y": 6
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      }
    ],
    "ghosts": [
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 6,
        "y": 2
      }
    ],
    "walls": [
      {
        "x": 7,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      }
    ],
    "portals": []
  },
  {
    "id": "safe-balcony",
    "name": "安全バルコニー",
    "mission": "おばけに当てずにクリア",
    "missionType": "noGhost",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 0,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 5
    },
    "mirrors": [
      {
        "x": 4,
        "y": 0,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 4,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 5,
        "type": "/",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      }
    ],
    "ghosts": [
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "walls": [
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "portals": []
  },
  {
    "id": "glass-garden",
    "name": "ガラス庭園",
    "mission": "パーフェクトを狙え",
    "missionType": "perfect",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 7,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 4
    },
    "mirrors": [
      {
        "x": 1,
        "y": 7,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 1,
        "y": 1,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 1,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 4,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 1,
        "y": 7
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 6,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 7,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "walls": [
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "portals": []
  },
  {
    "id": "clock-tower",
    "name": "時計塔の光",
    "mission": "フィーバー中にクリア",
    "missionType": "fever",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 4,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 1
    },
    "mirrors": [
      {
        "x": 5,
        "y": 4,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 6,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 6,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 1,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 5,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "ghosts": [
      {
        "x": 6,
        "y": 5
      },
      {
        "x": 7,
        "y": 5
      }
    ],
    "walls": [
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      }
    ],
    "portals": []
  },
  {
    "id": "double-portal",
    "name": "双子の鏡部屋",
    "mission": "ポータルを使ってクリア",
    "missionType": "portal",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 1,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 6
    },
    "mirrors": [
      {
        "x": 3,
        "y": 1,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 6,
        "type": "/",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "ghosts": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 6,
        "y": 6
      }
    ],
    "walls": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "portals": [
      {
        "id": "b",
        "x": 3,
        "y": 3,
        "to": {
          "x": 5,
          "y": 4
        }
      },
      {
        "id": "b",
        "x": 5,
        "y": 4,
        "to": {
          "x": 3,
          "y": 3
        }
      }
    ]
  },
  {
    "id": "phantom-cross",
    "name": "ファントム十字路",
    "mission": "おばけに当てずにクリア",
    "missionType": "noGhost",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 3,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 6
    },
    "mirrors": [
      {
        "x": 4,
        "y": 3,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 0,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 0,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "/",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 6,
        "y": 0
      }
    ],
    "ghosts": [
      {
        "x": 3,
        "y": 7
      },
      {
        "x": 4,
        "y": 7
      },
      {
        "x": 5,
        "y": 7
      }
    ],
    "walls": [
      {
        "x": 6,
        "y": 7
      },
      {
        "x": 7,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "ruby-stairs",
    "name": "ルビー階段",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 7,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 2
    },
    "mirrors": [
      {
        "x": 3,
        "y": 7,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 3,
        "y": 5,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 5,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 3,
        "y": 7
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "ghosts": [
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "walls": [
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 6,
        "y": 5
      }
    ],
    "portals": []
  },
  {
    "id": "silver-loop",
    "name": "銀の回廊",
    "mission": "少ない回転でクリア",
    "missionType": "lowRotate",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 2,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 3
    },
    "mirrors": [
      {
        "x": 2,
        "y": 2,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 6,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 6,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 3,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "ghosts": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      }
    ],
    "walls": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "portals": []
  },
  {
    "id": "quiet-gallery",
    "name": "しずかなギャラリー",
    "mission": "パーフェクトを狙え",
    "missionType": "perfect",
    "par": 4,
    "emitter": {
      "x": 0,
      "y": 1,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 4
    },
    "mirrors": [
      {
        "x": 1,
        "y": 1,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 6,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 4,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 6,
        "y": 6
      }
    ],
    "ghosts": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 7,
        "y": 3
      }
    ],
    "walls": [
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "portals": []
  },
  {
    "id": "comet-room",
    "name": "コメットルーム",
    "mission": "フィーバー中にクリア",
    "missionType": "fever",
    "par": 5,
    "emitter": {
      "x": 0,
      "y": 5,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 0
    },
    "mirrors": [
      {
        "x": 4,
        "y": 5,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 2,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 2,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 0,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      }
    ],
    "ghosts": [
      {
        "x": 0,
        "y": 7
      },
      {
        "x": 1,
        "y": 7
      }
    ],
    "walls": [
      {
        "x": 2,
        "y": 7
      },
      {
        "x": 3,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "midnight-arc",
    "name": "真夜中アーチ",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 6,
    "emitter": {
      "x": 0,
      "y": 6,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 0
    },
    "mirrors": [
      {
        "x": 2,
        "y": 6,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 4,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 4,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 1,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 3,
        "y": 1,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 3,
        "y": 0,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 5,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 6,
        "y": 2
      }
    ],
    "walls": [
      {
        "x": 7,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      }
    ],
    "portals": []
  },
  {
    "id": "thunder-hall",
    "name": "かみなりホール",
    "mission": "少ない回転でクリア",
    "missionType": "lowRotate",
    "par": 6,
    "emitter": {
      "x": 0,
      "y": 0,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 7
    },
    "mirrors": [
      {
        "x": 5,
        "y": 0,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 2,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 1,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 1,
        "y": 5,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 5,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 7,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "ghosts": [
      {
        "x": 0,
        "y": 7
      },
      {
        "x": 1,
        "y": 7
      },
      {
        "x": 2,
        "y": 7
      }
    ],
    "walls": [
      {
        "x": 3,
        "y": 7
      },
      {
        "x": 4,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "crown-prism",
    "name": "王冠プリズム",
    "mission": "パーフェクトを狙え",
    "missionType": "perfect",
    "par": 6,
    "emitter": {
      "x": 0,
      "y": 7,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 5
    },
    "mirrors": [
      {
        "x": 2,
        "y": 7,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 3,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 3,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 1,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 1,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 5,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 7
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "walls": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 6,
        "y": 0
      }
    ],
    "portals": []
  },
  {
    "id": "neon-stair",
    "name": "ネオン階段",
    "mission": "おばけに当てずにクリア",
    "missionType": "noGhost",
    "par": 6,
    "emitter": {
      "x": 0,
      "y": 4,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 0
    },
    "mirrors": [
      {
        "x": 3,
        "y": 4,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 3,
        "y": 6,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 1,
        "y": 6,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 0,
        "type": "\\",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 1,
        "y": 2
      }
    ],
    "ghosts": [
      {
        "x": 5,
        "y": 6
      },
      {
        "x": 6,
        "y": 6
      },
      {
        "x": 7,
        "y": 6
      }
    ],
    "walls": [
      {
        "x": 0,
        "y": 7
      },
      {
        "x": 1,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "spiral-stage",
    "name": "スパイラル舞台",
    "mission": "フィーバー中にクリア",
    "missionType": "fever",
    "par": 7,
    "emitter": {
      "x": 0,
      "y": 3,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 4
    },
    "mirrors": [
      {
        "x": 6,
        "y": 3,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 6,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 1,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 1,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 4,
        "type": "/",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 6,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 2,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 7,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      }
    ],
    "walls": [
      {
        "x": 7,
        "y": 6
      },
      {
        "x": 0,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "last-bell",
    "name": "ラストベル廊下",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 6,
    "emitter": {
      "x": 0,
      "y": 5,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 2
    },
    "mirrors": [
      {
        "x": 1,
        "y": 5,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 1,
        "y": 0,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 0,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 4,
        "y": 6,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "ghosts": [
      {
        "x": 2,
        "y": 7
      },
      {
        "x": 3,
        "y": 7
      }
    ],
    "walls": [
      {
        "x": 4,
        "y": 7
      },
      {
        "x": 5,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "grand-mirror",
    "name": "グランドミラー",
    "mission": "パーフェクトを狙え",
    "missionType": "perfect",
    "par": 7,
    "emitter": {
      "x": 0,
      "y": 1,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 2
    },
    "mirrors": [
      {
        "x": 6,
        "y": 1,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 4,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 3,
        "y": 4,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 3,
        "y": 7,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 7,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      }
    ],
    "crystals": [
      {
        "x": 6,
        "y": 1
      },
      {
        "x": 6,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 7
      }
    ],
    "ghosts": [
      {
        "x": 6,
        "y": 0
      },
      {
        "x": 7,
        "y": 0
      },
      {
        "x": 7,
        "y": 1
      }
    ],
    "walls": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      }
    ],
    "portals": []
  },
  {
    "id": "prism-party",
    "name": "プリズムパーティ",
    "mission": "水晶を2個以上取ってクリア",
    "missionType": "crystals",
    "par": 7,
    "emitter": {
      "x": 0,
      "y": 6,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 5
    },
    "mirrors": [
      {
        "x": 4,
        "y": 6,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 3,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 3,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 1,
        "y": 0,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 0,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 5,
        "type": "/",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 4,
        "y": 6
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 1,
        "y": 0
      }
    ],
    "ghosts": [
      {
        "x": 6,
        "y": 6
      },
      {
        "x": 7,
        "y": 6
      },
      {
        "x": 0,
        "y": 7
      }
    ],
    "walls": [
      {
        "x": 1,
        "y": 7
      },
      {
        "x": 2,
        "y": 7
      }
    ],
    "portals": []
  },
  {
    "id": "showdown-gate",
    "name": "ショーダウンゲート",
    "mission": "おばけに当てずにクリア",
    "missionType": "noGhost",
    "par": 7,
    "emitter": {
      "x": 0,
      "y": 2,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 7
    },
    "mirrors": [
      {
        "x": 3,
        "y": 2,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 3,
        "y": 5,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 5,
        "y": 5,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 5,
        "y": 1,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 1,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 2,
        "y": 7,
        "type": "/",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 5,
        "y": 1
      }
    ],
    "ghosts": [
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 6,
        "y": 4
      }
    ],
    "walls": [
      {
        "x": 7,
        "y": 4
      },
      {
        "x": 0,
        "y": 5
      }
    ],
    "portals": []
  },
  {
    "id": "aurora-line",
    "name": "オーロラライン",
    "mission": "フィーバー中にクリア",
    "missionType": "fever",
    "par": 7,
    "emitter": {
      "x": 0,
      "y": 0,
      "dir": "right"
    },
    "goal": {
      "x": 7,
      "y": 6
    },
    "mirrors": [
      {
        "x": 2,
        "y": 0,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 2,
        "y": 5,
        "type": "\\",
        "solutionType": "\\"
      },
      {
        "x": 4,
        "y": 5,
        "type": "\\",
        "solutionType": "/"
      },
      {
        "x": 4,
        "y": 2,
        "type": "/",
        "solutionType": "/"
      },
      {
        "x": 6,
        "y": 2,
        "type": "/",
        "solutionType": "\\"
      },
      {
        "x": 6,
        "y": 6,
        "type": "\\",
        "solutionType": "\\"
      }
    ],
    "crystals": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 4,
        "y": 2
      }
    ],
    "ghosts": [
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 7,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "walls": [
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "portals": []
  }
];

export const GRID_SIZE = 8;

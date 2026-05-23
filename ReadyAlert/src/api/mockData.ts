/**
 * Static mock responses for the Geosphere API, used during local development when USE_MOCK_DATA is enabled.
 * Contains one fixture with no active warnings (Vienna-Döbling) and one with active wind warnings (Schwechat).
 */

import { GeosphereResponse } from './types';

/**
 * Mock response with NO warnings (Vienna-Döbling)
 */
export const mockResponseNoWarnings: GeosphereResponse = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [623090, 486282],
          [622526, 486265],
          [621136, 486885],
          [620592, 487418],
          [619312, 487690],
          [619123, 488464],
          [619739, 489206],
          [619525, 489439],
          [619119, 489505],
          [619338, 489856],
          [619737, 490056],
          [620167, 490199],
          [620549, 490033],
          [621219, 490314],
          [621656, 490800],
          [622272, 490713],
          [622498, 491133],
          [623438, 491689],
          [623129, 492055],
          [623635, 492242],
          [624064, 491504],
          [624247, 491473],
          [625554, 489230],
          [625252, 489064],
          [625562, 487896],
          [624870, 486265],
          [624509, 486230],
          [624358, 485755],
          [624058, 485747],
          [624081, 485944],
          [623112, 485923],
          [623090, 486282],
        ],
      ],
    ],
  },
  properties: {
    location: {
      type: 'Municipal',
      properties: {
        gemeindenr: 91901,
        name: 'Wien-Döbling',
        urlname: 'wien_doebling',
      },
    },
    warnings: [],
  },
};

/**
 * Mock response WITH warnings (Schwechat)
 */
export const mockResponseWithWarnings: GeosphereResponse = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [640566, 472707],
          [640281, 471718],
          [639775, 470596],
          [639740, 470624],
          [637442, 472440],
          [636477, 472285],
          [636050, 471395],
          [635135, 472948],
          [633156, 473934],
          [632995, 473230],
          [632468, 472895],
          [631009, 473568],
          [630691, 474849],
          [630869, 475570],
          [632200, 475750],
          [633093, 476663],
          [633860, 477855],
          [634652, 477636],
          [635029, 478056],
          [635412, 477782],
          [636541, 478130],
          [638795, 476481],
          [641276, 475688],
          [640566, 472707],
        ],
      ],
    ],
  },
  properties: {
    location: {
      type: 'Municipal',
      properties: {
        gemeindenr: 30740,
        name: 'Schwechat',
        urlname: 'schwechat',
      },
    },
    warnings: [
      {
        type: 'Warning',
        properties: {
          warnid: 4149,
          chgid: 6,
          verlaufid: 2,
          warntypid: 1,
          begin: '27.03.2023 08:00',
          end: '27.03.2023 18:00',
          create: '2023-03-27 06:00:00+00',
          text: 'Gelbe Windwarnung von Mo, 27.03.2023 08:00 bis Mo, 27.03.2023 18:00',
          auswirkungen:
            '* Äste können herabstürzen und Gegenstände herumgewirbelt werden.\n* Erhöhte Unfallgefahr durch starken Seitenwind auf Brücken und exponierten Straßenzügen, insbesondere für LKW oder bei Fahrten mit großen Anhängern',
          empfehlungen:
            '* Seien Sie in Wäldern, Parks und Alleen achtsam, rechnen Sie mit herabstürzenden Ästen!\n* Reduzieren Sie im Straßenverkehr auf Brücken und exponierten Straßenzügen die Geschwindigkeit, vermeiden Sie Überholmanöver und halten Sie Abstand!',
          meteotext:
            'Mit einer nordwestlichen Strömung lebt im Ostalpenraum der Nordwestwind deutlich auf und erreicht in den Niederungen Windspitzen zwischen 60 und 80km/h. Im Bergland werden zum Teil Sturmböen von über 100km/h erreicht.',
          updategrund: '',
          warnstufeid: 1,
          rawinfo: {
            wtype: 1,
            wlevel: 1,
            start: '1679896800',
            end: '1679932800',
          },
        },
      },
      {
        type: 'Warning',
        properties: {
          warnid: 4150,
          chgid: 2,
          verlaufid: 1,
          warntypid: 1,
          begin: '28.03.2023 08:00',
          end: '28.03.2023 18:00',
          create: '2023-03-27 08:00:00+00',
          text: 'Gelbe Windwarnung von Di, 28.03.2023 08:00 bis Di, 28.03.2023 18:00',
          auswirkungen:
            '* Äste können herabstürzen und Gegenstände herumgewirbelt werden.\n* Erhöhte Unfallgefahr durch starken Seitenwind auf Brücken und exponierten Straßenzügen, insbesondere für LKW oder bei Fahrten mit großen Anhängern',
          empfehlungen:
            '* Seien Sie in Wäldern, Parks und Alleen achtsam, rechnen Sie mit herabstürzenden Ästen!\n* Reduzieren Sie im Straßenverkehr auf Brücken und exponierten Straßenzügen die Geschwindigkeit, vermeiden Sie Überholmanöver und halten Sie Abstand!',
          meteotext:
            'Mit einer stürmische Nordwestströmung erreichen Sturmböen etwa 60 bis 80 km/h. Im Gebirge sind auch Böen über 100 km/h zu erwarten.',
          updategrund: '',
          warnstufeid: 1,
          rawinfo: {
            wtype: 1,
            wlevel: 1,
            start: '1679983200',
            end: '1680019200',
          },
        },
      },
    ],
  },
};

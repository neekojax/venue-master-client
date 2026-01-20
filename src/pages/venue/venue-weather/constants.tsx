import React from "react";
import OneSvg from "@/assets/svg/1.svg?react";
import TwoSvg from "@/assets/svg/2.svg?react";
import ThreeSvg from "@/assets/svg/3.svg?react";
import FourSvg from "@/assets/svg/4.svg?react";
import FiveSvg from "@/assets/svg/5.svg?react";
import SixSvg from "@/assets/svg/6.svg?react";
import SevenSvg from "@/assets/svg/7.svg?react";
import EightSvg from "@/assets/svg/8.svg?react";
import ElevenSvg from "@/assets/svg/11.svg?react";
import TwelveSvg from "@/assets/svg/12.svg?react";
import ThirteenSvg from "@/assets/svg/13.svg?react";
import FourteenSvg from "@/assets/svg/14.svg?react";
import FifteenSvg from "@/assets/svg/15.svg?react";
import SixteenSvg from "@/assets/svg/16.svg?react";
import SeventeenSvg from "@/assets/svg/17.svg?react";
import EighteenSvg from "@/assets/svg/18.svg?react";
import NineteenSvg from "@/assets/svg/19.svg?react";
import TwentySvg from "@/assets/svg/20.svg?react";
import TwentyOneSvg from "@/assets/svg/21.svg?react";
import TwentyTwoSvg from "@/assets/svg/22.svg?react";
import TwentyThreeSvg from "@/assets/svg/23.svg?react";
import TwentyFourSvg from "@/assets/svg/24.svg?react";
import TwentyFiveSvg from "@/assets/svg/25.svg?react";
import TwentySixSvg from "@/assets/svg/26.svg?react";
import TwentyNineSvg from "@/assets/svg/29.svg?react";
import ThirtyOneSvg from "@/assets/svg/31.svg?react";
import ThirtyTwoSvg from "@/assets/svg/32.svg?react";
import ThirtyThreeSvg from "@/assets/svg/33.svg?react";
import ThirtyFourSvg from "@/assets/svg/34.svg?react";
import ThirtyFiveSvg from "@/assets/svg/35.svg?react";
import ThirtySixSvg from "@/assets/svg/36.svg?react";
import ThirtySevenSvg from "@/assets/svg/37.svg?react";
import ThirtyEightSvg from "@/assets/svg/38.svg?react";
import ThirtyNineSvg from "@/assets/svg/39.svg?react";
import FortySvg from "@/assets/svg/40.svg?react";
import FortyOneSvg from "@/assets/svg/41.svg?react";
import FortyTwoSvg from "@/assets/svg/42.svg?react";
import FortyThreeSvg from "@/assets/svg/43.svg?react";
import FortyFourSvg from "@/assets/svg/44.svg?react";

export const WEATHER_ICONS: Record<string, React.ReactNode> = {
  // Thunderstorm: <i className="fas fa-bolt text-yellow-500"></i>,
  // Rain: <i className="fas fa-cloud-showers-heavy text-blue-400"></i>,
  // Cloudy: <i className="fas fa-cloud text-gray-400"></i>,
  // Clear: <i className="fas fa-sun text-orange-400"></i>,
  // Sunny: <i className="fas fa-sun text-orange-400"></i>,
  // "Partly Cloudy": <i className="fas fa-cloud-sun text-yellow-400"></i>,
  // Windy: <i className="fas fa-wind text-teal-400"></i>,
  // Snow: <i className="fas fa-snowflake text-blue-200"></i>,
  // Chinese translations
  晴: <OneSvg />,
  大部分晴: <TwoSvg />,
  部分晴: <ThreeSvg />,
  间歇性云: <FourSvg />,
  朦胧的阳光: <FiveSvg />,
  间歇性多云: <FiveSvg />,
  大部分多云: <SixSvg />,
  多云: <SevenSvg />,
  阴: <EightSvg />,
  雾: <ElevenSvg />,
  寒冷: <ThirtyOneSvg />,
  冷: <ThirtyOneSvg />,
  小雨: <TwelveSvg />,
  多云转阵雨: <ThirteenSvg />,
  晴转阵雨: <FourteenSvg />,
  雷爆: <FifteenSvg />,
  多云转雷阵雨: <SixteenSvg />,
  晴朗伴有风暴: <SeventeenSvg />,
  雨: <EighteenSvg />,
  小雪: <NineteenSvg />,
  多云转小雪: <TwentySvg />,
  "大部分多云，有时有小雪": <TwentySvg />,
  局部晴朗伴有飘雪: <TwentyOneSvg />,
  雪: <TwentyTwoSvg />,
  多云伴有雪: <TwentyThreeSvg />,
  冰: <TwentyFourSvg />,
  冰雹: <TwentyFiveSvg />,
  冻雨: <TwentySixSvg />,
  雨夹雪: <TwentyNineSvg />,
  大风: <ThirtyTwoSvg />,
};

export const WEATHER_NIGNT_ICONS: Record<string, React.ReactNode> = {
  // Thunderstorm: <i className="fas fa-bolt text-yellow-500"></i>,
  // Rain: <i className="fas fa-cloud-showers-heavy text-blue-400"></i>,
  // Cloudy: <i className="fas fa-cloud text-gray-400"></i>,
  // Clear: <i className="fas fa-sun text-orange-400"></i>,
  // Sunny: <i className="fas fa-sun text-orange-400"></i>,
  // "Partly Cloudy": <i className="fas fa-cloud-sun text-yellow-400"></i>,
  // Windy: <i className="fas fa-wind text-teal-400"></i>,
  // Snow: <i className="fas fa-snowflake text-blue-200"></i>,
  // Chinese translations
  晴: <ThirtyThreeSvg />,
  大部分晴: <ThirtyFourSvg />,
  部分晴: <ThirtyFiveSvg />,
  间歇性云: <ThirtySixSvg />,
  朦胧的阳光: <ThirtySevenSvg />,
  部分多云: <ThirtyEightSvg />,
  大部分多云: <ThirtyEightSvg />,
  多云伴阵雨: <ThirtyNineSvg />,
  // 阴: <FortySvg />,
  // 雾: <FortyOneSvg />,
  // 小雨: <FortyTwoSvg />,
  多云转阵雨: <FortySvg />,
  雨: <FortySvg />,
  阵雨: <FortySvg />,
  雷爆: <FortyOneSvg />,
  多云转雷阵雨: <FortyTwoSvg />,
  小雪: <FortyThreeSvg />,
  雪: <FortyFourSvg />,
  多云伴有雪: <FortyFourSvg />,
  冰: <TwentyFourSvg />,
  冰雹: <TwentyFiveSvg />,
  冻雨: <TwentySixSvg />,
  雨夹雪: <TwentyNineSvg />,
  大风: <ThirtyTwoSvg />,
  寒冷: <ThirtyOneSvg />,
  冷: <ThirtyOneSvg />,
};

export const MOCK_VENUES = [
  { id: 1, name: "哈萨克斯坦 - KZ_01", location: "Astana" },
  { id: 2, name: "埃塞俄比亚 - ET_03", location: "Addis Ababa" },
  { id: 3, name: "美国 - TX_01", location: "Texas" },
];

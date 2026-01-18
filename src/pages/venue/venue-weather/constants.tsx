import React from "react";

export const WEATHER_ICONS: Record<string, React.ReactNode> = {
  Thunderstorm: <i className="fas fa-bolt text-yellow-500"></i>,
  Rain: <i className="fas fa-cloud-showers-heavy text-blue-400"></i>,
  Cloudy: <i className="fas fa-cloud text-gray-400"></i>,
  Clear: <i className="fas fa-sun text-orange-400"></i>,
  Sunny: <i className="fas fa-sun text-orange-400"></i>,
  "Partly Cloudy": <i className="fas fa-cloud-sun text-yellow-400"></i>,
  Windy: <i className="fas fa-wind text-teal-400"></i>,
  Snow: <i className="fas fa-snowflake text-blue-200"></i>,
  // Chinese translations
  晴: <i className="fas fa-sun text-orange-400"></i>,
  多云: <i className="fas fa-cloud-sun text-yellow-400"></i>,
  阴: <i className="fas fa-cloud text-gray-400"></i>,
  阵雨: <i className="fas fa-cloud-rain text-blue-300"></i>,
  雷阵雨: <i className="fas fa-bolt text-yellow-500"></i>,
  小雨: <i className="fas fa-cloud-showers-heavy text-blue-400"></i>,
  大雨: <i className="fas fa-cloud-showers-heavy text-blue-600"></i>,
};

export const MOCK_VENUES = [
  { id: 1, name: "哈萨克斯坦 - KZ_01", location: "Astana" },
  { id: 2, name: "埃塞俄比亚 - ET_03", location: "Addis Ababa" },
  { id: 3, name: "美国 - TX_01", location: "Texas" },
];

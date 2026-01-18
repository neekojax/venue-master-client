import React, { useEffect, useState } from "react";
import { fetchVenueList, fetchWeatherMonitoring } from "../api";
// import ForecastAlerts from "./components/ForecastAlerts";
import ForecastSection from "./components/ForecastSection";
import WeatherAlertList from "./components/WeatherAlertList";
import WeatherHero from "./components/WeatherHero";
import { ForecastDay, GeographicLocation, VenueWeather, WeatherAlert } from "./types";
import { useSelector, useSettingsStore } from "@/stores";

const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [selectedVenue, setSelectedVenue] = useState<number>(0);
  const [venueOptions, setVenueOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [realtimeWeather, setRealtimeWeather] = useState<VenueWeather | null>(null);
  const [forecastsDay, setForecastsDay] = useState<ForecastDay[]>([]);
  const [forecastsNight, setForecastsNight] = useState<ForecastDay[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<WeatherAlert[]>([]);
  const [geographicLocation, setGeographicLocation] = useState<GeographicLocation>({} as GeographicLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetchVenueList(poolType);
        const list = resp?.data?.data || resp?.data || [];
        const opts = (Array.isArray(list) ? list : []).map((v: any) => ({
          id: Number(v?.id ?? v?.venue_id ?? 0),
          name: String(v?.venue_name ?? v?.name ?? v?.venue_code ?? ""),
        }));
        setVenueOptions(opts);
        setSelectedVenue((prev) => (prev ? prev : opts.length ? opts[0].id : prev));
      } catch {
        setVenueOptions([]);
      }
    })();
  }, [poolType]);

  useEffect(() => {
    if (!selectedVenue) return;
    setLoading(true);
    (async () => {
      try {
        const resp = await fetchWeatherMonitoring(selectedVenue);
        const d: any = resp?.data?.data || resp?.data || {};
        const realtime_weather: any = d?.realtime_weather || {};
        const forecast_5days: any = d?.forecast_5days || {};
        const current: VenueWeather = {
          venue_name: String(realtime_weather?.venue_name ?? d?.venue_name ?? ""),
          date: String(realtime_weather?.last_updated ?? realtime_weather?.last_updated ?? ""),
          weather_condition: String(realtime_weather?.weather_condition ?? realtime_weather?.condition ?? ""),
          data_source: String(realtime_weather?.data_source ?? realtime_weather?.source ?? ""),
          temperature: Number(realtime_weather?.temperature ?? d?.temp ?? 0),
          humidity: Number(realtime_weather?.humidity ?? d?.rh ?? 0),
          wind_speed: Number(realtime_weather?.wind_speed ?? d?.wind_speed ?? d?.wind?.speed ?? 0),
          wind_gust_speed: Number(
            realtime_weather?.wind_gust_speed ?? d?.wind_gust_speed ?? d?.wind?.gust ?? 0,
          ),
          wind_direction: String(realtime_weather?.wind_direction ?? d?.wind?.direction_text ?? ""),
          precipitation: Number(realtime_weather?.precipitation ?? d?.rain ?? 0),
        };
        const forecastDays: ForecastDay[] = forecast_5days.daytime;

        const forecastNight: ForecastDay[] = forecast_5days.night;
        const alerts: WeatherAlert[] = d?.forecast_alerts?.records || [];
        setRealtimeWeather(current);
        setForecastsDay(forecastDays);
        setForecastsNight(forecastNight);
        setSystemAlerts(alerts);
        setGeographicLocation(d?.geographic_location || ({} as GeographicLocation));
        setLoading(false);
      } catch (_e) {
        setLoading(false);
      }
    })();
  }, [selectedVenue]);

  return (
    <div className="p-8 mx-auto w-full space-y-8">
      {/* Optimized Venue Selection Module */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex flex-col pr-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">监控场地</p>
            <div className="flex items-center space-x-2">
              <select
                className="bg-transparent border-none text-xl font-bold text-gray-800 focus:ring-0 p-0 pr-1 cursor-pointer appearance-none"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(Number(e.target.value))}
              >
                {venueOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down text-gray-400 text-xs mt-1"></i>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-gray-100 mx-4"></div>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <i className={`fas fa-arrows-rotate mr-2 ${loading ? "fa-spin" : ""}`}></i>
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          {loading || !realtimeWeather ? (
            <div className="h-96 bg-white rounded-xl shadow-sm animate-pulse flex items-center justify-center">
              <div className="text-gray-300 flex flex-col items-center">
                <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <span>正在加载气象卫星数据...</span>
              </div>
            </div>
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-wider">
                    <i className="fas fa-bolt-lightning mr-2 text-yellow-500"></i>
                    天气实时模块
                  </h3>
                </div>
                <WeatherHero data={realtimeWeather} />
              </section>

              <section>
                <ForecastSection forecastDays={forecastsDay} forecastNight={forecastsNight} />
                {/* <ForecastAlerts forecasts={forecasts} /> */}
              </section>
            </>
          )}
        </div>

        <div className="xl:col-span-1 space-y-8">
          <WeatherAlertList alerts={systemAlerts} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
              <h4 className="font-bold text-gray-800 text-sm tracking-tight uppercase">地理位置中心</h4>
              <i className="fas fa-map-location-dot text-gray-400"></i>
            </div>
            <div className="p-5 space-y-6">
              <div className="relative pl-6 border-l-2 border-dashed border-gray-100 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    场地中心坐标
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-800">
                    {geographicLocation?.venue_coordinates}
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    数据源 (Ambient)
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-800">
                    {geographicLocation?.data_source_coordinates}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-ruler-horizontal text-blue-500 text-xs"></i>
                  <span className="text-xs font-bold text-blue-700">直线距离</span>
                </div>
                <span className="text-sm font-bold text-blue-800">{geographicLocation?.distance} 公里</span>
              </div>

              <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative group">
                <img
                  src="https://picsum.photos/seed/kz-map/600/400"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="map"
                />
                <div className="absolute inset-0 bg-gray-900/10 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-2xl animate-ping opacity-75"></div>
                  <div className="absolute top-0 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-[8px] font-bold text-gray-600">
                  卫星图层
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

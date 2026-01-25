import React, { useEffect, useState } from "react";
import { Button, Input, Switch } from "antd";
import { fetchVenueList, fetchWeatherMonitoring, fetchWeatherMonitoringDetail } from "../api";
import ForecastAlerts from "./components/ForecastAlerts";
import ForecastSection from "./components/ForecastSection";
import WeatherAlertList from "./components/WeatherAlertList";
import WeatherHero from "./components/WeatherHero";
import { ForecastDay, GeographicLocation, VenueWeather, VenueWeatherAlert, WeatherAlert } from "./types";
import { useSelector, useSettingsStore } from "@/stores";

const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [selectedVenue, setSelectedVenue] = useState<number>(0);
  const [refresh, setRefresh] = useState<number>(0);
  const [allVenueOptions, setAllVenueOptions] = useState<
    Array<{ id: number; name: string; collection: number }>
  >([]);
  const [venueOptions, setVenueOptions] = useState<Array<{ id: number; name: string; collection: number }>>(
    [],
  );
  const [realtimeWeather, setRealtimeWeather] = useState<VenueWeather | null>(null);
  const [forecastsDay, setForecastsDay] = useState<ForecastDay[]>([]);
  const [forecastsNight, setForecastsNight] = useState<ForecastDay[]>([]);
  const [forecasts, setForecasts] = useState<VenueWeatherAlert[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<WeatherAlert[]>([]);
  const [systemAllAlerts, setSystemAllAlerts] = useState<WeatherAlert[]>([]);
  const [alertsKey, setAlertsKey] = useState<number>(0);
  const alertTypesIndexRef = React.useRef<
    Record<string, Array<{ id: number; name: string; collection: number }>>
  >({});
  const [showCollectionOnly, setShowCollectionOnly] = useState(() => {
    // 初始化时从 localStorage 取值
    return localStorage.getItem("showCollectionOnly") === "true";
  });

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [venueResp, monitorResp, detailResp] = await Promise.all([
        fetchVenueList(poolType),
        selectedVenue ? fetchWeatherMonitoring(selectedVenue) : Promise.resolve(null),
        selectedVenue ? fetchWeatherMonitoringDetail(selectedVenue) : Promise.resolve(null),
      ]);
      const venueList = venueResp?.data?.data || venueResp?.data || [];
      const opts = (Array.isArray(venueList) ? venueList : [])
        .filter((v: any) => Number(v?.is_valid ?? 1) === 1)
        .map((v: any) => ({
          id: Number(v?.id ?? v?.venue_id ?? 0),
          name: String(v?.venue_name ?? v?.name ?? v?.venue_code ?? ""),
          collection: Number(v?.collection ?? 0),
        }));
      setAllVenueOptions(opts);
      const finalOpts = showCollectionOnly ? opts.filter((v) => v.collection > 0) : opts;
      setVenueOptions(finalOpts);
      if (!selectedVenue) {
        setSelectedVenue(finalOpts.length ? finalOpts[0].id : 0);
      }
      if (monitorResp) {
        const d: any = monitorResp?.data?.data || monitorResp?.data || {};
        const realtime_weather: any = d?.realtime_weather || {};
        const forecast_5days: any = d?.forecast_5days || {};
        const current: VenueWeather = {
          icon_id: Number(realtime_weather?.icon_id ?? d?.icon_id ?? 0),
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
          timezone: String(realtime_weather?.timezone ?? d?.timezone ?? ""),
        };
        const forecastDays: ForecastDay[] = forecast_5days.daytime;
        const forecastNight: ForecastDay[] = forecast_5days.night;
        setRealtimeWeather(current);
        setForecastsDay(forecastDays);
        setForecastsNight(forecastNight);
        setForecasts(d?.forecast_alerts?.records || []);
        setGeographicLocation(d?.geographic_location || ({} as GeographicLocation));
      }
      if (detailResp) {
        const raw = detailResp?.data?.data || detailResp?.data || [];
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.records) ? raw.records : [];
        const alerts: WeatherAlert[] = list.map((a: any, i: number) => ({
          id: Number(a?.id ?? i),
          venue_id: Number(a?.venue_id ?? selectedVenue),
          type: String(a?.type ?? a?.alert_type ?? a?.title ?? ""),
          affected_area: String(a?.affected_area ?? a?.area ?? a?.region ?? ""),
          start_time: String(a?.start_time ?? a?.start ?? a?.begin_time ?? ""),
          end_time: String(a?.end_time ?? a?.end ?? a?.finish_time ?? ""),
          description: String(a?.description ?? a?.desc ?? a?.content ?? ""),
          summary: String(a?.summary ?? a?.title ?? ""),
          source: String(a?.source ?? a?.origin ?? ""),
          url: String(a?.url ?? a?.link ?? ""),
          created_at: String(a?.created_at ?? ""),
          updated_at: String(a?.updated_at ?? ""),
          alert_id: String(a?.alert_id ?? ""),
          timezone: String(a?.timezone ?? ""),
          is_notified: Number(a?.is_notified ?? 0),
          notified_at: a?.notified_at ?? null,
          venue_name: String(a?.venue_name ?? ""),
          collection: Number(a?.collection ?? 0),
        }));
        setSystemAllAlerts(alerts);
        setSystemAlerts(showCollectionOnly ? alerts.filter((a) => a.collection > 0) : alerts);
        const typeMap: Record<string, Array<{ id: number; name: string; collection: number }>> = {};
        alerts.forEach((a) => {
          const k = a.type || "";
          const item = { id: a.venue_id, name: a.venue_name, collection: a.collection };
          const arr = (typeMap[k] ??= []);
          if (!arr.some((it) => it.id === item.id)) {
            arr.push(item);
          }
        });
        alertTypesIndexRef.current = typeMap;
      }
      setRefresh(0);
    } catch {
      setSystemAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   // 每次 showCollectionOnly 变化时，同步更新 localStorage
  //   localStorage.setItem("showCollectionOnly", String(showCollectionOnly));
  // }, [showCollectionOnly]);

  const [geographicLocation, setGeographicLocation] = useState<GeographicLocation>({} as GeographicLocation);
  const [loading, setLoading] = useState(true);
  const [showSiteFilter, setShowSiteFilter] = useState(false);
  const [filters, setFilters] = useState<{ siteName: string }>({ siteName: "" });
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [alertTypeFilter, setAlertTypeFilter] = useState<string | null>(null);
  const selectedVenueName = venueOptions.find((v) => v.id === selectedVenue)?.name || "选择场地";
  const handleFilterChange = (key: "siteName", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    setSelectedVenue(venueOptions.length ? venueOptions[0].id : 0);
  }, [venueOptions]);

  useEffect(() => {
    if (!selectedVenue) return;
    if (systemAllAlerts && systemAllAlerts.length > 0 && refresh == 0) {
      if (showCollectionOnly) {
        setSystemAlerts(systemAllAlerts.filter((a) => a.collection > 0));
      } else {
        setSystemAlerts(systemAllAlerts);
      }
      return;
    }
    (async () => {
      try {
        const resp = await fetchWeatherMonitoringDetail(selectedVenue);
        const raw = resp?.data?.data || resp?.data || [];
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.records) ? raw.records : [];
        const alerts: WeatherAlert[] = list.map((a: any, i: number) => ({
          id: Number(a?.id ?? i),
          venue_id: Number(a?.venue_id ?? selectedVenue),
          type: String(a?.type ?? a?.alert_type ?? a?.title ?? ""),
          affected_area: String(a?.affected_area ?? a?.area ?? a?.region ?? ""),
          start_time: String(a?.start_time ?? a?.start ?? a?.begin_time ?? ""),
          end_time: String(a?.end_time ?? a?.end ?? a?.finish_time ?? ""),
          description: String(a?.description ?? a?.desc ?? a?.content ?? ""),
          summary: String(a?.summary ?? a?.title ?? ""),
          source: String(a?.source ?? a?.origin ?? ""),
          url: String(a?.url ?? a?.link ?? ""),
          created_at: String(a?.created_at ?? ""),
          updated_at: String(a?.updated_at ?? ""),
          alert_id: String(a?.alert_id ?? ""),
          timezone: String(a?.timezone ?? ""),
          is_notified: Number(a?.is_notified ?? 0),
          notified_at: a?.notified_at ?? null,
          venue_name: String(a?.venue_name ?? ""),
          collection: Number(a?.collection ?? 0),
        }));
        setSystemAllAlerts(alerts);
        if (showCollectionOnly) {
          setSystemAlerts(alerts.filter((a) => a.collection > 0));
        } else {
          setSystemAlerts(alerts);
        }
        const typeMap: Record<string, Array<{ id: number; name: string; collection: number }>> = {};
        alerts.forEach((a) => {
          const k = a.type || "";
          const item = { id: a.venue_id, name: a.venue_name, collection: a.collection };
          (typeMap[k] ??= []).push(item);
        });
        alertTypesIndexRef.current = typeMap;
        setRefresh(0);
      } catch {
        setSystemAlerts([]);
      }
    })();
  }, [selectedVenue, showCollectionOnly, refresh]);

  useEffect(() => {
    if (systemAlerts.length === 0) {
      setAlertsKey((k) => k + 1);
    }
  }, [systemAlerts]);

  useEffect(() => {
    setSelectedSites(selectedVenue ? [selectedVenue] : []);
  }, [selectedVenue, showSiteFilter]);

  useEffect(() => {
    // 当选择了告警类型筛选时，用该类型下的场地替代列表
    if (alertTypeFilter) {
      const items = alertTypesIndexRef.current[alertTypeFilter] || [];
      let opts = items.map((it) => ({
        id: Number(it.id),
        name: String(it.name),
        collection: Number(it.collection ?? 0),
      }));
      if (showCollectionOnly) {
        opts = opts.filter((v) => v.collection > 0);
      }
      setVenueOptions(opts);
      setSelectedVenue(opts.length ? opts[0].id : 0);
      return;
    }
    // 默认逻辑：使用完整场地列表
    if (allVenueOptions && allVenueOptions.length > 0) {
      if (showCollectionOnly) {
        setVenueOptions(allVenueOptions.filter((v) => v.collection > 0));
      } else {
        setVenueOptions(allVenueOptions);
      }
      return;
    }
    (async () => {
      try {
        const resp = await fetchVenueList(poolType);
        const list = resp?.data?.data || resp?.data || [];
        const opts = (Array.isArray(list) ? list : [])
          .filter((v: any) => Number(v?.is_valid ?? 1) === 1)
          .map((v: any) => ({
            id: Number(v?.id ?? v?.venue_id ?? 0),
            name: String(v?.venue_name ?? v?.name ?? v?.venue_code ?? ""),
            collection: Number(v?.collection ?? 0),
          }));
        setAllVenueOptions(opts);
        if (showCollectionOnly) {
          setVenueOptions(opts.filter((v) => v.collection > 0));
        } else {
          setVenueOptions(opts);
        }
        setSelectedVenue(opts.length ? opts[0].id : 0);
      } catch {
        setVenueOptions([]);
      }
    })();
  }, [poolType, showCollectionOnly, alertTypeFilter]);

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
          icon_id: Number(realtime_weather?.icon_id ?? d?.icon_id ?? 0),
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
          timezone: String(realtime_weather?.timezone ?? d?.timezone ?? ""),
        };
        const forecastDays: ForecastDay[] = forecast_5days.daytime;

        const forecastNight: ForecastDay[] = forecast_5days.night;
        setRealtimeWeather(current);
        setForecastsDay(forecastDays);
        setForecastsNight(forecastNight);
        setForecasts(d?.forecast_alerts?.records || []);
        setGeographicLocation(d?.geographic_location || ({} as GeographicLocation));
        setLoading(false);
      } catch (_e) {
        setLoading(false);
        setRefresh(0);
      }
    })();
  }, [selectedVenue, refresh]);

  return (
    <div className="p-8 mx-auto w-full space-y-8">
      {/* <TwentyFourSvg /> */}
      {/* Optimized Venue Selection Module */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center relative">
            <div className="flex flex-col pr-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">监控场地</p>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSiteFilter((prev) => !prev)}
                  className="bg-transparent border-none text-xl font-bold text-gray-800 focus:outline-none p-0 pr-1 cursor-pointer flex items-center"
                >
                  <span>{selectedVenueName}</span>
                  <i
                    className={`fas fa-chevron-down text-gray-400 text-xs ml-2 ${showSiteFilter ? "rotate-180" : ""}`}
                  ></i>
                </button>
              </div>
            </div>

            <span style={{ marginTop: "10px" }}>
              <Switch size="small" checked={showCollectionOnly} onChange={setShowCollectionOnly} />
              {"  "}
              <span style={{ marginRight: "10px" }}>我的自选</span>
            </span>

            <div className="h-10 w-[1px] bg-gray-100 mx-4"></div>
            {showSiteFilter && (
              <div className="site-filter-dropdown absolute right-0 top-full mt-2 w-80 bg-white rounded-lg z-20 shadow-lg border border-gray-200 p-4">
                <div className="font-medium text-gray-900 mb-3">选择场地</div>
                <Input
                  size="middle"
                  placeholder="搜索场地..."
                  className="mb-3"
                  value={filters.siteName}
                  onChange={(e) => {
                    handleFilterChange("siteName", e.target.value);
                  }}
                />
                <div className="max-h-60 overflow-y-auto">
                  {(venueOptions || [])
                    .filter((v) => v.name.includes(filters.siteName))
                    .map((v, index) => (
                      <div key={v.id} className="flex items-center py-2 hover:bg-gray-50 rounded">
                        <input
                          type="radio"
                          id={`site-${index}`}
                          name="site-radio-group"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedSites[0] === v.id}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSites([v.id]);
                            }
                          }}
                        />
                        <label
                          htmlFor={`site-${index}`}
                          className="ml-2 text-gray-700 cursor-pointer flex-grow"
                        >
                          {v.name}
                        </label>
                      </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <Button size="small" onClick={() => setShowSiteFilter(false)}>
                    取消
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      const pick = selectedSites[0];
                      if (pick) {
                        setSelectedVenue(pick);
                      }
                      setShowSiteFilter(false);
                    }}
                  >
                    应用
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div
            className="rounded text-[11px] bg-red-50 border border-red-200 shadow-sm border border-gray-100 overflow-hidden"
            style={{ marginRight: "20px" }}
          >
            {/* <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
              <h4 className="font-bold text-gray-800 text-sm tracking-tight uppercase">告警类型筛选</h4>
            </div> */}
            <div className="p-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setAlertTypeFilter(null)}
              >
                全部场地
              </button>
              {Object.keys(alertTypesIndexRef.current || {}).map((k) => {
                const isActive = alertTypeFilter === k;
                const style = isActive
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
                return (
                  <button
                    key={k}
                    type="button"
                    className={`${style} px-3 py-1.5 text-xs rounded border`}
                    onClick={() => {
                      setAlertTypeFilter(k);
                      const items = alertTypesIndexRef.current[k] || [];
                      let opts = items.map((it) => ({
                        id: Number(it.id),
                        name: String(it.name),
                        collection: Number(it.collection ?? 0),
                      }));
                      if (showCollectionOnly) {
                        opts = opts.filter((v) => v.collection > 0);
                      }
                      // console.log(opts);
                      setVenueOptions(opts);
                      setSelectedVenue(opts.length ? opts[0].id : 0);
                    }}
                  >
                    {k}预警({alertTypesIndexRef.current?.[k]?.length || 0})
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={refreshAll}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <i className={`fas fa-arrows-rotate mr-2 ${loading ? "fa-spin" : ""}`}></i>
            刷新数据
          </button>
        </div>
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
                <ForecastSection
                  basicData={realtimeWeather}
                  forecastDays={forecastsDay}
                  forecastNight={forecastsNight}
                />
                <ForecastAlerts forecasts={forecasts} />
              </section>
            </>
          )}
        </div>

        <div className="xl:col-span-1 space-y-8">
          <WeatherAlertList
            key={alertsKey}
            alerts={systemAlerts}
            onSelectSites={(ids) => setSelectedSites(ids)}
            onSelectVenue={(id) => setSelectedVenue(id)}
          />

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

# 故障预测接入

依据后端 `docs/故障机预测-接口对接文档.md`（2026-11-18）实现。原故障监控已独立为 `../FaultMonitoring.tsx`；顶部 Tab 保留组件状态，第一次进入预测时直接加载数据。

## 本地运行

`npm run dev` 后，Vite 将同源 `/api/fault-predictions` 原样代理到 `http://127.0.0.1:8090`。不附加 `/admin-api`，不改动运营系统原请求。修改 Vite 配置后需重启开发服务。

预测接口在开发和正式环境均无需 Token、API Key 或维修账号；预测请求不读取 Cookie，不附加 Authorization，运营系统普通账号即可读取。头部组织为 `CANG` 时使用 `group_id=1`，其他组织使用 `group_id=2`，进入预测 Tab 直接请求数据，不显示组织选择或切换按钮。头部组织切换后，仍按对应 poolType 加载当前系统场地列表，并重置预测场地、筛选与分页，查询缓存也保持隔离。

场地展示复用当前系统 `useVenueList(poolType)`，即 `/venue/listVenue/{poolType}`。预测 `/sites` 仅用于将场地名称唯一映射到预测库 `site_id`：两侧名称去除首尾空白后必须精确匹配，且两侧均无重名。只展示唯一匹配的场地；缺失、空名称及重名项隐藏，不直接混用两个数据库 ID。切换 poolType 重置预测场地及分页。网段下钻同样要求能唯一匹配当前系统场地。

## 请求约定

所有请求无需鉴权头；Query 含 `group_id`、可选正整数 `site_id` 与 `days=7`。PATCH 同样携带 Query 范围，使用机器的 `alert_id`、最新 `alert_version`；不混用各表 ID。

- `GET /sites`：仅作名称到预测场地 ID 的映射，不作为下拉列表数据源，不传 site_id。
- `GET /overview`：只传公共范围。展示 summary/categories/snapshots/sync/notes；缺少 snapshot 与零异常分开提示。
- `GET /site-rankings`：使用当前组织和可选场地范围，返回 `abnormal_top5/high_risk_top5`，左侧展示故障设备 TOP5 环形图，右侧使用 overview.trend 展示七天故障趋势；占比只针对各自 TOP5 合计，按接口顺序展示，不补零凑满5个场地。
- `GET /machines`：`severity/category/keyword/status/network/page/limit`，总数取 `pagination.total`。
- `GET /machines/:id`：`page/limit` 只分页原始 logs，使用 `log_pagination.total`；展示 machine/daily/repairs/actions。
- `GET /clusters`：`page/limit`、可选 `concentrated=true`，仅按 IP 网段聚合；下钻同时传 site_id/network/category。
- `GET /parts`：只传公共范围，显示疑似标识数而非采购数量。
- `PATCH /alerts/:alert_id`：`status/version/note/owner_name/fault_id?`。所有状态必须填写 note，processing 必须填写负责人。成功刷新预测查询；409 获取最新详情并锁定提交，由用户核对并重置表单后再次填写提交，不自动重试覆盖。

响应读取 `{ code: 0, data, msg }`，错误优先显示 `msg`，兼容认证中间件 `error`；各查询独立失败及重试。接口字段使用后端 snake_case，见 `types.ts`。

时间显式显示为 Asia/Shanghai；daily 日期取前10位；维修历史原始完成时间保持原值。饼图仅表示榜单内分布，不表示故障率或全部场地占比；空榜单独立显示空状态，请求失败显示错误和重试，不显示为0。不展示未支持的框箱、持续故障、实测算力、老化、库存和采购推断。

## 部署

生产服务器也需要配置同源 `/api/fault-predictions` 反向代理至维修服务。Vite 开发代理不包含在构建产物中，不能把生产浏览器请求中的 localhost 当作服务器地址。

需部署并重启已取消预测接口鉴权的后端，并确保反向代理未给该路径附加维修账号认证。`group_id/site_id` 为数据筛选条件，不校验组织成员或分配场地。其他运营系统请求继续使用原有登录流程。出现 401/403 时保留运营系统登录状态，并检查后端版本或代理配置。


## 场地 TOP5 饼图

图表区域统一为监控大盘风格：左侧“故障设备 TOP5”环形图及场地明细，右侧“七天故障趋势”折线图（设备标识数、故障日志数）。移除高风险 TOP5 饼图。查询 key 包含随机会话与场地 ID，切换组织/场地后不会复用其他范围的数据；顶部刷新也刷新榜单。接口通过同源代理公开读取，无需维修账号或 Cookie Token，也不在浏览器写入 API Key。

鼠标提示显示完整场地名、数量和 TOP5 内占比，图下方列表显示场地名与对应数量。空榜单显示明确空状态，API失败支持单独重试。饼图不显示0值场地，不声称库存、老化或故障率；故障设备的计数仍采用维修后端设备标识口径。

后端需要包含 `GET /api/fault-predictions/site-rankings` 路由，新增接口后需重启维修服务；生产仍需配置同源反向代理。

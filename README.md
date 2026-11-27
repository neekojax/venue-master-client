# 矿场运营管理系统前端

`venue-master-client` 是矿场运营人员使用的 Web 应用，用于查看场地和矿机状态、核对算力、跟踪异常、导出运营报表，以及管理账号和权限。前端采用 React 18、TypeScript 和 Vite，使用 Ant Design 构建界面、ECharts 展示趋势、TanStack Query 管理接口数据。

## 本地运行

开发主分支为 `master`。本地可使用 UAT 已验证的 Node.js `22.23.4`。首次开发时，克隆仓库、安装依赖并启动 Vite。

```bash
git clone https://github.com/neekojax/venue-master-client.git
cd venue-master-client
npm install
npm run dev
```

打开终端输出的本地地址。默认开发配置会请求 `https://datastring.cc/admin-api`。联调本机后端时，在仓库根目录创建 `.env.development.local`，填写以下两项，再重启开发服务。

```dotenv
VITE_APP_API_URL=/admin-api
VITE_DEV_PROXY_TARGET=http://localhost:8080
```

将第二行的端口改为本机后端的监听端口。Vite 会把浏览器的 `/admin-api/...` 原样转发给该服务。本地覆盖文件已由 Git 忽略。

## 构建与部署

当前 `master` 的生产和 UAT 构建共用 `package.json` 中的 `build` 脚本。两者都会执行 TypeScript 检查和 Vite 打包，生成 `dist/`。配置选择逻辑见 [vite.config.ts](./vite.config.ts)。

| 部署场景 | 构建命令 | Vite 配置文件 | 浏览器使用的主 API |
| --- | --- | --- | --- |
| 自有服务器（生产） | `npm run build` | [.env.production](./.env.production) | `https://datastring.cc/admin-api` |
| 公司 CI/CD（UAT） | Jenkins 执行 `pnpm build` | [.env.uat](./.env.uat) | 同域 `/admin-api`，即 `https://ops-uat.ecohash-inc.com/admin-api` |

### 生产发布

在仓库根目录执行 `npm run build`，把新生成的 `dist/` 内容发布到 Web 服务器的站点根目录。页面地址由站点域名决定，主 API 地址在构建时写入前端产物。生产配置的登录 Cookie 域为 `.datastring.cc`，部署域名需能写入该 Cookie。

本地预览构建产物可运行 `npm run preview`。部署到 Nginx 时，让应用页面路由回退到 `index.html`，以支持直接打开或刷新场地详情等页面。

### UAT 发布

1. 在公司 CI/CD 中为 `mining-ops-front/uat` 选择 GitLab 的 `uat` 分支并触发构建。Jenkins 检出该分支的提交，并将提交号记入构建记录。
2. Jenkins 执行 `pnpm i` 和 `pnpm build`。项目锁定 pnpm `10.5.0`。当待发布代码包含当前 `master` 的构建逻辑时，`APP_NAME=mining-ops-front` 和 `ENV=uat` 会使 Vite 选择 `uat` 模式，日志显示 `building for uat...`。
3. 构建成功后，流水线将 `dist/` 打包并自动通过 Ansible 发布到 Nginx。发布后可在首页源码中核对入口 JS 文件名是否与该次构建日志一致。[UAT 运营管理系统](https://ops-uat.ecohash-inc.com/)

排查旧版时，先看 Jenkins 实际检出的提交。例如 `7ba2d3c7` 构建时使用 Vite 默认的 `production` 模式，其 UAT 地址配在该提交的 [.env.production](https://git.ecohash-inc.com/mining/venue-master-client/-/blob/7ba2d3c75e2b235bda9f5cddaf48ff8dcb6d981e/.env.production)。

UAT 页面启动时加载 `/admin-api/runtime-config.js`。登录 Cookie 的共享域、资产系统和维修系统的跳转地址优先取后端返回值，字段为空时回退到 `.env.uat`。Cookie 域的兜底值为空，因此默认只在当前主机生效。主 API 始终使用同域的 `/admin-api`。[运行时配置读取代码](./src/utils/runtime-config.ts)

故障预测另走 `/api/fault-predictions`。本地 Vite 将它转发到 `http://127.0.0.1:8090`，部署后由站点网关将这条路径转发到维修服务。[故障预测接入说明](./src/pages/fault-machine-monitor/prediction/README.md)

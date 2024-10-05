# VitePress构建及发布到GithubPage

## vitepress构建

> [!TIP]
>
> 建议去查看官方文档的构建过程及初始化配置等

## 发布

* GitHub创建自己的仓库并将settings->pages->develpment... 改为actions

* 创建好仓库后加下来再源码的根目录当中建一个 ` .github/workflows/deploy.yml` 文件夹及文件

* 在yml文件中编辑如下

  ```yaml
  # 用于构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
  #
  name: Deploy VitePress site to Pages
  
  on:
    # 针对 `main` 分支的推送上运行。
    # 如果你使用 `master` 作为默认分支，请将其更改为 `master`
    push:
      branches: [main]
  
    # Allows you to run this workflow manually from the Actions tab
    workflow_dispatch:
  
  # Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
  permissions:
    contents: read
    pages: write
    id-token: write
  
  # Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
  # However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
  concurrency:
    group: pages
    cancel-in-progress: false
  
  jobs:
    # Build job
    build:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v3
          with:
            fetch-depth: 0 # Not needed if lastUpdated is not enabled
        # - uses: pnpm/action-setup@v2 # Uncomment this if you're using pnpm
        # - uses: oven-sh/setup-bun@v1 # Uncomment this if you're using Bun
        - name: Setup Node
          uses: actions/setup-node@v3
          with:
            node-version: 20
        - name: Install pnpm
          run: npm install -g pnpm # or npm install -g yarn / npm install -g bun
        - name: Setup Pages
          uses: actions/configure-pages@v3
        - name: Install dependencies
          run: pnpm install # or pnpm install / yarn install / bun install
        - name: Build with VitePress
          run: pnpm run docs:build # or pnpm run docs:build / yarn docs:build / bun build
        - name: Upload artifact
          uses: actions/upload-pages-artifact@v2
          with:
            path: .vitepress/dist
  
    # Deployment job
    deploy:
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      needs: build
      runs-on: ubuntu-latest
      name: Deploy
      steps:
        - name: Deploy to GitHub Pages
          id: deployment
          uses: actions/deploy-pages@v2
  ```

  

* > [!IMPORTANT]
  >
  > 注意：一定要将自己项目的 ` .vitepress\config.ts` 文件的` base`配置项改为自己的仓库名

* 将代码通过git提交到自己的仓库

* 然后就可以等待仓库代码上方的` Actions`里面的提交加载完毕（圆圈变绿打勾）

* 最后访问地址`https://[用户名].github.io/[仓库名]/`就可以看到自己发布的静态网站了
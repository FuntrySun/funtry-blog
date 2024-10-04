import { defineConfig } from 'vitepress'
/**
 * 项目配置文件
 */
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "小蚁聚合支付平台",
  description: "平台为打造一站式支付提供便宜",
  head: [
    ['link',{rel:'icon',href:'/favicon.ico'}],
    ['link',{ rel: 'preconnect', href: 'https://fonts.googleapis.com' }]
  ],

  themeConfig: {
    // logo
    logo: "/ant.png",
    //导航栏
    nav: [
      { text: '主页', link: '/' },
      { text: 'Api文档', link: '/markdown-examples' },
      {text:'用户登录/注册',link:'/login'},
      {text:'关于我们/联系',link:'/pages/about/about'}
    ],
    //侧边栏
    sidebar: [
      {
        text: '平台相关',
        items: [
          { text: '小蚁是？', link: '/pages/introduce' },
          { text: '收费情况', link: '/pages/price' }
        ]
      },
      {
        text:'服务与产品',
        link:'/pages/service',
        items:[
          {text:'聚合支付',link:'/pages/pay'},
          {text:'聚合转账',link:'/pages/transfer'},
          {text:'聚合代付',link:'/pages/pay'}
        ]
      },
      {
        text:'收费标准及优惠政策',
        link:'/pages/service',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'客户案例',
        link:'/pages/service',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'安全与合规',
        link:'/pages/safe/safe',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      }
    ],
    //社交链接
    socialLinks: [
      { icon: 'discord', link: 'https://github.com/vuejs/vitepress' }
    ],

    //页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },
    // 全局搜索
    search:{
      provider:'local'
    },
    // 最后更新链接
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
})
